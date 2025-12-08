import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SelfAssessmentType } from '../data/selfAssessmentQuestions';
import { SelfAssessmentReport } from './SelfAssessmentReport';

interface SelfAssessmentQuestionnaireProps {
  onClose: () => void;
  assessmentType: SelfAssessmentType;
  coachLink?: string;
  email?: string;
  franchiseOwnerId?: string | null;
  couponId?: string | null;
}

export function SelfAssessmentQuestionnaire({
  onClose,
  assessmentType,
  coachLink,
  email,
  franchiseOwnerId,
  couponId
}: SelfAssessmentQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: email || '' });
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);

  const totalQuestions = assessmentType.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerInfo.name && customerInfo.email) {
      const { data: existingResponse, error: checkError } = await supabase
        .from('self_assessment_responses')
        .select('*')
        .eq('customer_email', customerInfo.email)
        .eq('assessment_type', assessmentType.id)
        .eq('status', 'in_progress')
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing response:', checkError);
      }

      if (existingResponse) {
        const shouldResume = window.confirm(
          `We found an in-progress ${assessmentType.name} assessment for this email. You were at question ${existingResponse.current_question + 1} of ${totalQuestions}.\n\nWould you like to resume where you left off?`
        );

        if (shouldResume) {
          setResponseId(existingResponse.id);
          setCurrentQuestion(existingResponse.current_question || 0);
          const savedAnswers = existingResponse.answers || {};
          const numericAnswers: Record<number, number> = {};
          Object.entries(savedAnswers).forEach(([key, value]) => {
            numericAnswers[parseInt(key)] = value as number;
          });
          setAnswers(numericAnswers);
          setCustomerInfo({ name: existingResponse.customer_name, email: existingResponse.customer_email });
          setShowCustomerForm(false);
          setShowDisclaimer(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('self_assessment_responses')
        .insert({
          assessment_type: assessmentType.id,
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
        console.error('Error creating response:', error);
        alert('Error starting assessment: ' + error.message);
        return;
      }

      if (data) {
        setResponseId(data.id);
        setShowCustomerForm(false);
      }
    }
  };

  const handleAnswer = async (score: number) => {
    const questionId = assessmentType.questions[currentQuestion].id;
    const updatedAnswers = { ...answers, [questionId]: score };
    setAnswers(updatedAnswers);

    if (responseId) {
      await supabase
        .from('self_assessment_responses')
        .update({
          answers: updatedAnswers,
          current_question: currentQuestion,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', responseId);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);

      if (responseId) {
        await supabase
          .from('self_assessment_responses')
          .update({
            current_question: nextQuestion,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', responseId);
      }
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (responseId) {
      await supabase
        .from('self_assessment_responses')
        .update({
          answers,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', responseId);

      if (couponId) {
        await supabase
          .from('coupon_redemptions')
          .update({ response_id: responseId })
          .eq('coupon_id', couponId)
          .eq('user_email', customerInfo.email);

        await supabase
          .from('coupon_codes')
          .update({ is_active: false })
          .eq('id', couponId);
      }

      setShowAnalysis(true);
    }

    setIsSubmitting(false);
  };

  const currentQuestionData = assessmentType.questions[currentQuestion];
  const questionId = currentQuestionData?.id;
  const currentAnswer = answers[questionId];

  if (showCustomerForm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-400 z-10"
            title="Exit assessment and return to main page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-3xl font-bold text-[#0A2A5E] mb-4">{assessmentType.name}</h2>
          <p className="text-gray-600 mb-4">
            {assessmentType.description}
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <p className="text-sm text-gray-700">{assessmentType.disclaimer}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0A2A5E] mb-2">Instructions:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{assessmentType.instructions}</p>
          </div>

          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-2">Important Disclaimer</p>
                  <p className="leading-relaxed">This assessment is a self-reflection and coaching tool, not a medical or psychological diagnosis. Results should not be used to start, change, or stop any medication or treatment.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#3DB3E3] focus:ring-[#3DB3E3] border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read, understood and agree to the disclaimer. I understand this is not a medical diagnosis and I will seek professional help where necessary.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={parentalConsent}
                  onChange={(e) => setParentalConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#3DB3E3] focus:ring-[#3DB3E3] border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  If the person taking this assessment is under 18 years of age, I confirm that I have parental/guardian consent.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!disclaimerAccepted || !parentalConsent}
              className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Begin Assessment ({totalQuestions} Questions)
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showDisclaimer) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-400 z-10"
            title="Exit assessment and return to main page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-[#0A2A5E] mb-6">Before We Begin</h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex gap-3 mb-4">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
              <h3 className="font-bold text-[#0A2A5E]">Important Disclaimer</h3>
            </div>
            <p className="text-gray-700">{assessmentType.disclaimer}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-[#0A2A5E] mb-3">How to Answer:</h3>
            <p className="text-gray-700 whitespace-pre-line">{assessmentType.instructions}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-[#0A2A5E] mb-3">Assessment Details:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={16} />
                <span>{totalQuestions} questions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={16} />
                <span>4-point scale rating</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={16} />
                <span>You can save and resume anytime</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={16} />
                <span>Detailed analysis upon completion</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowDisclaimer(false)}
            className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium"
          >
            I Understand - Let's Begin
          </button>
        </div>
      </div>
    );
  }

  if (showAnalysis) {
    return (
      <SelfAssessmentReport
        responseId={responseId!}
        assessmentType={assessmentType}
        customerEmail={customerInfo.email}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-400 z-10"
          title="Exit assessment and return to main page"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#0A2A5E]">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#0A2A5E] mb-6">
            {currentQuestionData.text}
          </h3>

          <div className="space-y-3">
            {assessmentType.scale.labels.map((label, index) => {
              const score = index + 1;
              return (
                <button
                  key={score}
                  onClick={() => handleAnswer(score)}
                  className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                    currentAnswer === score
                      ? 'border-[#3DB3E3] bg-[#3DB3E3]/10'
                      : 'border-gray-200 hover:border-[#3DB3E3]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-[#0A2A5E] w-8">{score}</span>
                      <span className="font-medium">{label}</span>
                    </div>
                    {currentAnswer === score && (
                      <CheckCircle className="text-[#3DB3E3]" size={20} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-[#0A2A5E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A2A5E] text-white rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Processing...
              </>
            ) : currentQuestion === totalQuestions - 1 ? (
              <>
                Submit
                <CheckCircle size={20} />
              </>
            ) : (
              <>
                Next
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            <strong>Important:</strong> By continuing with this assessment, you confirm that you understand it is a self-reflection and coaching tool, not a medical or psychological diagnosis, and that you will seek professional help where necessary.
          </p>
        </div>
      </div>
    </div>
  );
}
