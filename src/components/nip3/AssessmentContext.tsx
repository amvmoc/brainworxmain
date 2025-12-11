import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, Answer, AnswerValue, NIPResult, AssessmentResults } from './types';
import { calculateNIPResults } from './scoring';
import questionsData from '../../data/nip3/questions.json';
import { supabase } from '../../lib/supabase';

interface AssessmentContextType {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<number, Answer>;
  isComplete: boolean;
  results: AssessmentResults | null;
  answerQuestion: (questionId: number, value: AnswerValue, option: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  progress: number;
  email?: string;
  customerName?: string;
  franchiseOwnerId?: string | null;
  couponId?: string | null;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};

interface AssessmentProviderProps {
  children: ReactNode;
  initialEmail?: string;
  initialCustomerName?: string;
  initialFranchiseOwnerId?: string | null;
  initialCouponId?: string | null;
}

export const AssessmentProvider: React.FC<AssessmentProviderProps> = ({
  children,
  initialEmail,
  initialCustomerName,
  initialFranchiseOwnerId,
  initialCouponId
}) => {
  const [questions] = useState<Question[]>(questionsData.questions as Question[]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [email] = useState(initialEmail);
  const [customerName] = useState(initialCustomerName);
  const [franchiseOwnerId] = useState(initialFranchiseOwnerId);
  const [couponId] = useState(initialCouponId);
  const [responseId, setResponseId] = useState<string | null>(null);

  // Initialize database record if we have user information
  useEffect(() => {
    const initializeResponse = async () => {
      if (email && customerName) {
        const { data: existingResponse } = await supabase
          .from('responses')
          .select('*')
          .eq('customer_email', email)
          .eq('status', 'in_progress')
          .is('parent_response_id', null)
          .order('last_activity_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingResponse) {
          const shouldResume = window.confirm(
            `We found an in-progress assessment for this email. You were at question ${(existingResponse.current_question || 0) + 1} of ${questions.length}.\n\nWould you like to resume where you left off?`
          );

          if (shouldResume) {
            setResponseId(existingResponse.id);
            setCurrentQuestionIndex(existingResponse.current_question || 0);

            const savedAnswers = existingResponse.answers || {};
            const answersMap = new Map<number, Answer>();
            Object.entries(savedAnswers).forEach(([key, value]: [string, any]) => {
              answersMap.set(parseInt(key), value);
            });
            setAnswers(answersMap);
            return;
          }
        }

        const { data, error } = await supabase
          .from('responses')
          .insert({
            customer_name: customerName,
            customer_email: email,
            status: 'in_progress',
            entry_type: franchiseOwnerId ? 'coach_link' : 'random_visitor',
            email_verified: !!franchiseOwnerId,
            franchise_owner_id: franchiseOwnerId || null,
            coupon_id: couponId || null,
            current_question: 0,
            last_activity_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating response:', error);
        } else if (data) {
          setResponseId(data.id);
        }
      }
    };

    initializeResponse();
  }, [email, customerName, franchiseOwnerId, couponId, questions.length]);

  // Load saved progress from localStorage (fallback for users without database record)
  useEffect(() => {
    if (!email && !customerName) {
      const saved = localStorage.getItem('assessment-progress');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setCurrentQuestionIndex(data.currentIndex || 0);
          setAnswers(new Map(data.answers || []));
        } catch (e) {
          console.error('Failed to load saved progress:', e);
        }
      }
    }
  }, [email, customerName]);

  // Save progress to database and localStorage
  useEffect(() => {
    const saveProgress = async () => {
      if (answers.size > 0 && !isComplete) {
        if (responseId) {
          const answersObj: Record<number, Answer> = {};
          answers.forEach((value, key) => {
            answersObj[key] = value;
          });

          await supabase
            .from('responses')
            .update({
              answers: answersObj,
              current_question: currentQuestionIndex,
              last_activity_at: new Date().toISOString()
            })
            .eq('id', responseId);
        }

        const data = {
          currentIndex: currentQuestionIndex,
          answers: Array.from(answers.entries()),
        };
        localStorage.setItem('assessment-progress', JSON.stringify(data));
      }
    };

    saveProgress();
  }, [answers, currentQuestionIndex, isComplete, responseId]);

  const answerQuestion = (questionId: number, value: AnswerValue, option: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, {
      questionId,
      value,
      option: option as any,
    });
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const completeAssessment = async () => {
    if (answers.size === questions.length) {
      const answersArray = Array.from(answers.values());
      const nipResults = calculateNIPResults(answersArray, questions);

      const assessmentResults: AssessmentResults = {
        answers: answersArray,
        nipResults,
        completedAt: new Date(),
        overallPercentage: nipResults.reduce((sum, nip) => sum + nip.percentage, 0) / nipResults.length,
      };

      setResults(assessmentResults);
      setIsComplete(true);

      if (responseId) {
        const answersObj: Record<number, Answer> = {};
        answers.forEach((value, key) => {
          answersObj[key] = value;
        });

        await supabase
          .from('responses')
          .update({
            status: 'completed',
            answers: answersObj,
            completed_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          })
          .eq('id', responseId);
      }

      localStorage.setItem('assessment-results', JSON.stringify({
        ...assessmentResults,
        completedAt: assessmentResults.completedAt.toISOString(),
      }));

      localStorage.removeItem('assessment-progress');
    }
  };

  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setIsComplete(false);
    setResults(null);
    localStorage.removeItem('assessment-progress');
    localStorage.removeItem('assessment-results');
  };

  const progress = (answers.size / questions.length) * 100;

  return (
    <AssessmentContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        answers,
        isComplete,
        results,
        answerQuestion,
        nextQuestion,
        previousQuestion,
        goToQuestion,
        completeAssessment,
        resetAssessment,
        progress,
        email,
        customerName,
        franchiseOwnerId,
        couponId,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};
