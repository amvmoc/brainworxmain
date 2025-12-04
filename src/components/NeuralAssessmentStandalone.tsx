import React, { useState, useEffect } from 'react';
import { AlertCircle, Brain, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  pattern: string;
  options: Array<{ value: number; text: string }>;
}

interface UserInfo {
  name: string;
  email: string;
}

interface PatternResult {
  code: string;
  name: string;
  shortName: string;
  score: number;
}

interface SavedProgress {
  userInfo: UserInfo;
  currentQuestion: number;
  answers: Record<number, number>;
  timestamp: string;
}

const NEURAL_PATTERNS = {
  TRAP: { name: "Home/Work", shortName: "TRAP" },
  SHT: { name: "Shattered Worth", shortName: "SHT" },
  ORG: { name: "Time & Order", shortName: "ORG" },
  NEGP: { name: "Unmet Needs", shortName: "NEGP" },
  HYP: { name: "High Gear", shortName: "HYP" },
  DOG: { name: "Dogmatic Chains", shortName: "DOG" },
  IMP: { name: "Impulse Rush", shortName: "IMP" },
  NUH: { name: "Numb Heart", shortName: "NUH" },
  DIS: { name: "Mind In Distress", shortName: "DIS" },
  ANG: { name: "Anchored Anger", shortName: "ANG" },
  INFL: { name: "Inside Out", shortName: "INFL" },
  BULLY: { name: "Victim Loops", shortName: "BULLY" },
  LACK: { name: "Lack State", shortName: "LACK" },
  DIM: { name: "Dim Reality", shortName: "DIM" },
  FOC: { name: "Scattered Focus", shortName: "FOC" },
  RES: { name: "Attitude", shortName: "RES" },
  INWF: { name: "Inward Focus", shortName: "INWF" },
  CPL: { name: "Addictive Loops", shortName: "CPL" },
  BURN: { name: "Burned Out", shortName: "BURN" },
  DEC: { name: "Deceiver", shortName: "DEC" }
};

const QUESTIONS: Question[] = [
  { id: 1, question: "I often feel that my emotions are stronger than I can easily manage.", pattern: "TRAP", options: [{ value: 1, text: "Does not describe me at all" }, { value: 2, text: "Describes me a little" }, { value: 3, text: "Describes me quite a lot" }, { value: 4, text: "Describes me completely" }] },
  { id: 2, question: "I find it difficult to relax, even when I have time to rest.", pattern: "TRAP", options: [{ value: 1, text: "Does not describe me at all" }, { value: 2, text: "Describes me a little" }, { value: 3, text: "Describes me quite a lot" }, { value: 4, text: "Describes me completely" }] },
  { id: 3, question: "After a setback, I usually recover my balance fairly quickly.", pattern: "TRAP", options: [{ value: 1, text: "Does not describe me at all" }, { value: 2, text: "Describes me a little" }, { value: 3, text: "Describes me quite a lot" }, { value: 4, text: "Describes me completely" }] },
  { id: 4, question: "I feel stuck in patterns that I wish I could change.", pattern: "SHT", options: [{ value: 1, text: "Does not describe me at all" }, { value: 2, text: "Describes me a little" }, { value: 3, text: "Describes me quite a lot" }, { value: 4, text: "Describes me completely" }] },
  { id: 5, question: "I am able to balance my own needs with the needs of others.", pattern: "SHT", options: [{ value: 1, text: "Does not describe me at all" }, { value: 2, text: "Describes me a little" }, { value: 3, text: "Describes me quite a lot" }, { value: 4, text: "Describes me completely" }] },
];

const NeuralAssessmentStandalone: React.FC = () => {
  const [screen, setScreen] = useState<'registration' | 'welcome' | 'assessment' | 'results'>('registration');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [errors, setErrors] = useState({ name: false, email: false, disclaimer: false });
  const [results, setResults] = useState<PatternResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    if (screen === 'assessment' && Object.keys(answers).length > 0) {
      saveProgress();
    }
  }, [answers, currentQuestion, screen]);

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem('neural_assessment_progress');
      if (saved) {
        const data: SavedProgress = JSON.parse(saved);
        const hasAnswers = Object.keys(data.answers).length > 0;

        if (hasAnswers) {
          const resume = window.confirm(
            `Welcome back! We found your saved progress from ${new Date(data.timestamp).toLocaleString()}.\n\n` +
            `You were at question ${data.currentQuestion + 1} of ${QUESTIONS.length}.\n\n` +
            `Would you like to continue where you left off?`
          );

          if (resume) {
            setUserInfo(data.userInfo);
            setAnswers(data.answers);
            setCurrentQuestion(data.currentQuestion);
            setScreen('assessment');
          }
        }
      }
    } catch (error) {
      console.log('No saved progress found');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = () => {
    try {
      const progressData: SavedProgress = {
        userInfo,
        currentQuestion,
        answers,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('neural_assessment_progress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const clearProgress = () => {
    try {
      localStorage.removeItem('neural_assessment_progress');
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  };

  const validateAndProceed = () => {
    const newErrors = {
      name: !userInfo.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email),
      disclaimer: !disclaimerAccepted
    };

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email && !newErrors.disclaimer) {
      setScreen('welcome');
    }
  };

  const selectOption = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const scores: Record<string, { total: number; count: number }> = {};
    Object.keys(NEURAL_PATTERNS).forEach(code => {
      scores[code] = { total: 0, count: 0 };
    });

    QUESTIONS.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        scores[question.pattern].total += answer;
        scores[question.pattern].count += 1;
      }
    });

    const calculatedResults: PatternResult[] = Object.entries(NEURAL_PATTERNS).map(([code, pattern]) => {
      const score = scores[code];
      const maxPossible = score.count * 4;
      const percentage = maxPossible > 0 ? (score.total / maxPossible) * 100 : 0;

      return {
        code,
        name: pattern.name,
        shortName: pattern.shortName,
        score: Math.round(percentage)
      };
    });

    calculatedResults.sort((a, b) => b.score - a.score);
    setResults(calculatedResults);
    clearProgress();
    setScreen('results');
  };

  const restartAssessment = () => {
    setScreen('registration');
    setUserInfo({ name: '', email: '' });
    setCurrentQuestion(0);
    setAnswers({});
    setDisclaimerAccepted(false);
    setErrors({ name: false, email: false, disclaimer: false });
    clearProgress();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4 md:p-8">
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
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-purple-600 transition ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-2">Please enter your full name</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
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
                <div className="bg-white border-2 border-yellow-900 rounded-lg p-4">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {userInfo.name}!</h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>
                <strong>Neural Imprint Patterns</strong> are deeply embedded psychological and behavioral configurations that form lasting imprints through repeated experiences, trauma, or developmental conditioning.
              </p>
              <p>
                This assessment contains <strong>{QUESTIONS.length} questions</strong> evaluating 20 different neural imprint patterns.
              </p>
              <p><strong>Instructions:</strong></p>
              <ul className="ml-6 space-y-2">
                <li>Answer honestly based on how you typically feel or behave</li>
                <li>Choose from 4 options ranging from "Does not describe me at all" to "Describes me completely"</li>
                <li>No right or wrong answers</li>
                <li>Takes approximately 20-30 minutes</li>
                <li>You can navigate back and forth between questions</li>
              </ul>
              <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-6 my-6">
                <h3 className="font-bold text-blue-900 mb-2">What You'll Receive:</h3>
                <p className="text-blue-900">
                  A scoring graph showing your results across all 20 Neural Imprint Patterns.
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
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 mb-6 shadow-md">
              <div className="text-purple-600 font-semibold mb-3">
                Question {currentQ.id} of {QUESTIONS.length}
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-6 leading-relaxed">
                {currentQ.question}
              </h3>

              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => selectOption(currentQ.id, option.value)}
                    className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4 ${
                      answers[currentQ.id] === option.value
                        ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg'
                        : 'border-gray-200 hover:border-purple-400 hover:shadow-md hover:translate-x-1'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[currentQ.id] === option.value
                        ? 'border-white bg-white'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQ.id] === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-600" />
                      )}
                    </div>
                    <span className="flex-1">{option.text}</span>
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
                disabled={!answers[currentQ.id]}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-full font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {currentQuestion === QUESTIONS.length - 1 ? 'View Results' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {screen === 'results' && (
          <div className="p-8 md:p-12">
            <div className="bg-purple-100 border-2 border-purple-600 rounded-xl p-6 mb-6">
              <h3 className="text-purple-900 font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Assessment Report
              </h3>
              <p className="text-purple-900"><strong>Name:</strong> {userInfo.name}</p>
              <p className="text-purple-900"><strong>Email:</strong> {userInfo.email}</p>
              <p className="text-purple-900 text-sm mt-2">
                <strong>Report Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Neural Imprint Profile</h2>
              <p className="text-gray-700 mb-4">
                Your assessment is complete! Below is your scoring graph showing results across all 20 patterns.
              </p>

              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-5">
                <h3 className="font-bold text-yellow-900 mb-2">Next Step: Book Your Coaching Session</h3>
                <p className="text-yellow-900 mb-2">
                  To receive your <strong>comprehensive in-depth analysis</strong> including:
                </p>
                <ul className="text-yellow-900 text-sm space-y-1 ml-5 list-disc mb-3">
                  <li>Detailed interpretation of results</li>
                  <li>Personalized insights and recommendations</li>
                  <li>Strategies for resolution and growth</li>
                  <li>One-on-one professional guidance</li>
                </ul>
                <p className="text-yellow-900 font-semibold">
                  Contact BrainWorx at <span className="underline">{userInfo.email}</span> to schedule your <span className="text-green-700">FREE</span> 45-minute session.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-6">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
                Neural Imprint Patterns - Scoring Overview
              </h3>

              <div className="space-y-4">
                {results.map((result, index) => {
                  const barColor = result.score >= 60 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                   result.score >= 40 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                   'bg-gradient-to-r from-blue-500 to-blue-600';

                  return (
                    <div key={result.code} className="flex items-center gap-4">
                      <div className="w-28 font-semibold text-gray-700 text-sm">
                        {result.shortName}
                      </div>
                      <div className="flex-1 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full ${barColor} flex items-center justify-end pr-3 text-white font-semibold transition-all duration-1000 ease-out`}
                          style={{
                            width: `${result.score}%`,
                            transitionDelay: `${index * 50}ms`
                          }}
                        >
                          {result.score}%
                        </div>
                      </div>
                      <div className="w-16 text-right font-bold text-purple-600 text-lg">
                        {result.score}%
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-8 mt-8 pt-8 border-t-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded" />
                  <span className="text-sm text-gray-700">High (60-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded" />
                  <span className="text-sm text-gray-700">Medium (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded" />
                  <span className="text-sm text-gray-700">Low (0-39%)</span>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm italic mb-6">
              This report is confidential and prepared for {userInfo.name}. All copyrights belong to BrainWorx
            </p>

            <div className="bg-gray-50 border-t-2 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 text-center italic leading-relaxed">
                <strong>Disclaimer:</strong> This assessment is for informational purposes only and is not a diagnostic tool.
                It does not replace professional psychological or medical evaluation. Consult qualified healthcare providers
                for mental health concerns.
              </p>
            </div>

            <button
              onClick={restartAssessment}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition"
            >
              Take Assessment Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralAssessmentStandalone;
