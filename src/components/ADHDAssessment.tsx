import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  ADHD_QUESTIONS,
  RESPONSE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  getQuestionsForRespondent,
  calculateCategoryScores,
  calculateOverallScore
} from '../data/adhdAssessmentQuestions';
import ADHDParentReport from './ADHDParentReport';
import ADHDCaregiverReport from './ADHDCaregiverReport';
import ADHDComprehensiveReport from './ADHDComprehensiveReport';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface ADHDAssessmentProps {
  assessmentId?: string;
  respondentType: 'parent' | 'caregiver';
  couponCode?: string;
  onClose?: () => void;
  prefilledChildName?: string;
  prefilledChildAge?: number;
  prefilledChildGender?: string;
  prefilledRelationship?: string;
}

type AssessmentStage = 'info' | 'questions' | 'parent_report' | 'invite_caregiver' | 'complete' | 'caregiver_waiting' | 'comprehensive_report';

export default function ADHDAssessment({
  assessmentId,
  respondentType,
  couponCode,
  onClose,
  prefilledChildName,
  prefilledChildAge,
  prefilledChildGender,
  prefilledRelationship
}: ADHDAssessmentProps) {
  const [stage, setStage] = useState<AssessmentStage>('info');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [childName, setChildName] = useState(prefilledChildName || '');
  const [childAge, setChildAge] = useState(prefilledChildAge ? String(prefilledChildAge) : '');
  const [childGender, setChildGender] = useState(prefilledChildGender || 'male');
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [respondentRelationship, setRespondentRelationship] = useState(prefilledRelationship || '');

  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [caregiverRelationship, setCaregiverRelationship] = useState('');
  const [invitationSent, setInvitationSent] = useState(false);

  const [responses, setResponses] = useState<Record<number, number>>({});
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [allResponses, setAllResponses] = useState<any[]>([]);

  const questions = getQuestionsForRespondent(respondentType);
  const progress = (Object.keys(responses).length / questions.length) * 100;

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  async function loadAssessment() {
    try {
      const { data: assessment, error: assessmentError } = await supabase
        .from('adhd_assessments')
        .select('*')
        .eq('id', assessmentId)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      if (!assessment) throw new Error('Assessment not found');

      setAssessmentData(assessment);
      setChildName(assessment.child_name);
      setChildAge(assessment.child_age.toString());
      setChildGender(assessment.child_gender);

      const { data: existingResponse, error: responseError } = await supabase
        .from('adhd_assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('respondent_type', respondentType)
        .maybeSingle();

      if (existingResponse) {
        setResponseData(existingResponse);
        setRespondentName(existingResponse.respondent_name);
        setRespondentEmail(existingResponse.respondent_email);
        setRespondentRelationship(existingResponse.respondent_relationship);
        setResponses(existingResponse.responses || {});

        if (existingResponse.completed) {
          await loadAllResponses(assessmentId);

          const parentResponse = allResponses.find(r => r.respondent_type === 'parent');
          const caregiverResponse = allResponses.find(r => r.respondent_type === 'caregiver');

          if (respondentType === 'parent' && !caregiverResponse) {
            setStage('invite_caregiver');
          } else if (parentResponse && caregiverResponse && parentResponse.completed && caregiverResponse.completed) {
            setStage('comprehensive_report');
          } else if (respondentType === 'caregiver') {
            setStage('caregiver_waiting');
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function loadAllResponses(assId: string) {
    try {
      const { data, error } = await supabase
        .from('adhd_assessment_responses')
        .select('*')
        .eq('assessment_id', assId);

      if (error) throw error;
      setAllResponses(data || []);
    } catch (err: any) {
      console.error('Error loading all responses:', err);
    }
  }

  async function handleStartAssessment() {
    if (!childName || !childAge || !respondentName || !respondentEmail || !respondentRelationship) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let assId = assessmentId;

      if (!assId) {
        const { data: newAssessment, error: assessmentError } = await supabase
          .from('adhd_assessments')
          .insert({
            child_name: childName,
            child_age: parseInt(childAge),
            child_gender: childGender,
            created_by_email: respondentEmail,
            status: 'pending'
          })
          .select()
          .single();

        if (assessmentError) throw assessmentError;
        assId = newAssessment.id;
        setAssessmentData(newAssessment);
      }

      if (!responseData) {
        const { data: newResponse, error: responseError } = await supabase
          .from('adhd_assessment_responses')
          .insert({
            assessment_id: assId,
            respondent_type: respondentType,
            respondent_name: respondentName,
            respondent_email: respondentEmail,
            respondent_relationship: respondentRelationship,
            responses: responses
          })
          .select()
          .single();

        if (responseError) throw responseError;
        setResponseData(newResponse);
      }

      setStage('questions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResponse(questionId: number, value: number) {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);

    if (responseData) {
      await supabase
        .from('adhd_assessment_responses')
        .update({ responses: newResponses })
        .eq('id', responseData.id);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  async function handleSubmit() {
    if (Object.keys(responses).length < questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categoryScores = calculateCategoryScores(responses, respondentType);
      const overallScore = calculateOverallScore(responses, respondentType);

      const scores = {
        categories: categoryScores,
        overall: overallScore
      };

      await supabase
        .from('adhd_assessment_responses')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          scores: scores
        })
        .eq('id', responseData.id);

      setResponseData({ ...responseData, completed: true, scores });
      await loadAllResponses(assessmentData.id);

      if (respondentType === 'parent') {
        setStage('parent_report');
      } else {
        setStage('caregiver_waiting');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteCaregiver() {
    if (!caregiverName || !caregiverEmail || !caregiverRelationship) {
      setError('Please fill in all caregiver fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const couponCode = `ADHD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const { data: coupon, error: couponError } = await supabase
        .from('coupon_codes')
        .insert({
          code: couponCode,
          assessment_type: 'adhd-caregiver',
          max_uses: 1,
          recipient_email: caregiverEmail,
          recipient_name: caregiverName,
          child_name: childName,
          child_age: parseInt(childAge),
          child_gender: childGender,
          caregiver_relationship: caregiverRelationship,
          assessment_id: assessmentData.id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (couponError) throw couponError;

      const assessmentUrl = `${window.location.origin}?assessment=${assessmentData.id}&respondent=caregiver&coupon=${couponCode}`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adhd-caregiver-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          caregiverName,
          caregiverEmail,
          caregiverRelationship,
          parentName: respondentName,
          childName,
          childAge,
          couponCode,
          assessmentUrl,
          assessmentId: assessmentData.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation email');
      }

      setInvitationSent(true);
      setStage('invite_caregiver');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  if (stage === 'parent_report' && responseData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl border-2 border-blue-700 p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold mb-3">
                📧 Next Step: Invite a Teacher/Caregiver
              </h3>
              <p className="text-blue-100 mb-4">
                To complete the ADHD assessment, we need input from someone who sees {childName} in a different setting
                (teacher, therapist, or other caregiver). Click below to send them an invitation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStage('invite_caregiver')}
            className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-lg shadow-md hover:shadow-xl transition-all"
          >
            Send Caregiver Invitation →
          </button>
        </div>

        <ADHDParentReport
          assessment={assessmentData}
          response={responseData}
          onClose={onClose}
        />
      </div>
    );
  }

  if (stage === 'invite_caregiver') {
    const parentResponse = allResponses.find(r => r.respondent_type === 'parent');

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Invite Caregiver to Complete Assessment
            </h2>
            <p className="text-gray-600">
              We'll send an email invitation with a unique coupon code to the caregiver.
              They'll use this code to complete their assessment about {childName}.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
              <span>{error}</span>
            </div>
          )}

          {invitationSent ? (
            <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-600" size={32} />
                <h3 className="text-xl font-bold text-green-900">
                  Invitation Sent Successfully!
                </h3>
              </div>
              <p className="text-green-800 mb-4">
                We've sent an email to {caregiverEmail} with instructions and a unique coupon code to complete the caregiver assessment.
              </p>
              <p className="text-sm text-green-700">
                Once they complete their assessment, you'll receive an email with the comprehensive report comparing both perspectives.
              </p>
              {onClose && (
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Done
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caregiver's Name *
                </label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="e.g., Ms. Johnson"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caregiver's Email *
                </label>
                <input
                  type="email"
                  value={caregiverEmail}
                  onChange={(e) => setCaregiverEmail(e.target.value)}
                  placeholder="teacher@school.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship to Child *
                </label>
                <select
                  value={caregiverRelationship}
                  onChange={(e) => setCaregiverRelationship(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select relationship...</option>
                  {RELATIONSHIP_OPTIONS['caregiver'].map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleInviteCaregiver}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  {loading ? 'Sending Invitation...' : 'Send Invitation Email'}
                </button>
              </div>
            </div>
          )}
        </div>

        {parentResponse && (
          <div className="mt-8">
            <ADHDParentReport
              assessment={assessmentData}
              response={parentResponse}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    );
  }

  if (stage === 'caregiver_waiting' && responseData) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <ADHDCaregiverReport
          assessment={assessmentData}
          response={responseData}
          onClose={onClose}
        />

        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Thank You for Completing the Assessment
          </h3>
          <p className="text-gray-700 mb-4">
            Your caregiver report has been submitted. The parent/guardian will receive a comprehensive report
            once both assessments are complete, showing how behaviors compare across different settings.
          </p>
          <p className="text-sm text-gray-600">
            This comprehensive view helps identify patterns and inform appropriate interventions.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'comprehensive_report') {
    const parentResponse = allResponses.find(r => r.respondent_type === 'parent');
    const caregiverResponse = allResponses.find(r => r.respondent_type === 'caregiver');

    if (parentResponse && caregiverResponse) {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <ADHDComprehensiveReport
            assessment={assessmentData}
            parentResponse={parentResponse}
            caregiverResponse={caregiverResponse}
          />
        </div>
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ADHD Caregiver Assessment
          </h1>
          <p className="text-lg text-gray-600">
            {respondentType === 'parent' ? 'Parent/Guardian' : 'Teacher/Caregiver'} Assessment
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {stage === 'info' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Assessment Information
              </h2>
              <p className="text-gray-600 mb-6">
                This assessment will help evaluate ADHD-related behaviors and symptoms.
                Please answer all questions honestly based on your observations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Name *
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  disabled={!!assessmentId || !!prefilledChildName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Age *
                </label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  disabled={!!assessmentId || !!prefilledChildAge}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Gender
                </label>
                <select
                  value={childGender}
                  onChange={(e) => setChildGender(e.target.value)}
                  disabled={!!assessmentId || !!prefilledChildGender}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {!prefilledRelationship && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Relationship to Child *
                  </label>
                  <select
                    value={respondentRelationship}
                    onChange={(e) => setRespondentRelationship(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select relationship...</option>
                    {RELATIONSHIP_OPTIONS[respondentType].map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleStartAssessment}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 ml-auto"
              >
                {loading ? 'Starting...' : 'Start Assessment'}
              </button>
            </div>
          </div>
        )}

        {stage === 'questions' && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-2 text-sm font-medium text-gray-500">
                Category: {questions[currentQuestion].category}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {questions[currentQuestion].text}
              </h3>

              <div className="space-y-3">
                {RESPONSE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleResponse(questions[currentQuestion].id, option.value)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      responses[questions[currentQuestion].id] === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option.label}</span>
                      {responses[questions[currentQuestion].id] === option.value && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              {Object.keys(responses).length === questions.length && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Submitting...' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
