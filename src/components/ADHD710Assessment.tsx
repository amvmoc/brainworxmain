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

export default function ADHD710Assessment({ assessmentId, respondentType, onComplete }: ADHD710AssessmentProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [respondentInfo, setRespondentInfo] = useState({
    name: '',
    email: '',
    relationship: ''
  });
  const [currentSection, setCurrentSection] = useState(0);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const questionsPerSection = 20;
  const totalSections = Math.ceil(ADHD710_QUESTIONS.length / questionsPerSection);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    } else {
      setLoading(false);
    }
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('adhd_assessments')
        .select('*')
        .eq('id', assessmentId)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      const { data: responseData, error: responseError } = await supabase
        .from('adhd_assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('respondent_type', respondentType)
        .maybeSingle();

      if (responseData) {
        setResponses(responseData.responses || {});
        setRespondentInfo({
          name: responseData.respondent_name || '',
          email: responseData.respondent_email || '',
          relationship: responseData.respondent_relationship || ''
        });
      }
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
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'assessment_id,respondent_type'
        });

      if (error) throw error;

      setShowSuccess(true);
      if (onComplete) onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the assessment. Your responses have been saved securely.
          </p>
          <p className="text-sm text-gray-500">
            The complete report will be sent to your email once both parent and teacher assessments are completed.
          </p>
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
        </div>
      </div>
    </div>
  );
}
