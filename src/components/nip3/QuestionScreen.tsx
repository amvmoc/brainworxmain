import React, { useEffect } from 'react';
import { useAssessment } from './AssessmentContext';
import { ANSWER_OPTIONS } from './types';
import './QuestionScreen.css';

interface QuestionScreenProps {
  onComplete: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({ onComplete }) => {
  const {
    questions,
    currentQuestionIndex,
    answers,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    completeAssessment
  } = useAssessment();

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion.id);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = answers.size === questions.length;

  console.log('QuestionScreen rendering:', {
    currentQuestionIndex,
    questionId: currentQuestion?.id,
    answersCount: answers.size
  });

  useEffect(() => {
    // Auto-scroll to top when question changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (value: number) => {
    const option = ANSWER_OPTIONS.find(opt => opt.value === value);
    if (option) {
      answerQuestion(currentQuestion.id, value as any, option.label);
      
      // Auto-advance to next question after short delay
      setTimeout(() => {
        if (!isLastQuestion) {
          nextQuestion();
        }
      }, 300);
    }
  };

  const handleComplete = () => {
    if (allAnswered) {
      completeAssessment();
      onComplete();
    }
  };

  return (
    <div className="question-screen">
      <div className="question-header">
        <div className="question-number">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="answers-count">
          Answered: {answers.size} / {questions.length}
        </div>
      </div>

      <div className="question-card">
        <h2 className="question-text">{currentQuestion.text}</h2>

        <div className="answer-options">
          {ANSWER_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`answer-button ${currentAnswer?.value === option.value ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(option.value)}
            >
              <span className="answer-label">{option.label}</span>
              {currentAnswer?.value === option.value && (
                <span className="checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="navigation-buttons">
        <button
          className="nav-button secondary"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </button>

        {!isLastQuestion ? (
          <button
            className="nav-button primary"
            onClick={nextQuestion}
            disabled={!currentAnswer}
          >
            Next →
          </button>
        ) : (
          <button
            className="nav-button complete"
            onClick={handleComplete}
            disabled={!allAnswered}
          >
            {allAnswered ? 'Complete Assessment ✓' : `${questions.length - answers.size} questions remaining`}
          </button>
        )}
      </div>

      <div className="quick-nav">
        <h4>Quick Navigation</h4>
        <div className="question-dots">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`question-dot ${index === currentQuestionIndex ? 'current' : ''} ${
                answers.has(questions[index].id) ? 'answered' : ''
              }`}
              onClick={() => {
                const assessment = useAssessment();
                assessment.goToQuestion(index);
              }}
              title={`Question ${index + 1}${answers.has(questions[index].id) ? ' (Answered)' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
