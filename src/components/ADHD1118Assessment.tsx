import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  QUESTIONS,
  ANSWER_OPTIONS,
  PATTERN_INFO,
  calculateNIPPScores1118,
  getSeverityLabel1118,
  scoreToPercentage,
  PatternId
} from '../data/adhd1118AssessmentQuestions';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ADHD1118AssessmentProps {
  assessmentId?: string;
  respondentType: 'teen' | 'parent';
  onClose?: () => void;
  couponId?: string | null;
  franchiseOwnerId?: string | null;
  prefillName?: string;
  prefillEmail?: string;
}

export default function ADHD1118Assessment({
  assessmentId: initialAssessmentId,
  respondentType,
  onClose,
  couponId,
  franchiseOwnerId,
  prefillName,
  prefillEmail
}: ADHD1118AssessmentProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [assessmentId, setAssessmentId] = useState<string | undefined>(initialAssessmentId);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [respondentInfo, setRespondentInfo] = useState({
    name: prefillName || '',
    email: prefillEmail || ''
  });
  const [teenInfo, setTeenInfo] = useState({
    name: '',
    age: '',
    gender: ''
  });
  const [stage, setStage] = useState<'info' | 'questions'>('info');
  const [currentSection, setCurrentSection] = useState(0);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const questionsPerSection = 10;
  const totalSections = Math.ceil(QUESTIONS.length / questionsPerSection);

  useEffect(() => {
    if (initialAssessmentId) {
      loadAssessment();
    } else {
      setLoading(false);
      setStage('info');
    }
  }, [initialAssessmentId]);

  const loadAssessment = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('adhd_1118_assessments')
        .select('*')
        .eq('id', initialAssessmentId)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      if (assessmentData) {
        setTeenInfo({
          name: assessmentData.teen_name || '',
          age: assessmentData.teen_age?.toString() || '',
          gender: assessmentData.teen_gender || ''
        });
      }

      const { data: responseData, error: responseError } = await supabase
        .from('adhd_1118_assessment_responses')
        .select('*')
        .eq('assessment_id', initialAssessmentId)
        .eq('respondent_type', respondentType)
        .maybeSingle();

      if (responseData) {
        setResponses(responseData.responses || {});
        setRespondentInfo({
          name: responseData.respondent_name || '',
          email: responseData.respondent_email || ''
        });

        if (responseData.completed) {
          setStage('questions');
          setShowSuccess(true);
        } else {
          setStage('questions');
        }
      } else {
        setStage('info');
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error loading assessment:', error);
      setError('Failed to load assessment. Please try again.');
      setLoading(false);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let currentAssessmentId = assessmentId;

      if (!currentAssessmentId) {
        const { data: newAssessment, error: assessmentError } = await supabase
          .from('adhd_1118_assessments')
          .insert({
            teen_name: teenInfo.name,
            teen_age: parseInt(teenInfo.age),
            teen_gender: teenInfo.gender,
            created_by_email: respondentInfo.email,
            status: 'pending',
            coupon_id: couponId || null,
            franchise_owner_id: franchiseOwnerId || null
          })
          .select()
          .single();

        if (assessmentError) throw assessmentError;
        currentAssessmentId = newAssessment.id;
        setAssessmentId(currentAssessmentId);
        setAssessment(newAssessment);
      }

      const { data: existingResponse } = await supabase
        .from('adhd_1118_assessment_responses')
        .select('*')
        .eq('assessment_id', currentAssessmentId)
        .eq('respondent_type', respondentType)
        .maybeSingle();

      if (existingResponse) {
        const { error: updateError } = await supabase
          .from('adhd_1118_assessment_responses')
          .update({
            respondent_name: respondentInfo.name,
            respondent_email: respondentInfo.email,
            respondent_relationship: 'self'
          })
          .eq('id', existingResponse.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('adhd_1118_assessment_responses')
          .insert({
            assessment_id: currentAssessmentId,
            respondent_type: respondentType,
            respondent_name: respondentInfo.name,
            respondent_email: respondentInfo.email,
            respondent_relationship: 'self',
            responses: {},
            completed: false
          });

        if (insertError) throw insertError;
      }

      setStage('questions');
    } catch (error: any) {
      console.error('Error saving info:', error);
      setError('Failed to save information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const saveProgress = async () => {
    if (!assessmentId) return;

    try {
      const { data: existingResponse } = await supabase
        .from('adhd_1118_assessment_responses')
        .select('id')
        .eq('assessment_id', assessmentId)
        .eq('respondent_type', respondentType)
        .maybeSingle();

      if (existingResponse) {
        await supabase
          .from('adhd_1118_assessment_responses')
          .update({ responses })
          .eq('id', existingResponse.id);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const answeredCount = Object.keys(responses).length;
      if (answeredCount < QUESTIONS.length) {
        setError(`Please answer all questions. You have answered ${answeredCount} out of ${QUESTIONS.length}.`);
        setSaving(false);
        return;
      }

      const nippScores = calculateNIPPScores1118(responses);

      const { data: existingResponse } = await supabase
        .from('adhd_1118_assessment_responses')
        .select('id')
        .eq('assessment_id', assessmentId)
        .eq('respondent_type', respondentType)
        .maybeSingle();

      if (existingResponse) {
        const { error: updateError } = await supabase
          .from('adhd_1118_assessment_responses')
          .update({
            responses,
            scores: { nippScores },
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingResponse.id);

        if (updateError) throw updateError;
      }

      // ADHD 11-18 is a teen-only self-assessment (no parent input required)
      // Mark as completed when teen finishes
      await supabase
        .from('adhd_1118_assessments')
        .update({ status: 'teen_completed' })
        .eq('id', assessmentId);

      // Automatically send reports to teen and coach
      try {
        console.log('Sending ADHD 11-18 reports for assessment:', assessmentId);
        const { error: reportError } = await supabase.functions.invoke('send-adhd1118-reports', {
          body: {
            assessmentId: assessmentId
          }
        });

        if (reportError) {
          console.error('Error sending reports:', reportError);
        } else {
          console.log('Reports sent successfully to teen and coach');
        }
      } catch (emailError) {
        console.error('Error sending automatic reports:', emailError);
      }

      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for completing the ADHD assessment, {teenInfo.name}!
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6 text-left">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-900 font-semibold mb-1">
                    Your Reports Are Being Prepared
                  </p>
                  <p className="text-blue-700 text-sm">
                    Your comprehensive ADHD assessment report will be emailed to {respondentInfo.email} within 5-10 minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-900 font-semibold mb-1">
                    Coach Report Sent
                  </p>
                  <p className="text-blue-700 text-sm">
                    A detailed clinical report has been sent to your coach. They will contact you to schedule a debrief session.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> Please check your spam folder if you don't see the email in your inbox.
              </p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ADHD Assessment (Ages 11-18)
              </h1>
              <p className="text-lg text-gray-600">
                {respondentType === 'teen'
                  ? 'This is a self-assessment to help understand attention and behavior patterns.'
                  : 'Please complete this assessment based on your observations of the teen.'}
              </p>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {respondentType === 'teen' ? 'Your Information' : 'Teen Information'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teen's Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={teenInfo.name}
                      onChange={(e) => setTeenInfo({ ...teenInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={!!assessmentId}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="11"
                      max="18"
                      value={teenInfo.age}
                      onChange={(e) => setTeenInfo({ ...teenInfo, age: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={!!assessmentId}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {respondentType === 'teen' ? 'Contact Information' : 'Your Information'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={respondentInfo.name}
                      onChange={(e) => setRespondentInfo({ ...respondentInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={respondentInfo.email}
                      onChange={(e) => setRespondentInfo({ ...respondentInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Assessment
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestions = QUESTIONS.slice(
    currentSection * questionsPerSection,
    (currentSection + 1) * questionsPerSection
  );
  const progress = Math.round((Object.keys(responses).length / QUESTIONS.length) * 100);
  const isLastSection = currentSection === totalSections - 1;
  const canProceed = currentQuestions.every(q => responses[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Section {currentSection + 1} of {totalSections}
              </h2>
              <span className="text-sm font-medium text-indigo-600">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-8 mb-8">
            {currentQuestions.map((question, idx) => {
              const pattern = PATTERN_INFO[question.pattern];
              return (
                <div key={question.id} className="border-b border-gray-200 pb-8 last:border-0">
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {currentSection * questionsPerSection + idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          {question.text}
                        </p>
                        <p className="text-sm text-indigo-600">
                          {pattern.name} - {pattern.shortDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                    {ANSWER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleResponseChange(question.id, option.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          responses[question.id] === option.value
                            ? 'border-indigo-600 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            responses[question.id] === option.value
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-300'
                          }`}>
                            {responses[question.id] === option.value && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            responses[question.id] === option.value
                              ? 'text-indigo-900'
                              : 'text-gray-700'
                          }`}>
                            {option.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {isLastSection ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Assessment
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Section
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
