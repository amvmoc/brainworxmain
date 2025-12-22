import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Send, Eye, Trash2, Loader2, Mail, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ADHD1118AssessmentsManagementProps {
  franchiseOwnerId: string;
  isSuperAdmin?: boolean;
}

export function ADHD1118AssessmentsManagement({ franchiseOwnerId, isSuperAdmin = false }: ADHD1118AssessmentsManagementProps) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'parent-report' | 'coach-report'>('list');

  const [formData, setFormData] = useState({
    teen_name: '',
    teen_age: 12,
    teen_email: ''
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
        .from('adhd_1118_assessments')
        .select(`
          *,
          adhd_1118_assessment_responses (*)
        `);

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
      const { data: assessment, error: assessmentError } = await supabase
        .from('adhd_1118_assessments')
        .insert({
          teen_name: formData.teen_name,
          teen_age: formData.teen_age,
          franchise_owner_id: franchiseOwnerId,
          created_by_email: formData.teen_email,
          status: 'pending'
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      const { error: teenError } = await supabase
        .from('adhd_1118_assessment_responses')
        .insert({
          assessment_id: assessment.id,
          respondent_type: 'teen',
          respondent_name: formData.teen_name,
          respondent_email: formData.teen_email,
          respondent_relationship: 'self',
          completed: false
        });

      if (teenError) throw teenError;

      const teenLink = `${window.location.origin}/adhd1118/${assessment.id}/teen`;
      alert(`Assessment created!\n\nTeen Assessment Link: ${teenLink}\n\nShare this link with ${formData.teen_name} to complete their self-assessment.`);

      setFormData({
        teen_name: '',
        teen_age: 12,
        teen_email: ''
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

  const handleSendParentInvitation = async (assessment: any) => {
    setSendingInvite(assessment.id);

    try {
      const parentResponse = assessment.adhd_1118_assessment_responses?.find((r: any) => r.respondent_type === 'parent');
      if (!parentResponse) throw new Error('Parent information not found');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adhd1118-parent-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          assessmentId: assessment.id,
          parentName: parentResponse.respondent_name,
          parentEmail: parentResponse.respondent_email,
          teenName: assessment.teen_name,
          teenAge: assessment.teen_age
        })
      });

      if (!response.ok) throw new Error('Failed to send invitation');

      alert('Parent invitation sent successfully!');
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adhd1118-reports`, {
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

      alert('Reports sent successfully to teen, parent, and coach!');
    } catch (error: any) {
      console.error('Error sending reports:', error);
      alert('Error sending reports: ' + error.message);
    } finally {
      setSendingReports(null);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('adhd_1118_assessments')
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
      teen_completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Complete' }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ADHD Assessments (Ages 11-18)</h2>
          <p className="text-gray-600 mt-1">Manage teen self-assessments</p>
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
          <p className="text-gray-600 mb-4">No ADHD 11-18 assessments yet</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respondents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assessments.map((assessment) => {
                const teenResponse = assessment.adhd_1118_assessment_responses?.find((r: any) => r.respondent_type === 'teen');
                const parentResponse = assessment.adhd_1118_assessment_responses?.find((r: any) => r.respondent_type === 'parent');

                return (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{assessment.teen_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assessment.teen_age} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(assessment)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Teen:</span>
                          <span className={teenResponse?.completed ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {teenResponse?.respondent_name || 'Not set'}
                            {teenResponse?.completed && ' ✓'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Parent:</span>
                          <span className={parentResponse?.completed ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {parentResponse?.respondent_name || 'Not set'}
                            {parentResponse?.completed && ' ✓'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {!parentResponse?.completed && (
                          <button
                            onClick={() => handleSendParentInvitation(assessment)}
                            disabled={sendingInvite === assessment.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Send parent invitation"
                          >
                            {sendingInvite === assessment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {assessment.status === 'teen_completed' && (
                          <button
                            onClick={() => handleSendReports(assessment)}
                            disabled={sendingReports === assessment.id}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Send reports to teen and coach"
                          >
                            {sendingReports === assessment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </button>
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Create New ADHD Assessment (11-18)</h3>
              <p className="text-sm text-gray-600 mt-1">For teens aged 11-18 years</p>
            </div>

            <form onSubmit={handleCreateAssessment} className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Teen Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teen Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.teen_name}
                      onChange={(e) => setFormData({ ...formData, teen_name: e.target.value })}
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
                      min="11"
                      max="18"
                      value={formData.teen_age}
                      onChange={(e) => setFormData({ ...formData, teen_age: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teen Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.teen_email}
                    onChange={(e) => setFormData({ ...formData, teen_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>


              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ADHD1118AssessmentsManagement;
