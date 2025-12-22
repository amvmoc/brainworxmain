import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PATTERN_INFO, getSeverityLabel1118, scoreToPercentage } from '../data/adhd1118AssessmentQuestions';

interface PatternScore {
  code: string;
  name: string;
  category: string;
  teenScore: number;
  teenLabel: string;
  percentage: number;
}

interface ADHD1118CoachReportProps {
  teenInfo: {
    name: string;
    age: number;
  };
  teenEmail: string;
  coachInfo?: {
    name: string;
  };
  patterns: PatternScore[];
  date: string;
  onClose: () => void;
}

export default function ADHD1118CoachReport({
  teenInfo,
  teenEmail,
  coachInfo,
  patterns,
  date,
  onClose
}: ADHD1118CoachReportProps) {
  const corePatterns = patterns.filter(p => p.category === 'Core ADHD');
  const emotionalPatterns = patterns.filter(p => p.category === 'Emotional/Impact');

  const avgCoreScore = corePatterns.length > 0
    ? (corePatterns.reduce((sum, p) => sum + p.teenScore, 0) / corePatterns.length).toFixed(2)
    : '0.00';

  const moderateOrHighCount = corePatterns.filter(p => p.teenScore >= 2.5).length;

  const getSeverityColor = (score: number): string => {
    if (score < 1.75) return '#10B981';
    if (score < 2.5) return '#F59E0B';
    if (score < 3.25) return '#F97316';
    return '#EF4444';
  };

  const getInterpretation = () => {
    const avgScore = parseFloat(avgCoreScore);

    if (moderateOrHighCount >= 3 || avgScore >= 2.5) {
      return "This teen's self-report indicates a notable ADHD-style pattern across multiple core domains. Scores suggest moderate-to-high difficulty with attention, organization, or impulse control. Further assessment and support strategies are recommended.";
    } else if (moderateOrHighCount >= 1 || avgScore >= 2.0) {
      return "This teen reports some ADHD-related challenges in one or more core areas. While not pervasive, these patterns may benefit from targeted coaching, environmental adjustments, or skill-building interventions.";
    } else {
      return "This teen's self-report suggests mild or occasional ADHD-style patterns. Scores are within a manageable range, though continued monitoring and support around any elevated emotional/impact domains is advisable.";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-y-auto z-50">
      <div className="min-h-screen">
        <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Assessments
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2">
            <div>
              <div className="w-32 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mb-3">
                BrainWorx
              </div>
              <div className="text-sm text-gray-600">
                <strong>BrainWorx</strong> – Neural Imprint Patterns (NIPP)<br />
                Teen ADHD Self-Assessment (11–18 years)
              </div>
            </div>
            <div className="text-right text-sm text-gray-700">
              <div><strong>Teen Name:</strong> {teenInfo.name}</div>
              <div><strong>Age:</strong> {teenInfo.age}</div>
              <div><strong>Email:</strong> {teenEmail}</div>
              {coachInfo && <div><strong>Coach:</strong> {coachInfo.name}</div>}
              <div><strong>Date:</strong> {date}</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Professional / Coach Report
          </h1>
          <p className="text-gray-700 mb-8 leading-relaxed">
            This report summarizes the teen's self-reported ADHD-style patterns and related
            emotional/impact domains. It is a screening and coaching tool and does not replace
            a full diagnostic assessment by a qualified healthcare professional.
          </p>

          {/* Overall ADHD Pattern Indicator */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Overall ADHD pattern indicator
            </h2>

            <div className="space-y-3">
              <p className="text-gray-800">
                <strong>Core patterns with Moderate/High scores:</strong> {moderateOrHighCount} out of 5
              </p>
              <p className="text-gray-800">
                <strong>Average core ADHD score:</strong> {avgCoreScore} (1.00–4.00 scale)
              </p>
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">Interpretation summary:</p>
                <p className="text-gray-700 leading-relaxed">{getInterpretation()}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 italic">
              Summary based solely on teen self-report. Integrate with developmental history,
              academic records, direct observation, and input from parents/teachers when available.
            </p>
          </div>

          {/* Core ADHD Domains */}
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Core ADHD domains
          </h2>

          <div className="space-y-6 mb-10">
            {corePatterns.map((pattern) => {
              const patternInfo = PATTERN_INFO[pattern.code as keyof typeof PATTERN_INFO];

              return (
                <div key={pattern.code} className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {pattern.code} – {pattern.name}
                  </h3>

                  {/* Score Display */}
                  <div className="mb-4 bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Self-Reported Score:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{pattern.teenScore.toFixed(2)}</span>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: getSeverityColor(pattern.teenScore) + '20',
                            color: getSeverityColor(pattern.teenScore)
                          }}
                        >
                          {pattern.teenLabel}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                      <div
                        className="h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${pattern.percentage}%`,
                          backgroundColor: getSeverityColor(pattern.teenScore)
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {pattern.percentage}% of maximum intensity
                    </p>
                  </div>

                  {/* Pattern Description */}
                  {patternInfo && (
                    <div className="bg-white rounded-lg p-4 mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">What this pattern means:</p>
                      <p className="text-sm text-gray-700">{patternInfo.shortDescription}</p>
                    </div>
                  )}

                  {/* Clinical Notes */}
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
                    <p className="font-semibold mb-2">Coaching considerations:</p>
                    <p className="italic">
                      Teen self-report provides valuable insight into their subjective experience.
                      Compare with parent/teacher observations when available. Elevated scores
                      suggest areas where support strategies and skill-building may be beneficial.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emotional/Impact Domains */}
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            Emotional / impact domains
          </h2>

          <div className="space-y-6 mb-10">
            {emotionalPatterns.map((pattern) => {
              const patternInfo = PATTERN_INFO[pattern.code as keyof typeof PATTERN_INFO];

              return (
                <div key={pattern.code} className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {pattern.code} – {pattern.name}
                  </h3>

                  {/* Score Display */}
                  <div className="mb-4 bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Self-Reported Score:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{pattern.teenScore.toFixed(2)}</span>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: getSeverityColor(pattern.teenScore) + '20',
                            color: getSeverityColor(pattern.teenScore)
                          }}
                        >
                          {pattern.teenLabel}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                      <div
                        className="h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${pattern.percentage}%`,
                          backgroundColor: getSeverityColor(pattern.teenScore)
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {pattern.percentage}% of maximum intensity
                    </p>
                  </div>

                  {/* Pattern Description */}
                  {patternInfo && (
                    <div className="bg-white rounded-lg p-4 mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">What this pattern means:</p>
                      <p className="text-sm text-gray-700">{patternInfo.shortDescription}</p>
                    </div>
                  )}

                  {/* Clinical Notes */}
                  <div className="bg-amber-50 rounded-lg p-4 text-sm text-gray-700">
                    <p className="font-semibold mb-2">Impact considerations:</p>
                    <p className="italic">
                      Emotional and impact patterns often emerge as secondary consequences of
                      ongoing ADHD challenges. Addressing both core ADHD symptoms and emotional
                      well-being is essential for comprehensive support.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Important:</strong> This screening tool is for coaching and preliminary
              assessment purposes only. It does not replace a comprehensive evaluation by a
              qualified healthcare professional.
            </p>
            <p>
              For concerns about ADHD or related difficulties, please consult with a pediatrician,
              psychologist, or psychiatrist for a full diagnostic assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
