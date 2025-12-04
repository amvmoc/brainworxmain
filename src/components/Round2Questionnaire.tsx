import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Loader, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { questionnaireData } from '../data/questions';
import { AnalysisReport } from './AnalysisReport';

interface Round2QuestionnaireProps {
  onClose: () => void;
  round1ResponseId: string;
  customerEmail: string;
  customerName: string;
}

export function Round2Questionnaire({ onClose, round1ResponseId, customerEmail, customerName }: Round2QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const totalQuestions = 344;
  const questions = questionnaireData;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  useState(() => {
    initializeRound2();
  });

  const initializeRound2 = async () => {
    const { data: existingResponse, error: checkError } = await supabase
      .from('responses')
      .select('*')
      .eq('customer_email', customerEmail)
      .eq('status', 'in_progress')
      .eq('parent_response_id', round1ResponseId)
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing round 2 response:', checkError);
    }

    if (existingResponse) {
      const shouldResume = window.confirm(
        `We found an in-progress Round 2 assessment. You were at question ${existingResponse.current_question + 1} of ${totalQuestions}.\n\nWould you like to resume where you left off?`
      );

      if (shouldResume) {
        setResponseId(existingResponse.id);
        setCurrentQuestion(existingResponse.current_question || 0);
        setAnswers(existingResponse.answers || {});
        setIsInitializing(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('responses')
      .insert({
        questionnaire_id: '228eda41-e4d7-4a13-9e31-829e2dff35c1',
        customer_name: customerName,
        customer_email: customerEmail,
        status: 'in_progress',
        entry_type: 'round_2',
        email_verified: true,
        parent_response_id: round1ResponseId,
        current_question: 0,
        last_activity_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating round 2 response:', error);
      alert('Error starting round 2: ' + error.message);
      return;
    }

    if (data) {
      setResponseId(data.id);
      setIsInitializing(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    const updatedAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(updatedAnswers);

    if (responseId) {
      await supabase
        .from('responses')
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
          .from('responses')
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
        .from('responses')
        .update({
          answers,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', responseId);

      setShowAnalysis(true);
    }

    setIsSubmitting(false);
  };

  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData?.id];

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-12 text-center">
          <Loader className="animate-spin text-[#3DB3E3] mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-bold text-[#0A2A5E] mb-2">Preparing Round 2</h3>
          <p className="text-gray-600">Setting up your next 344 questions...</p>
        </div>
      </div>
    );
  }

  if (showAnalysis) {
    return (
      <AnalysisReport
        responseId={responseId!}
        customerEmail={customerEmail}
        onClose={onClose}
        isRound2={true}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-400 z-10"
          title="Exit questionnaire and return to main page"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-[#3DB3E3]" size={24} />
            <span className="text-lg font-bold text-[#0A2A5E]">Round 2 Assessment</span>
            <span className="text-sm text-gray-500">(All 344 Questions)</span>
          </div>

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
          <div className="inline-block bg-[#E6E9EF] text-[#0A2A5E] px-4 py-1 rounded-full text-sm font-medium mb-4">
            {currentQuestionData.category}
          </div>
          <h3 className="text-2xl font-bold text-[#0A2A5E] mb-6">
            {currentQuestionData.text}
          </h3>

          <div className="space-y-3">
            {['Never', 'Rarely', 'Sometimes', 'Often', 'Always'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  currentAnswer === option
                    ? 'border-[#3DB3E3] bg-[#3DB3E3]/10 text-[#0A2A5E]'
                    : 'border-gray-200 hover:border-[#3DB3E3] text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {currentAnswer === option && <CheckCircle className="text-[#3DB3E3]" size={20} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-[#0A2A5E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A2A5E] text-white rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestion === totalQuestions - 1 ? (
              <>
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Round 2
                    <CheckCircle size={20} />
                  </>
                )}
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
