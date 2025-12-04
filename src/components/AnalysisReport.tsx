import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Award, Loader, Mail, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NeuralImprintPatternsHistogram } from './NeuralImprintPatternsHistogram';

interface AnalysisReportProps {
  responseId: string;
  customerEmail: string;
  onClose: () => void;
  onStartRound2?: () => void;
  isRound2?: boolean;
}

interface NeuralImprintPatternScore {
  name: string;
  code: string;
  score: number;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

interface AnalysisResults {
  overallScore: number;
  neuralImprintPatternScores: NeuralImprintPatternScore[];
  strengths: string[];
  areasForGrowth: string[];
  recommendations: string[];
  topPatterns: NeuralImprintPatternScore[];
  lowestPatterns: NeuralImprintPatternScore[];
}

const NEURAL_IMPRINT_PATTERN_DEFINITIONS = [
  { code: 'DIS', name: 'Dissociation', description: 'Refers to unaddressed psychological or neurological conditions - such as concussion, anxiety, chronic stress, obsessive compulsive disorders, or other stress-related disturbances - that significantly impact daily functioning and lives not yet received appropriate care or intervention' },
  { code: 'ANG', name: 'Emotional Anger', description: 'A persistent state of anger anchored in past experiences, marked by an inability to let go of resentment or grudges. It tends to feel "forgotten" until consciously noticed, demonstrated, or "talent, dormant but capable of re-merging when triggered' },
  { code: 'SHT', name: 'Emotional Storm', description: 'An individual who has endured emotional damage caused by individualistic - whether physical, verbal, or sexual - which erodes inner peace, self-worth, and emotional dignity. Such experiences may stem from childhood, early settings, intimate relationships, workplaces, or broader social circles' },
  { code: 'LACK', name: 'Lack', description: 'A situation marked by their access to financial means or material support. The individual (or organization) experiences persistent gaps in resources, impacting essential needs, and restricted capacity to operate or sustain daily functions effectively' },
  { code: 'NEG', name: 'Unmet Needs', description: 'Refers to requirements that have not driven healthy emotional and cognitive growth. These parents may rely on punishment rather than guidance, neglect emotional connection, or take awareness of how it has turned out emotionally. The outcome is resulting in limited support and stimulation across key developmental areas' },
  { code: 'BURN', name: 'Burned Out', description: 'When a professional or person depletes their years - mentally, emotionally, or physically - usually because of chronic weariness, stress overload, or persistent health issues that result in a marked-out lack of life that drains energy and motivation' },
  { code: 'DEC', name: 'Deceiver', description: 'An individual who regularly deceives, motives with an appearance of goodness or innocence. Such people skillfully project sincerity but operate with hidden agendas, seeking to benefit at the expense of those who trust them' },
  { code: 'INFLUENCE', name: 'Inside Out', description: 'Refers to behavior patterns emerging the source of influence over their life: decisions and outcomes is largely shaped outside force. Locus of Control: The conviction that life\'s direction is largely shaped by outside forces such as fate, luck, or other people - rather than one\'s actions, discipline, and mindset are the main drivers of outcomes' },
  { code: 'TRAP', name: 'Martyr Mode', description: 'Stance that ignores the need for conscious chosen growth: allowing people to simply "exist" instead of evolve. These settings rarely, social, or professional - are not built for expansion. Individuals often feel confined, leaving individuals without meaningful encouragement or direction' },
  { code: 'HOS', name: 'Heartless', description: 'Describes an individual disconnected from compassion, existence, and spiritual awareness. Such a person is self-centered, lacking empathy, honest intellect, refusal, or callousness in relating to others. Often destructive or hurtful without guilt or emotional concern. This internal Poor align with traits associated with psychopathy' },
  { code: 'BULLY', name: 'Victim', description: 'EVIC - External Victim: A recurring thought pattern in which someone perceives themselves as powerless against outside forces. IVIC - Internal Victim: An inward sense that one is self-blame - consumed by guilt or remorse, never enough' },
  { code: 'LEFT/RIGHT', name: 'Brain', description: 'Zi (Zoom In): A thinking pattern that concentrates on specifics - analyzing details, structures, and step-by-step systems. Zo (Zoom Out): A broader connecting risk mindset that prioritizes themes, overarching perspective, connecting patterns and concepts' },
  { code: 'CPL', name: 'Collusive Capers', description: 'A regulated thought posture that often develops from childhood experiences with damaging results. These behaviors usually involve unhealthy levels of people-pleasing, emotional pain, or emptiness of routines' },
  { code: 'RES', name: 'Pushback', description: 'A consistent pattern of resistance or relativity openly toward change, new responsibilities, or life situations - regardless how one engages with the world around them' },
  { code: 'NAR', name: 'Narcissist', description: 'An amplified belief in one\'s own importance that results in prioritizing self-interest over others, frequently disregarding the feel choices or dignity around them' },
  { code: 'DOG', name: 'Dogmatic', description: 'A way of thinking rooted in old patterns and strict adherence to a single viewpoint. These interprets or responses to everyday issues like relationships, lifestyles, or values outlook is shaped by deeply ingrained conviction - resistant to new perspective' }
];

export function AnalysisReport({ responseId, customerEmail, onClose, onStartRound2, isRound2 = false }: AnalysisReportProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    analyzeResponses();
  }, []);

  const analyzeResponses = async () => {
    const { data: response } = await supabase
      .from('responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (response) {
      const answers = response.answers as Record<string, string>;

      const neuralImprintPatternScores: NeuralImprintPatternScore[] = NEURAL_IMPRINT_PATTERN_DEFINITIONS.map((hw, index) => {
        const relevantAnswers = Object.entries(answers)
          .filter(([qId]) => parseInt(qId) % 16 === index)
          .map(([_, answer]) => getScoreFromAnswer(answer));

        const avgScore = relevantAnswers.length > 0
          ? relevantAnswers.reduce((a, b) => a + b, 0) / relevantAnswers.length
          : 3;

        const normalizedScore = Math.round((avgScore / 5) * 100);

        let severity: 'low' | 'moderate' | 'high' | 'critical';
        if (normalizedScore >= 80) severity = 'critical';
        else if (normalizedScore >= 65) severity = 'high';
        else if (normalizedScore >= 50) severity = 'moderate';
        else severity = 'low';

        return {
          name: hw.name,
          code: hw.code,
          score: normalizedScore,
          description: hw.description,
          severity
        };
      });

      const sortedByScore = [...neuralImprintPatternScores].sort((a, b) => b.score - a.score);
      const topPatterns = sortedByScore.slice(0, 5);
      const lowestPatterns = sortedByScore.slice(-5).reverse();

      const overallScore = Math.round(
        neuralImprintPatternScores.reduce((sum, hw) => sum + hw.score, 0) / neuralImprintPatternScores.length
      );

      const strengths = neuralImprintPatternScores
        .filter(hw => hw.score < 50)
        .map(hw => hw.name)
        .slice(0, 5);

      const areasForGrowth = neuralImprintPatternScores
        .filter(hw => hw.score >= 65)
        .map(hw => hw.name)
        .slice(0, 5);

      const recommendations = generateRecommendations(topPatterns);

      const analysisResults: AnalysisResults = {
        overallScore,
        neuralImprintPatternScores,
        strengths,
        areasForGrowth,
        recommendations,
        topPatterns,
        lowestPatterns
      };

      await supabase
        .from('responses')
        .update({
          analysis_results: analysisResults,
          status: 'analyzed'
        })
        .eq('id', responseId);

      setAnalysis(analysisResults);
      setIsAnalyzing(false);

      await sendEmailNotifications(response.customer_name, customerEmail, analysisResults);
    }
  };

  const getScoreFromAnswer = (answer: string): number => {
    const scoreMap: Record<string, number> = {
      'Strongly Disagree': 1,
      'Disagree': 2,
      'Neutral': 3,
      'Agree': 4,
      'Strongly Agree': 5
    };
    return scoreMap[answer] || 3;
  };

  const generateRecommendations = (topPatterns: NeuralImprintPatternScore[]): string[] => {
    const recommendations: string[] = [];

    topPatterns.forEach(hw => {
      if (hw.code === 'DIS') {
        recommendations.push('Seek professional support for unaddressed psychological or neurological conditions');
      } else if (hw.code === 'ANG') {
        recommendations.push('Explore anger management techniques and work on letting go of past resentments');
      } else if (hw.code === 'SHT') {
        recommendations.push('Consider trauma-informed therapy to heal from emotional damage and rebuild self-worth');
      } else if (hw.code === 'LACK') {
        recommendations.push('Develop financial literacy and seek resources to build material stability');
      } else if (hw.code === 'NEG') {
        recommendations.push('Work on meeting unmet emotional needs through healthy relationships and self-care');
      } else if (hw.code === 'BURN') {
        recommendations.push('Prioritize rest, set boundaries, and address chronic stress through lifestyle changes');
      } else if (hw.code === 'DEC') {
        recommendations.push('Address deceptive patterns and develop authentic communication and integrity');
      } else if (hw.code === 'INFLUENCE') {
        recommendations.push('Develop internal locus of control and take ownership of your choices and outcomes');
      } else if (hw.code === 'TRAP') {
        recommendations.push('Create environments that support growth and conscious evolution');
      } else if (hw.code === 'HOS') {
        recommendations.push('Cultivate compassion, empathy, and spiritual awareness through mindfulness practices');
      } else if (hw.code === 'BULLY') {
        recommendations.push('Transform victim mentality into personal empowerment and accountability');
      } else if (hw.code === 'LEFT/RIGHT') {
        recommendations.push('Balance detailed thinking with big-picture perspective for optimal decision-making');
      } else if (hw.code === 'CPL') {
        recommendations.push('Build healthy boundaries instead of people-pleasing and address emotional pain');
      } else if (hw.code === 'RES') {
        recommendations.push('Embrace change and develop flexibility in adapting to new situations');
      } else if (hw.code === 'NAR') {
        recommendations.push('Develop empathy and consider others\' perspectives and dignity');
      } else if (hw.code === 'DOG') {
        recommendations.push('Practice open-mindedness and challenge rigid beliefs with curiosity');
      } else {
        recommendations.push(`Focus on healing and growth in the area of ${hw.name} through targeted support`);
      }
    });

    return recommendations.slice(0, 5);
  };

  const sendEmailNotifications = async (name: string, email: string, results: AnalysisResults) => {
    setIsSendingEmail(true);

    try {
      const { data: response } = await supabase
        .from('responses')
        .select('franchise_owner_id')
        .eq('id', responseId)
        .maybeSingle();

      let franchiseOwnerEmail = null;
      let franchiseOwnerName = null;

      if (response?.franchise_owner_id) {
        const { data: franchiseOwner } = await supabase
          .from('franchise_owners')
          .select('email, name')
          .eq('id', response.franchise_owner_id)
          .maybeSingle();

        if (franchiseOwner) {
          franchiseOwnerEmail = franchiseOwner.email;
          franchiseOwnerName = franchiseOwner.name;
        }
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-analysis-email`;

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          franchiseOwnerEmail,
          franchiseOwnerName,
          responseId,
          analysis: results
        })
      });

      await supabase
        .from('responses')
        .update({ status: 'sent' })
        .eq('id', responseId);

      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSendingEmail(false);
    }
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

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-12 text-center">
          <Loader className="animate-spin text-[#3DB3E3] mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-bold text-[#0A2A5E] mb-2">Analyzing Your Results</h3>
          <p className="text-gray-600">
            Processing your 50 responses and mapping your unique NIP™ profile...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-400"
          title="Close and return to main page"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <div className="mb-6">
            <img
              src="/brainworx png for website copy.png"
              alt="BrainWorx Logo"
              className="h-24 mx-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Your NIP™ Analysis</h2>
          <p className="text-gray-600">Comprehensive cognitive and emotional profile</p>
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
                <p className="text-5xl font-bold">{analysis.overallScore}%</p>
                <p className="text-sm mt-2 opacity-90">
                  {analysis.overallScore >= 70 ? 'High Intensity' : analysis.overallScore >= 50 ? 'Moderate Intensity' : 'Balanced'}
                </p>
              </div>

              <div className="bg-[#E6E9EF] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-[#0A2A5E]" size={24} />
                  <h3 className="text-lg font-semibold text-[#0A2A5E]">Key Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.slice(0, 3).map((strength, idx) => (
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
                  {analysis.areasForGrowth.slice(0, 3).map((area, idx) => (
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
                {analysis.topPatterns.map((hw, idx) => (
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
                {analysis.lowestPatterns.slice(0, 4).map((hw) => (
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
                {analysis.recommendations.map((recommendation, idx) => (
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
            <NeuralImprintPatternsHistogram scores={analysis.neuralImprintPatternScores} />

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-[#3DB3E3]" size={28} />
                <h3 className="text-2xl font-bold text-[#0A2A5E]">Individual NIP™ Details</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Detailed breakdown of each cognitive and emotional driver with descriptions and severity levels.
              </p>

              <div className="space-y-4">
                {analysis.neuralImprintPatternScores.map((hw) => (
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

        <div className="mt-8 pt-6 border-t border-gray-200">
          {emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
              <p className="text-green-800 font-medium">
                Complete analysis sent to {customerEmail}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Check your inbox for the detailed NIP™ report
              </p>
            </div>
          ) : isSendingEmail ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Loader className="animate-spin text-[#3DB3E3] mx-auto mb-2" size={32} />
              <p className="text-[#0A2A5E] font-medium">Sending detailed report via email...</p>
            </div>
          ) : (
            <div className="text-center">
              <Mail className="text-[#3DB3E3] mx-auto mb-2" size={32} />
              <p className="text-gray-600 text-sm">
                Your complete NIP™ analysis is being sent to {customerEmail}
              </p>
            </div>
          )}

          {!isRound2 && onStartRound2 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] rounded-xl p-6 text-white text-center">
                <h4 className="text-xl font-bold mb-2">Continue Your Assessment</h4>
                <p className="text-white/90 mb-4">
                  Complete the next 50 questions for a more comprehensive analysis and deeper insights into your NIP™ profile.
                </p>
                <button
                  onClick={onStartRound2}
                  className="bg-white text-[#0A2A5E] px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold"
                >
                  Start Round 2 (Questions 51-100)
                </button>
              </div>
            </div>
          )}

          {isRound2 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
                <h4 className="text-xl font-bold text-[#0A2A5E] mb-2">Round 2 Complete!</h4>
                <p className="text-gray-600">
                  You've completed 100 questions total. This analysis reflects your responses to questions 51-100.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
