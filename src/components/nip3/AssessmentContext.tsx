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
  const [existingResponseData, setExistingResponseData] = useState<any>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize database record if we have user information
  useEffect(() => {
    const initializeResponse = async () => {
      if (email && customerName && !hasInitialized) {
        console.log('Initializing assessment for:', email);
        setHasInitialized(true);

        try {
          const { data: existingResponse, error: fetchError } = await supabase
            .from('responses')
            .select('*')
            .eq('customer_email', email)
            .eq('status', 'in_progress')
            .is('parent_response_id', null)
            .order('last_activity_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching existing response:', fetchError);
          }

          if (existingResponse) {
            console.log('Found existing in-progress assessment:', existingResponse.id);
            setExistingResponseData(existingResponse);
            setShowResumePrompt(true);
            return; // Wait for user decision
          } else {
            console.log('No existing in-progress assessment found');
          }

          console.log('Creating new assessment response');
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
            alert('Failed to initialize assessment. Please try again.');
          } else if (data) {
            console.log('New assessment created:', data.id);
            setResponseId(data.id);
          }
        } catch (err) {
          console.error('Unexpected error in initializeResponse:', err);
          alert('An error occurred while initializing the assessment. Please try again.');
        }
      } else {
        console.log('Skipping initialization - email or customerName missing:', { email, customerName });
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

  const handleResumeExisting = () => {
    try {
      if (!existingResponseData) {
        console.error('handleResumeExisting called but no existingResponseData!');
        return;
      }

      console.log('Starting resume process...');
      console.log('Existing response data:', {
        id: existingResponseData.id,
        current_question: existingResponseData.current_question,
        answers_count: Object.keys(existingResponseData.answers || {}).length
      });

      const responseIdToSet = existingResponseData.id;
      const questionIndex = existingResponseData.current_question || 0;
      const savedAnswers = existingResponseData.answers || {};

      console.log('Setting responseId to:', responseIdToSet);
      setResponseId(responseIdToSet);

      console.log('Setting current question index to:', questionIndex);
      setCurrentQuestionIndex(questionIndex);

      const answersMap = new Map<number, Answer>();
      Object.entries(savedAnswers).forEach(([key, value]: [string, any]) => {
        answersMap.set(parseInt(key), value);
      });

      console.log('Setting answers map with', answersMap.size, 'answers');
      setAnswers(answersMap);

      console.log('Closing resume prompt modal');
      setShowResumePrompt(false);
      setExistingResponseData(null);

      console.log('Resume complete!');
    } catch (error) {
      console.error('Error in handleResumeExisting:', error);
      alert('Failed to resume assessment. Please try again or start fresh.');
      setShowResumePrompt(false);
      setExistingResponseData(null);
    }
  };

  const handleStartFresh = async () => {
    try {
      console.log('User chose to start fresh assessment');
      console.log('Closing resume prompt modal');
      setShowResumePrompt(false);
      setExistingResponseData(null);

      if (email && customerName) {
        console.log('Creating new assessment response for:', email);

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
          alert('Failed to initialize new assessment. Please try again.');
        } else if (data) {
          console.log('New assessment created successfully:', data.id);
          setResponseId(data.id);
          console.log('Start fresh complete!');
        }
      } else {
        console.error('Cannot create assessment - email or customerName missing');
      }
    } catch (error) {
      console.error('Error in handleStartFresh:', error);
      alert('An error occurred while starting new assessment. Please try again.');
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

        const analysisResults = {
          completedAt: new Date().toISOString(),
          overallScore: Math.round(assessmentResults.overallPercentage),
          totalQuestions: questions.length,
          neuralImprintPatternScores: nipResults.map(nip => ({
            code: nip.code,
            name: nip.name,
            score: Math.round(nip.percentage),
            actualScore: nip.actualScore,
            maxScore: nip.maxScore,
            totalQuestions: nip.totalQuestions
          }))
        };

        await supabase
          .from('responses')
          .update({
            status: 'completed',
            answers: answersObj,
            analysis_results: analysisResults,
            completed_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          })
          .eq('id', responseId);

        // Send client report to customer
        try {
          console.log('Sending NIP3 client report to customer:', email);
          const results = nipResults.map(nip => ({
            code: nip.code,
            shortName: nip.name,
            percentage: Math.round(nip.percentage),
            actualScore: nip.actualScore,
            maxScore: nip.maxScore,
            totalQuestions: nip.totalQuestions,
            level: nip.percentage >= 70 ? 'Strongly Present' : nip.percentage >= 50 ? 'Moderately Present' : nip.percentage >= 30 ? 'Mild Pattern' : 'Minimal Pattern'
          }));

          const { error: clientEmailError } = await supabase.functions.invoke('send-nip3-results', {
            body: {
              recipients: [email],
              results: results,
              completedAt: new Date().toISOString()
            }
          });

          if (clientEmailError) {
            console.error('Error sending NIP3 client report:', clientEmailError);
          } else {
            console.log('NIP3 client report sent successfully to customer!');
          }
        } catch (error) {
          console.error('Failed to send NIP3 client report:', error);
        }

        // Send comprehensive coach report email to franchise owner if applicable
        if (franchiseOwnerId) {
          try {
            console.log('Sending comprehensive coach report to franchise owner...');
            const { error: emailError } = await supabase.functions.invoke('send-comprehensive-coach-report', {
              body: {
                responseId,
                customerName,
                customerEmail: email
              }
            });

            if (emailError) {
              console.error('Error sending comprehensive coach report:', emailError);
            } else {
              console.log('Comprehensive coach report sent successfully!');
            }
          } catch (error) {
            console.error('Failed to send comprehensive coach report:', error);
          }
        }
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
      {showResumePrompt && existingResponseData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#0A2A5E',
              marginBottom: '16px'
            }}>
              Resume Previous Assessment?
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              We found an in-progress assessment for <strong>{email}</strong>.
              You were at question <strong>{(existingResponseData.current_question || 0) + 1}</strong> of <strong>{questions.length}</strong>.
            </p>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              Would you like to resume where you left off, or start a new assessment?
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={handleStartFresh}
                style={{
                  flex: 1,
                  backgroundColor: '#E5E7EB',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              >
                Start Fresh
              </button>
              <button
                onClick={handleResumeExisting}
                style={{
                  flex: 1,
                  backgroundColor: '#0A2A5E',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3DB3E3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0A2A5E'}
              >
                Resume Assessment
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </AssessmentContext.Provider>
  );
};
