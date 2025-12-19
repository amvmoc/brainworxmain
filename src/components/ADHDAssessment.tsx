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

interface ADHDAssessmentProps {
  assessmentId?: string;
  respondentType: 'parent' | 'caregiver';
  onClose?: () => void;
}

type AssessmentStage = 'info' | 'questions' | 'complete' | 'view_report';

export default function ADHDAssessment({ assessmentId, respondentType, onClose }: ADHDAssessmentProps) {
  const [stage, setStage] = useState<AssessmentStage>('info');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('prefer_not_to_say');
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [respondentRelationship, setRespondentRelationship] = useState('');

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
          setStage('view_report');
          loadAllResponses(assessmentId);
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
        .eq('assessment_id', assId)
        .eq('completed', true);

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

      await loadAllResponses(assessmentData.id);
      setStage('view_report');
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

  if (stage === 'view_report') {
    const myResponse = allResponses.find(r => r.respondent_type === respondentType);
    const parentResponse = allResponses.find(r => r.respondent_type === 'parent');
    const caregiverResponse = allResponses.find(r => r.respondent_type === 'caregiver');

    const bothCompleted = parentResponse && caregiverResponse &&
                          parentResponse.completed && caregiverResponse.completed;

    if (respondentType === 'parent' && myResponse) {
      return (
        <div>
          <ADHDParentReport
            assessment={assessmentData}
            response={myResponse}
            onClose={onClose}
          />
          {bothCompleted && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Comprehensive Report Available
              </h3>
              <p className="text-blue-700 mb-4">
                Both parent and caregiver assessments are complete. View the comprehensive report below.
              </p>
              <ADHDComprehensiveReport
                assessment={assessmentData}
                parentResponse={parentResponse}
                caregiverResponse={caregiverResponse}
              />
            </div>
          )}
        </div>
      );
    }

    if (respondentType === 'caregiver' && myResponse) {
      return (
        <div>
          <ADHDCaregiverReport
            assessment={assessmentData}
            response={myResponse}
            onClose={onClose}
          />
          {bothCompleted && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Comprehensive Report Available
              </h3>
              <p className="text-blue-700 mb-4">
                Both parent and caregiver assessments are complete. View the comprehensive report below.
              </p>
              <ADHDComprehensiveReport
                assessment={assessmentData}
                parentResponse={parentResponse}
                caregiverResponse={caregiverResponse}
              />
            </div>
          )}
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
                  disabled={!!assessmentId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  disabled={!!assessmentId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  disabled={!!assessmentId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
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
