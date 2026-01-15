import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  ADHD710_QUESTIONS,
  RESPONSE_OPTIONS_710,
  calculateCategoryScores710,
  calculateNIPPScores,
  getSeverityLabel710,
  getSeverityColor710,
  scoreToPercentage,
  getADHDInterpretation,
  NIPP_PATTERNS
} from '../data/adhd710AssessmentQuestions';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ADHD710AssessmentProps {
  assessmentId?: string;
  respondentType: 'parent' | 'caregiver';
  onComplete?: () => void;
}

export default function ADHD710Assessment({ assessmentId: initialAssessmentId, respondentType, onComplete }: ADHD710AssessmentProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [assessmentId, setAssessmentId] = useState<string | undefined>(initialAssessmentId);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [respondentInfo, setRespondentInfo] = useState({
    name: '',
    email: '',
    relationship: ''
  });
  const [childInfo, setChildInfo] = useState({
    name: '',
    age: '',
    gender: 'male'
  });
  const [stage, setStage] = useState<'info' | 'questions'>('info');
  const [currentSection, setCurrentSection] = useState(0);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState({
    name: '',
    email: '',
    relationship: 'teacher'
  });

  const questionsPerSection = 20;
  const totalSections = Math.ceil(ADHD710_QUESTIONS.length / questionsPerSection);

  useEffect(() => {
    if (initialAssessmentId) {
      loadAssessment();
    } else {
      setLoading(false);
      setStage('info');
    }
  }, [initialAssessmentId]);

  useEffect(() => {
    console.log('showSuccess changed to:', showSuccess);
  }, [showSuccess]);

  useEffect(() => {
    console.log('Component mounted. Props:', { initialAssessmentId, respondentType });
    return () => {
      console.log('Component unmounting...');
    };
  }, []);

  const loadAssessment = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('adhd_assessments')
        .select('*')
        .eq('id', initialAssessmentId)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      if (assessmentData) {
        setChildInfo({
          name: assessmentData.child_name || '',
          age: assessmentData.child_age?.toString() || '',
          gender: assessmentData.child_gender || 'male'
        });
      }

      const { data: responseData, error: responseError } = await supabase
        .from('adhd_assessment_responses')
        .select('*')
        .eq('assessment_id', initialAssessmentId)
        .eq('respondent_type', respondentType)
        .maybeSingle();

      if (responseData) {
        setResponses(responseData.responses || {});
        setRespondentInfo({
          name: responseData.respondent_name || '',
          email: responseData.respondent_email || '',
          relationship: responseData.respondent_relationship || ''
        });
        setStage('questions');
      } else {
        setStage('info');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    if (!childInfo.name || !childInfo.age || !respondentInfo.name || !respondentInfo.email || !respondentInfo.relationship) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let newAssessmentId = assessmentId;

      // Create assessment record if it doesn't exist
      if (!newAssessmentId) {
        const { data: newAssessment, error: assessmentError } = await supabase
          .from('adhd_assessments')
          .insert({
            child_name: childInfo.name,
            child_age: parseInt(childInfo.age),
            child_gender: childInfo.gender,
            created_by_email: respondentInfo.email,
            status: 'pending'
          })
          .select()
          .single();

        if (assessmentError) throw assessmentError;
        newAssessmentId = newAssessment.id;
        setAssessmentId(newAssessmentId);
        setAssessment(newAssessment);
      }

      // Create response record
      const { error: responseError } = await supabase
        .from('adhd_assessment_responses')
        .insert({
          assessment_id: newAssessmentId,
          respondent_type: respondentType,
          respondent_name: respondentInfo.name,
          respondent_email: respondentInfo.email,
          respondent_relationship: respondentInfo.relationship,
          responses: {}
        });

      if (responseError) throw responseError;

      setStage('questions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!assessmentId) return;

    setSaving(true);
    try {
      const categoryScores = calculateCategoryScores710(responses);
      const nippScores = calculateNIPPScores(categoryScores);

      const { error } = await supabase
        .from('adhd_assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          respondent_type: respondentType,
          respondent_name: respondentInfo.name,
          respondent_email: respondentInfo.email,
          respondent_relationship: respondentInfo.relationship,
          responses,
          scores: { categoryScores, nippScores },
          completed: false
        }, {
          onConflict: 'assessment_id,respondent_type'
        });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!validateResponses()) {
      setError('Please answer all questions before submitting.');
      return;
    }

    if (!respondentInfo.name || !respondentInfo.email || !respondentInfo.relationship) {
      setError('Please provide your information before submitting.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      console.log('Starting assessment submission...');
      console.log('Assessment ID:', assessmentId);
      console.log('Respondent Type:', respondentType);

      const categoryScores = calculateCategoryScores710(responses);
      const nippScores = calculateNIPPScores(categoryScores);

      console.log('Calculated scores:', { categoryScores, nippScores });

      const { error } = await supabase
        .from('adhd_assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          respondent_type: respondentType,
          respondent_name: respondentInfo.name,
          respondent_email: respondentInfo.email,
          respondent_relationship: respondentInfo.relationship,
          responses,
          scores: { categoryScores, nippScores },
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'assessment_id,respondent_type'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Assessment saved successfully! Showing success screen...');
      setShowSuccess(true);
      console.log('showSuccess set to true');

      // Check if both assessments are now complete and send reports
      const { data: allResponses } = await supabase
        .from('adhd_assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (allResponses && allResponses.length === 2 && allResponses.every(r => r.completed)) {
        console.log('Both assessments complete - sending reports automatically');

        // Send reports to parent and coach
        try {
          const reportResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adhd710-reports`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ assessmentId })
          });

          if (!reportResponse.ok) {
            const errorText = await reportResponse.text();
            console.error('Failed to send reports:', errorText);
          } else {
            console.log('✅ ADHD710 reports sent successfully to parent and coach');
          }
        } catch (emailError) {
          console.error('Error sending ADHD710 reports:', emailError);
        }
      } else {
        console.log('Waiting for both assessments to complete before sending reports');
      }
    } catch (err: any) {
      console.error('Error in handleComplete:', err);
      setError(err.message || 'An error occurred while saving your assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteTeacher = async () => {
    if (!teacherInfo.name || !teacherInfo.email) {
      setError('Please provide teacher name and email');
      return;
    }

    if (!assessmentId) {
      setError('Assessment ID is missing. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating teacher invitation...');
      const couponCode = `ADHD710-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const childName = assessment?.child_name || childInfo.name;
      const childAge = assessment?.child_age || parseInt(childInfo.age);
      const childGender = assessment?.child_gender || childInfo.gender;

      console.log('Child data for invitation:', { childName, childAge, childGender });

      const { error: couponError } = await supabase
        .from('coupon_codes')
        .insert({
          code: couponCode,
          assessment_type: 'adhd-710-caregiver',
          max_uses: 1,
          recipient_email: teacherInfo.email,
          recipient_name: teacherInfo.name,
          child_name: childName,
          child_age: childAge,
          child_gender: childGender,
          caregiver_relationship: teacherInfo.relationship,
          assessment_id: assessmentId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (couponError) {
        console.error('Coupon creation error:', couponError);
        throw couponError;
      }

      const assessmentUrl = `${window.location.origin}?assessment=${assessmentId}&respondent=caregiver&coupon=${couponCode}`;

      console.log('Sending invitation email...');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adhd710-teacher-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          teacherName: teacherInfo.name,
          teacherEmail: teacherInfo.email,
          teacherRelationship: teacherInfo.relationship,
          parentName: respondentInfo.name,
          childName,
          childAge,
          couponCode,
          assessmentUrl,
          assessmentId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email send failed:', errorText);
        throw new Error('Failed to send invitation email');
      }

      console.log('Teacher invitation sent successfully');
      setTeacherInfo({ name: '', email: '', relationship: 'teacher' });
      setShowInviteForm(false);
      alert('Teacher invitation sent successfully!');
    } catch (err: any) {
      console.error('Error in handleInviteTeacher:', err);
      setError(err.message || 'Failed to send teacher invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateResponses = () => {
    return ADHD710_QUESTIONS.every(q => responses[q.id] !== undefined);
  };

  const getSectionQuestions = () => {
    const start = currentSection * questionsPerSection;
    const end = start + questionsPerSection;
    return ADHD710_QUESTIONS.slice(start, end);
  };

  const getProgress = () => {
    const answered = Object.keys(responses).length;
    return Math.round((answered / ADHD710_QUESTIONS.length) * 100);
  };

  const relationshipOptions = respondentType === 'parent'
    ? [
        { value: 'mother', label: 'Mother' },
        { value: 'father', label: 'Father' },
        { value: 'guardian', label: 'Legal Guardian' },
        { value: 'stepparent', label: 'Step-parent' },
        { value: 'other_parent', label: 'Other Caregiver' }
      ]
    : [
        { value: 'teacher', label: 'Teacher' },
        { value: 'counselor', label: 'School Counselor' },
        { value: 'aide', label: 'Teaching Aide' },
        { value: 'coach', label: 'Coach' },
        { value: 'therapist', label: 'Therapist' },
        { value: 'daycare_provider', label: 'Daycare Provider' },
        { value: 'other_caregiver', label: 'Other Caregiver' }
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showSuccess) {
    console.log('Rendering success screen. respondentType:', respondentType);
    console.log('Assessment data:', assessment);
    console.log('Child info:', childInfo);

    const childName = assessment?.child_name || childInfo.name || 'the child';
    const childAge = assessment?.child_age || childInfo.age || '';

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-600">
              Thank you for completing the assessment. Your responses have been saved securely.
            </p>
          </div>

          {respondentType === 'parent' ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Next Step: Teacher/Caregiver Assessment</h3>
                <p className="text-sm text-gray-700 mb-4">
                  To get a complete picture of {childName}'s behavior,
                  we recommend inviting a teacher or caregiver who interacts with the child regularly to complete
                  a second assessment. This comparison helps identify patterns across different settings.
                </p>

                {!showInviteForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowInviteForm(true)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Invite Teacher/Caregiver
                    </button>
                    <button
                      onClick={() => onComplete && onComplete()}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={teacherInfo.name}
                          onChange={(e) => setTeacherInfo({ ...teacherInfo, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Teacher's name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={teacherInfo.email}
                          onChange={(e) => setTeacherInfo({ ...teacherInfo, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="teacher@school.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship *
                      </label>
                      <select
                        value={teacherInfo.relationship}
                        onChange={(e) => setTeacherInfo({ ...teacherInfo, relationship: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="teacher">Teacher</option>
                        <option value="counselor">School Counselor</option>
                        <option value="aide">Teaching Aide</option>
                        <option value="coach">Coach</option>
                        <option value="therapist">Therapist</option>
                        <option value="daycare_provider">Daycare Provider</option>
                        <option value="other_caregiver">Other Caregiver</option>
                      </select>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleInviteTeacher}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Invitation'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowInviteForm(false);
                          setTeacherInfo({ name: '', email: '', relationship: 'teacher' });
                          setError('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 text-center">
                You will receive a comprehensive report via email once both assessments are completed.
              </p>
            </>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  Your assessment has been submitted. The parent/guardian will receive a comprehensive
                  report comparing observations from both home and school/care settings.
                </p>
                <p className="text-sm text-gray-600">
                  This multi-perspective view provides valuable insights for understanding the child's behavior patterns.
                </p>
              </div>

              {onComplete && (
                <button
                  onClick={onComplete}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Done
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold">ADHD Assessment (Ages 7-10)</h1>
                <p className="text-blue-100 mt-1">
                  {respondentType === 'parent' ? 'Parent' : 'Teacher/Caregiver'} Questionnaire
                </p>
              </div>
              {assessment && (
                <div className="text-right">
                  <p className="text-sm text-blue-100">Child: {assessment.child_name}</p>
                  <p className="text-sm text-blue-100">Age: {assessment.child_age}</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{getProgress()}% Complete</span>
              </div>
              <div className="w-full bg-blue-500 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>
          </div>

          {/* Info Collection Stage */}
          {stage === 'info' && (
            <>
              {/* Child Information Banner */}
              {assessment && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b-4 border-purple-300">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Assessment For
                      </p>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {assessment.child_name}
                      </h2>
                      <div className="flex items-center justify-center gap-6 text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Age:</span>
                          <span className="text-lg font-bold text-purple-600">{assessment.child_age}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Gender:</span>
                          <span className="text-lg font-bold text-purple-600 capitalize">{assessment.child_gender}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Child Information (for parent starting new assessment) */}
              {!assessment && (
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Child Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Name *
                      </label>
                      <input
                        type="text"
                        value={childInfo.name}
                        onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Age *
                      </label>
                      <input
                        type="number"
                        min="7"
                        max="10"
                        value={childInfo.age}
                        onChange={(e) => setChildInfo({ ...childInfo, age: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Gender *
                      </label>
                      <select
                        value={childInfo.gender}
                        onChange={(e) => setChildInfo({ ...childInfo, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Respondent Information */}
              <div className="p-6 bg-blue-50 border-b">
            <h3 className="font-semibold text-gray-900 mb-3">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={respondentInfo.name}
                  onChange={(e) => setRespondentInfo({ ...respondentInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={respondentInfo.email}
                  onChange={(e) => setRespondentInfo({ ...respondentInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship *
                </label>
                <select
                  value={respondentInfo.relationship}
                  onChange={(e) => setRespondentInfo({ ...respondentInfo, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  {relationshipOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Start Button */}
              <div className="p-6 flex justify-end">
                <button
                  onClick={handleStartAssessment}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start Assessment'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Questions Stage */}
          {stage === 'questions' && (
            <>
              {/* Child Information Banner */}
              {(assessment || childInfo.name) && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b-4 border-purple-300">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Assessment For
                      </p>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {assessment?.child_name || childInfo.name}
                      </h2>
                      <div className="flex items-center justify-center gap-6 text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Age:</span>
                          <span className="text-lg font-bold text-purple-600">{assessment?.child_age || childInfo.age}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Gender:</span>
                          <span className="text-lg font-bold text-purple-600 capitalize">{assessment?.child_gender || childInfo.gender}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="p-6 bg-amber-50 border-b">
                <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Rate how true each statement is for this child on a scale of 1-4:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center font-bold text-green-700">1</div>
                    <span>Not at all true</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center font-bold text-yellow-700">2</div>
                    <span>Somewhat true</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center font-bold text-orange-700">3</div>
                    <span>Mostly true</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center font-bold text-red-700">4</div>
                    <span>Completely true</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="p-6">
            <div className="mb-4 text-sm text-gray-600">
              Section {currentSection + 1} of {totalSections}
            </div>

            <div className="space-y-6">
              {getSectionQuestions().map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {question.category}
                    </span>
                    <p className="mt-2 text-gray-900 font-medium">
                      Q{question.id}. {question.text}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RESPONSE_OPTIONS_710.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setResponses({ ...responses, [question.id]: option.value })}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          responses[question.id] === option.value
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.value} - {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t bg-gray-50 p-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {currentSection < totalSections - 1 && (
                <button
                  onClick={() => setCurrentSection(Math.min(totalSections - 1, currentSection + 1))}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveProgress}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </button>
              {currentSection === totalSections - 1 && (
                <button
                  onClick={handleComplete}
                  disabled={saving || !validateResponses()}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Submit Assessment</>
                  )}
                </button>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
