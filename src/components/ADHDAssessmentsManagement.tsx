import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Send, Eye, Trash2, Loader2, Mail, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ADHD710ParentReport from './ADHD710ParentReport';
import ADHD710CoachReport from './ADHD710CoachReport';
import { calculateNIPPScores, getSeverityLabel710, scoreToPercentage } from '../data/adhd710AssessmentQuestions';

interface ADHDAssessmentsManagementProps {
  franchiseOwnerId: string;
  isSuperAdmin?: boolean;
}

export function ADHDAssessmentsManagement({ franchiseOwnerId, isSuperAdmin = false }: ADHDAssessmentsManagementProps) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'parent-report' | 'coach-report'>('list');

  const [formData, setFormData] = useState({
    child_name: '',
    child_age: 7,
    parent_name: '',
    parent_email: '',
    teacher_name: '',
    teacher_email: ''
  });

  const [creating, setCreating] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [sendingReports, setSendingReports] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, [franchiseOwnerId]);

  const loadAssessments = async () => {
    try {
      let query = supabase
        .from('adhd_assessments')
        .select(`
          *,
          adhd_assessment_responses (*)
        `);

      // Super admins see all assessments, regular users see only their own
      if (!isSuperAdmin) {
        query = query.eq('franchise_owner_id', franchiseOwnerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Create assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('adhd_assessments')
        .insert({
          child_name: formData.child_name,
          child_age: formData.child_age,
          franchise_owner_id: franchiseOwnerId,
          created_by_email: formData.parent_email,
          status: 'pending'
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Create placeholder for parent response
      const { error: parentError } = await supabase
        .from('adhd_assessment_responses')
        .insert({
          assessment_id: assessment.id,
          respondent_type: 'parent',
          respondent_name: formData.parent_name,
          respondent_email: formData.parent_email,
          respondent_relationship: 'parent',
          completed: false
        });

      if (parentError) throw parentError;

      // Create placeholder for teacher response
      const { error: teacherError } = await supabase
        .from('adhd_assessment_responses')
        .insert({
          assessment_id: assessment.id,
          respondent_type: 'caregiver',
          respondent_name: formData.teacher_name,
          respondent_email: formData.teacher_email,
          respondent_relationship: 'teacher',
          completed: false
        });

      if (teacherError) throw teacherError;

      // Send parent invitation
      const parentLink = `${window.location.origin}/adhd710/${assessment.id}/parent`;
      alert(`Assessment created! Parent link: ${parentLink}\n\nShare this link with ${formData.parent_name}`);

      // Reset form and reload
      setFormData({
        child_name: '',
        child_age: 7,
        parent_name: '',
        parent_email: '',
        teacher_name: '',
        teacher_email: ''
      });
      setShowCreateModal(false);
      loadAssessments();
    } catch (error: any) {
      console.error('Error creating assessment:', error);
      alert('Error creating assessment: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSendTeacherInvitation = async (assessment: any) => {
    setSendingInvite(assessment.id);

    try {
      const teacherResponse = assessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'caregiver');
      if (!teacherResponse) throw new Error('Teacher information not found');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adhd710-teacher-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          assessmentId: assessment.id,
          teacherName: teacherResponse.respondent_name,
          teacherEmail: teacherResponse.respondent_email,
          childName: assessment.child_name,
          childAge: assessment.child_age,
          parentName: assessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'parent')?.respondent_name || 'Parent'
        })
      });

      if (!response.ok) throw new Error('Failed to send invitation');

      alert('Teacher invitation sent successfully!');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      alert('Error sending invitation: ' + error.message);
    } finally {
      setSendingInvite(null);
    }
  };

  const handleSendReports = async (assessment: any) => {
    setSendingReports(assessment.id);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adhd710-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          assessmentId: assessment.id
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to send reports');
      }

      alert('Reports sent successfully to parent and teacher!');
    } catch (error: any) {
      console.error('Error sending reports:', error);
      alert('Error sending reports: ' + error.message);
    } finally {
      setSendingReports(null);
    }
  };

  const handleViewReport = async (assessment: any, type: 'parent' | 'coach') => {
    setSelectedAssessment(assessment);
    setViewMode(type === 'parent' ? 'parent-report' : 'coach-report');
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('adhd_assessments')
        .delete()
        .eq('id', assessmentId);

      if (error) throw error;

      loadAssessments();
    } catch (error: any) {
      console.error('Error deleting assessment:', error);
      alert('Error deleting assessment: ' + error.message);
    }
  };

  const getStatusBadge = (assessment: any) => {
    const status = assessment.status;

    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      parent_completed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', text: 'Parent Complete' },
      caregiver_completed: { icon: CheckCircle, color: 'bg-purple-100 text-purple-800', text: 'Teacher Complete' },
      both_completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Complete' }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  if (viewMode === 'parent-report' && selectedAssessment) {
    const parentResponse = selectedAssessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'parent');
    const teacherResponse = selectedAssessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'caregiver');

    if (!parentResponse?.scores || !teacherResponse?.scores) {
      return (
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">Assessment not yet complete</p>
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedAssessment(null);
            }}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to list
          </button>
        </div>
      );
    }

    const parentNIPP = parentResponse.scores.nippScores;
    const teacherNIPP = teacherResponse.scores.nippScores;

    const patterns = Object.keys(parentNIPP).map(code => {
      const parentScore = parentNIPP[code];
      const teacherScore = teacherNIPP[code];
      const combinedScore = (parentScore + teacherScore) / 2;

      return {
        code,
        name: code,
        category: code === 'FOC' || code === 'HYP' || code === 'IMP' || code === 'ORG' || code === 'DIM' ? 'Core ADHD' : 'Emotional/Impact',
        parentScore,
        teacherScore,
        combinedScore,
        parentLabel: getSeverityLabel710(parentScore),
        teacherLabel: getSeverityLabel710(teacherScore),
        combinedLabel: getSeverityLabel710(combinedScore),
        percentage: scoreToPercentage(combinedScore)
      };
    });

    return (
      <div>
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedAssessment(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Assessments
            </button>
          </div>
        </div>
        <ADHD710ParentReport
          childInfo={{
            name: selectedAssessment.child_name,
            age: selectedAssessment.child_age
          }}
          parentInfo={{
            name: parentResponse.respondent_name
          }}
          teacherInfo={{
            name: teacherResponse.respondent_name,
            email: teacherResponse.respondent_email
          }}
          patterns={patterns}
          date={new Date(selectedAssessment.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        />
      </div>
    );
  }

  if (viewMode === 'coach-report' && selectedAssessment) {
    const parentResponse = selectedAssessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'parent');
    const teacherResponse = selectedAssessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'caregiver');

    if (!parentResponse?.scores || !teacherResponse?.scores) {
      return (
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">Assessment not yet complete</p>
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedAssessment(null);
            }}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to list
          </button>
        </div>
      );
    }

    const parentNIPP = parentResponse.scores.nippScores;
    const teacherNIPP = teacherResponse.scores.nippScores;

    const patterns = Object.keys(parentNIPP).map(code => {
      const parentScore = parentNIPP[code];
      const teacherScore = teacherNIPP[code];
      const combinedScore = (parentScore + teacherScore) / 2;

      return {
        code,
        name: code,
        category: code === 'FOC' || code === 'HYP' || code === 'IMP' || code === 'ORG' || code === 'DIM' ? 'Core ADHD' : 'Emotional/Impact',
        parentScore,
        teacherScore,
        combinedScore,
        parentLabel: getSeverityLabel710(parentScore),
        teacherLabel: getSeverityLabel710(teacherScore),
        combinedLabel: getSeverityLabel710(combinedScore),
        percentage: scoreToPercentage(combinedScore)
      };
    });

    return (
      <div>
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedAssessment(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Assessments
            </button>
          </div>
        </div>
        <ADHD710CoachReport
          childInfo={{
            name: selectedAssessment.child_name,
            age: selectedAssessment.child_age
          }}
          parentInfo={{
            name: parentResponse.respondent_name
          }}
          teacherInfo={{
            name: teacherResponse.respondent_name,
            email: teacherResponse.respondent_email
          }}
          patterns={patterns}
          date={new Date(selectedAssessment.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ADHD Assessments (Ages 7-10)</h2>
          <p className="text-gray-600 mt-1">Manage parent and teacher assessments for children</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Assessment
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No ADHD assessments yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first assessment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respondents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assessments.map((assessment) => {
                const parentResponse = assessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'parent');
                const teacherResponse = assessment.adhd_assessment_responses?.find((r: any) => r.respondent_type === 'caregiver');

                return (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{assessment.child_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assessment.child_age} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(assessment)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Parent:</span>
                          <span className={parentResponse?.completed ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {parentResponse?.respondent_name || 'Not set'}
                            {parentResponse?.completed && ' ✓'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Teacher:</span>
                          <span className={teacherResponse?.completed ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {teacherResponse?.respondent_name || 'Not set'}
                            {teacherResponse?.completed && ' ✓'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {!teacherResponse?.completed && (
                          <button
                            onClick={() => handleSendTeacherInvitation(assessment)}
                            disabled={sendingInvite === assessment.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Send teacher invitation"
                          >
                            {sendingInvite === assessment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {assessment.status === 'both_completed' && (
                          <>
                            <button
                              onClick={() => handleSendReports(assessment)}
                              disabled={sendingReports === assessment.id}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Send reports to parent and teacher"
                            >
                              {sendingReports === assessment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleViewReport(assessment, 'parent')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="View parent report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewReport(assessment, 'coach')}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View coach report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteAssessment(assessment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete assessment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Create New ADHD Assessment</h3>
              <p className="text-sm text-gray-600 mt-1">For children aged 7-10 years</p>
            </div>

            <form onSubmit={handleCreateAssessment} className="p-6 space-y-6">
              {/* Child Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Child Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.child_name}
                      onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="7"
                      max="10"
                      value={formData.child_age}
                      onChange={(e) => setFormData({ ...formData, child_age: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Parent/Guardian Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.parent_email}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Teacher Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Teacher Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.teacher_name}
                      onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.teacher_email}
                      onChange={(e) => setFormData({ ...formData, teacher_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Assessment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
