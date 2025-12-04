import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { questionnaireData } from '../data/questions';
import { AnalysisReport } from './AnalysisReport';
import { Round2Questionnaire } from './Round2Questionnaire';

interface QuestionnaireProps {
  onClose: () => void;
  coachLink?: string;
  email?: string;
  franchiseOwnerId?: string | null;
}

export function Questionnaire({ onClose, coachLink, email, franchiseOwnerId }: QuestionnaireProps) {
  const [screen, setScreen] = useState<'registration' | 'welcome' | 'assessment' | 'results'>('registration');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: email || '' });
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [errors, setErrors] = useState({ name: false, email: false, disclaimer: false, parental: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [showRound2, setShowRound2] = useState(false);

  const totalQuestions = 344;
  const questions = questionnaireData;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  useEffect(() => {
    if (screen === 'assessment' && responseId) {
      autoSaveProgress();
    }
  }, [answers, currentQuestion, screen, responseId]);

  const autoSaveProgress = async () => {
    if (!responseId) return;

    try {
      await supabase
        .from('responses')
        .update({
          answers: answers,
          current_question: currentQuestion,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', responseId);
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const validateAndProceed = async () => {
    const newErrors = {
      name: !customerInfo.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email),
      disclaimer: !disclaimerAccepted,
      parental: !parentalConsent
    };

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email && !newErrors.disclaimer && !newErrors.parental) {
      const { data: existingResponse } = await supabase
        .from('responses')
        .select('*')
        .eq('customer_email', customerInfo.email)
        .eq('status', 'in_progress')
        .is('parent_response_id', null)
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingResponse) {
        const shouldResume = window.confirm(
          `We found an in-progress assessment for this email. You were at question ${existingResponse.current_question + 1} of ${totalQuestions}.\n\nWould you like to resume where you left off?`
        );

        if (shouldResume) {
          setResponseId(existingResponse.id);
          setCurrentQuestion(existingResponse.current_question || 0);
          setAnswers(existingResponse.answers || {});
          setScreen('assessment');
          return;
        }
      }

      const { data, error } = await supabase
        .from('responses')
        .insert({
          questionnaire_id: '228eda41-e4d7-4a13-9e31-829e2dff35c1',
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          status: 'in_progress',
          entry_type: coachLink ? 'coach_link' : 'random_visitor',
          email_verified: !!coachLink,
          franchise_owner_id: franchiseOwnerId || null,
          current_question: 0,
          last_activity_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        alert('Error starting assessment: ' + error.message);
        return;
      }

      if (data) {
        setResponseId(data.id);
        setScreen('welcome');
      }
    }
  };

  const selectOption = (value: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeAssessment = async () => {
    if (!responseId) return;

    setIsSubmitting(true);

    try {
      await supabase
        .from('responses')
        .update({
          answers: answers,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', responseId);

      setScreen('results');
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Error completing assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-purple-800 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-600 border-b">
            All copyrights belong to BrainWorx | Confidential
          </div>

          <div className="bg-white px-8 py-8 text-center border-b-4 border-purple-600">
            <img
              src="/brainworx-logo.png"
              alt="BrainWorx Logo"
              className="w-48 h-auto mx-auto mb-4"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">Neural Imprint Patterns</h1>
            <p className="text-lg text-gray-600">Professional Assessment by BrainWorx</p>
          </div>

          {screen === 'registration' && (
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Welcome to Your Assessment</h2>
              <p className="text-center text-gray-600 mb-8">Please provide your information below.</p>

              <div className="max-w-lg mx-auto">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Your Information
                  </h3>
                  <p className="text-sm text-blue-800">
                    Your details will appear on your report and be used to schedule your free 45-minute coaching session.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-purple-600 transition ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-2">Please enter your full name</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-purple-600 transition ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-2">Please enter a valid email</p>}
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Important Disclaimer - Please Read
                  </h4>
                  <p className="text-yellow-900 text-sm mb-3">
                    <strong>This is a self-assessment tool for personal insight only.</strong> It is NOT a psychological evaluation, clinical diagnosis, or medical assessment.
                  </p>
                  <ul className="text-yellow-900 text-sm space-y-2 mb-4 ml-5 list-disc">
                    <li>Does NOT diagnose mental health conditions</li>
                    <li>Does NOT replace professional evaluation</li>
                    <li>Does NOT constitute medical advice or therapy</li>
                    <li>If you have concerns, consult a licensed professional</li>
                  </ul>
                  <div className="bg-white border-2 border-yellow-900 rounded-lg p-4 mb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                        className="w-5 h-5 mt-1 cursor-pointer"
                      />
                      <span className="text-sm text-gray-800">
                        <strong>I understand and agree</strong> that this is a self-assessment tool only, not diagnostic, and does not replace professional mental health care.
                      </span>
                    </label>
                  </div>
                  {errors.disclaimer && <p className="text-red-500 text-sm mt-2">You must accept the disclaimer</p>}

                  <div className="bg-white border-2 border-yellow-900 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={parentalConsent}
                        onChange={(e) => setParentalConsent(e.target.checked)}
                        className="w-5 h-5 mt-1 cursor-pointer"
                      />
                      <span className="text-sm text-gray-800">
                        <strong>Parental Consent:</strong> I confirm that I am the parent/legal guardian and give consent for this assessment.
                      </span>
                    </label>
                  </div>
                  {errors.parental && <p className="text-red-500 text-sm mt-2">Parental consent is required</p>}
                </div>

                <button
                  onClick={validateAndProceed}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition"
                >
                  Continue to Assessment
                </button>
              </div>
            </div>
          )}

          {screen === 'welcome' && (
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {customerInfo.name}!</h2>
              <div className="prose max-w-none text-gray-700 space-y-4">
                <p>
                  <strong>Neural Imprint Patterns</strong> are deeply embedded psychological and behavioral configurations that form lasting imprints through repeated experiences, trauma, or developmental conditioning.
                </p>
                <p>
                  This assessment contains <strong>{totalQuestions} questions</strong> evaluating 20 different neural imprint patterns.
                </p>
                <p><strong>Instructions:</strong></p>
                <ul className="ml-6 space-y-2">
                  <li>Answer honestly based on how you typically feel or behave</li>
                  <li>Choose from 4 options ranging from "Does not describe me at all" to "Describes me completely"</li>
                  <li>No right or wrong answers</li>
                  <li>Takes approximately 20-30 minutes</li>
                  <li>Your progress is saved automatically</li>
                </ul>
                <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-6 my-6">
                  <h3 className="font-bold text-blue-900 mb-2">What You'll Receive:</h3>
                  <p className="text-blue-900">
                    A comprehensive scoring report showing your results across all 20 Neural Imprint Patterns with detailed analysis.
                  </p>
                </div>
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-6">
                  <h3 className="font-bold text-yellow-900 mb-2">Get Your Complete Analysis</h3>
                  <p className="text-yellow-900 mb-2">
                    For comprehensive one-on-one assessment with detailed analysis and personalized insights, book a <strong>45-minute coaching session</strong> with our certified coaches.
                  </p>
                  <p className="text-yellow-900 font-semibold">
                    This session is <span className="text-green-700">FREE</span> and included with your assessment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScreen('assessment')}
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition"
              >
                Begin Assessment
              </button>
            </div>
          )}

          {screen === 'assessment' && (
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-800 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-gray-600 font-semibold mt-3">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 mb-6 shadow-md">
                <div className="text-purple-600 font-semibold mb-3">
                  Question {currentQuestion + 1} of {totalQuestions}
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-6 leading-relaxed">
                  {currentQ.question}
                </h3>

                <div className="space-y-3">
                  {currentQ.options.map((option) => (
                    <div
                      key={option}
                      onClick={() => selectOption(option)}
                      className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4 ${
                        answers[currentQ.id] === option
                          ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg'
                          : 'border-gray-200 hover:border-purple-400 hover:shadow-md hover:translate-x-1'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentQ.id] === option
                          ? 'border-white bg-white'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQ.id] === option && (
                          <div className="w-3 h-3 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex-1 bg-gray-500 text-white py-4 rounded-full font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={!answers[currentQ.id] || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-full font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : currentQuestion === totalQuestions - 1 ? 'View Results' : 'Next'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {screen === 'results' && responseId && (
            <div className="p-8">
              {!showRound2 ? (
                <AnalysisReport
                  responseId={responseId}
                  onStartRound2={() => setShowRound2(true)}
                  onClose={onClose}
                />
              ) : (
                <Round2Questionnaire
                  parentResponseId={responseId}
                  onComplete={onClose}
                  onClose={() => setShowRound2(false)}
                />
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-lg"
          >
            <CheckCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
