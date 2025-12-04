import { Brain, TrendingUp, Target, Award, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { useState } from 'react';
import { NeuralImprintPatternsHistogram } from './NeuralImprintPatternsHistogram';

export function SampleAnalysisDemo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  const sampleAnalysis = {
    overallScore: 64,
    neuralImprintPatternScores: [
      { code: 'DIS', name: 'Dissociation', score: 72, description: 'Unaddressed psychological or neurological conditions', severity: 'high' as const },
      { code: 'ANG', name: 'Emotional Anger', score: 45, description: 'Persistent state of anger anchored in past experiences', severity: 'low' as const },
      { code: 'SHT', name: 'Emotional Storm', score: 58, description: 'Endured emotional damage from individualistic harm', severity: 'moderate' as const },
      { code: 'LACK', name: 'Lack', score: 42, description: 'Limited access to financial means or material support', severity: 'low' as const },
      { code: 'NEG', name: 'Unmet Needs', score: 78, description: 'Requirements that have not driven healthy emotional growth', severity: 'high' as const },
      { code: 'BURN', name: 'Burned Out', score: 68, description: 'Mental, emotional, or physical depletion', severity: 'high' as const },
      { code: 'DEC', name: 'Deceiver', score: 85, description: 'Regularly deceives with hidden agendas', severity: 'critical' as const },
      { code: 'INFLUENCE', name: 'Inside Out', score: 71, description: 'Behavior patterns shaped by outside forces', severity: 'high' as const },
      { code: 'TRAP', name: 'Martyr Mode', score: 62, description: 'Ignores need for conscious chosen growth', severity: 'moderate' as const },
      { code: 'HOS', name: 'Heartless', score: 38, description: 'Disconnected from compassion and spiritual awareness', severity: 'low' as const },
      { code: 'BULLY', name: 'Victim', score: 35, description: 'External or internal victim mentality patterns', severity: 'low' as const },
      { code: 'LEFT/RIGHT', name: 'Brain', score: 55, description: 'Zoom In/Out thinking patterns', severity: 'moderate' as const },
      { code: 'CPL', name: 'Collusive Capers', score: 82, description: 'Unhealthy people-pleasing and emotional pain', severity: 'critical' as const },
      { code: 'RES', name: 'Pushback', score: 66, description: 'Consistent pattern of resistance to change', severity: 'high' as const },
      { code: 'NAR', name: 'Narcissist', score: 48, description: 'Amplified belief in own importance', severity: 'low' as const },
      { code: 'DOG', name: 'Dogmatic', score: 58, description: 'Rooted in old patterns and strict adherence', severity: 'moderate' as const }
    ],
    topPatterns: [
      { code: 'DEC', name: 'Deceiver', score: 85, description: 'Regularly deceives with hidden agendas', severity: 'critical' as const },
      { code: 'CPL', name: 'Collusive Capers', score: 82, description: 'Unhealthy people-pleasing and emotional pain', severity: 'critical' as const },
      { code: 'NEG', name: 'Unmet Needs', score: 78, description: 'Requirements that have not driven healthy emotional growth', severity: 'high' as const },
      { code: 'DIS', name: 'Dissociation', score: 72, description: 'Unaddressed psychological or neurological conditions', severity: 'high' as const },
      { code: 'INFLUENCE', name: 'Inside Out', score: 71, description: 'Behavior patterns shaped by outside forces', severity: 'high' as const }
    ],
    lowestPatterns: [
      { code: 'BULLY', name: 'Victim', score: 35, description: 'External or internal victim mentality patterns', severity: 'low' as const },
      { code: 'HOS', name: 'Heartless', score: 38, description: 'Disconnected from compassion and spiritual awareness', severity: 'low' as const },
      { code: 'LACK', name: 'Lack', score: 42, description: 'Limited access to financial means or material support', severity: 'low' as const },
      { code: 'ANG', name: 'Emotional Anger', score: 45, description: 'Persistent state of anger anchored in past experiences', severity: 'low' as const },
      { code: 'NAR', name: 'Narcissist', score: 48, description: 'Amplified belief in own importance', severity: 'low' as const }
    ],
    strengths: ['Emotional Anger', 'Lack', 'Heartless', 'Victim', 'Narcissist'],
    areasForGrowth: ['Deceiver', 'Collusive Capers', 'Unmet Needs', 'Dissociation', 'Inside Out'],
    recommendations: [
      'Address deceptive patterns and develop authentic communication skills',
      'Work on building healthy boundaries instead of people-pleasing behaviors',
      'Focus on meeting unmet emotional needs through healthy relationships',
      'Seek professional support for unaddressed psychological conditions',
      'Develop internal locus of control and personal accountability'
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3DB3E3] to-[#1FAFA3] rounded-full mb-4">
              <Brain className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Sample NIP™ Analysis</h2>
            <p className="text-gray-600">Comprehensive cognitive and emotional profile demonstration</p>
          </div>

          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'overview'
                  ? 'text-[#3DB3E3] border-b-2 border-[#3DB3E3]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award size={20} />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'detailed'
                  ? 'text-[#3DB3E3] border-b-2 border-[#3DB3E3]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={20} />
                Detailed Analysis
              </div>
            </button>
          </div>

          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#3DB3E3] to-[#1FAFA3] rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Award size={24} />
                    <h3 className="text-lg font-semibold">Overall Profile</h3>
                  </div>
                  <p className="text-5xl font-bold">{sampleAnalysis.overallScore}%</p>
                  <p className="text-sm mt-2 opacity-90">
                    {sampleAnalysis.overallScore >= 70 ? 'High Intensity' : sampleAnalysis.overallScore >= 50 ? 'Moderate Intensity' : 'Balanced'}
                  </p>
                </div>

                <div className="bg-[#E6E9EF] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-[#0A2A5E]" size={24} />
                    <h3 className="text-lg font-semibold text-[#0A2A5E]">Key Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {sampleAnalysis.strengths.slice(0, 3).map((strength, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="text-[#1FAFA3] flex-shrink-0" size={16} />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FFF5E6] border border-[#FFB84D] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="text-[#FFB84D]" size={24} />
                    <h3 className="text-lg font-semibold text-[#0A2A5E]">Focus Areas</h3>
                  </div>
                  <ul className="space-y-2">
                    {sampleAnalysis.areasForGrowth.slice(0, 3).map((area, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-[#FFB84D]">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="text-[#3DB3E3]" size={24} />
                  <h3 className="text-xl font-semibold text-[#0A2A5E]">Top 5 Active NIP™</h3>
                </div>
                <div className="space-y-4">
                  {sampleAnalysis.topPatterns.map((hw, idx) => (
                    <div key={hw.code} className="border-l-4 border-[#3DB3E3] pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-[#3DB3E3]">#{idx + 1}</span>
                            <div>
                              <h4 className="text-lg font-bold text-[#0A2A5E]">
                                {hw.code} - {hw.name}
                              </h4>
                              <p className="text-sm text-gray-600">{hw.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getSeverityColor(hw.severity)}`}>
                            {getSeverityLabel(hw.severity)}
                          </span>
                          <span className="text-2xl font-bold text-[#0A2A5E]">{hw.score}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getSeverityColor(hw.severity)}`}
                          style={{ width: `${hw.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-600" size={24} />
                  <h3 className="text-xl font-semibold text-[#0A2A5E]">Your Strongest Areas</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {sampleAnalysis.lowestPatterns.slice(0, 4).map((hw) => (
                    <div key={hw.code} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-[#0A2A5E]">{hw.code} - {hw.name}</h4>
                        <span className="text-green-600 font-bold">{hw.score}%</span>
                      </div>
                      <p className="text-sm text-gray-600">{hw.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FFF5E6] border border-[#FFB84D] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#0A2A5E] mb-4">Personalized Recommendations</h3>
                <ul className="space-y-3">
                  {sampleAnalysis.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-3 bg-white rounded-lg p-4">
                      <span className="text-[#FFB84D] font-bold text-lg">{idx + 1}.</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <NeuralImprintPatternsHistogram scores={sampleAnalysis.neuralImprintPatternScores} />

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="text-[#3DB3E3]" size={28} />
                  <h3 className="text-2xl font-bold text-[#0A2A5E]">Individual NIP™ Details</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Detailed breakdown of each cognitive and emotional driver with descriptions and severity levels.
                </p>

                <div className="space-y-4">
                  {sampleAnalysis.neuralImprintPatternScores.map((hw) => (
                    <div key={hw.code} className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#0A2A5E] text-white rounded-lg font-bold text-sm">
                              {hw.code}
                            </span>
                            <h4 className="text-lg font-bold text-[#0A2A5E]">{hw.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getSeverityColor(hw.severity)}`}>
                              {getSeverityLabel(hw.severity)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 ml-1">{hw.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-3xl font-bold text-[#0A2A5E]">{hw.score}</span>
                          <span className="text-lg text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all ${getSeverityColor(hw.severity)}`}
                          style={{ width: `${hw.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
