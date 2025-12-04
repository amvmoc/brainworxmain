import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Award, Loader, CheckCircle, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SelfAssessmentType } from '../data/selfAssessmentQuestions';
import { calculateSelfAssessmentScores, SelfAssessmentAnalysis } from '../utils/selfAssessmentScoring';

interface SelfAssessmentReportProps {
  responseId: string;
  assessmentType: SelfAssessmentType;
  customerEmail: string;
  onClose: () => void;
}

export function SelfAssessmentReport({
  responseId,
  assessmentType,
  customerEmail,
  onClose
}: SelfAssessmentReportProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<SelfAssessmentAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    analyzeResponses();
  }, []);

  const analyzeResponses = async () => {
    const { data: response } = await supabase
      .from('self_assessment_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (response) {
      const answers = response.answers as Record<string, number>;
      const numericAnswers: Record<number, number> = {};
      Object.entries(answers).forEach(([key, value]) => {
        numericAnswers[parseInt(key)] = value;
      });

      const analysisResults = calculateSelfAssessmentScores(assessmentType, numericAnswers);

      await supabase
        .from('self_assessment_responses')
        .update({
          analysis_results: analysisResults,
          status: 'analyzed'
        })
        .eq('id', responseId);

      setAnalysis(analysisResults);
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
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
            Processing your {assessmentType.questions.length} responses and creating your personalized profile...
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3DB3E3] to-[#1FAFA3] rounded-full mb-4">
            <Brain className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">{assessmentType.name}</h2>
          <p className="text-gray-600">Your Neural Imprint Profile Analysis</p>
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
                  {analysis.overallScore >= 70 ? 'High Intensity' : analysis.overallScore >= 40 ? 'Moderate Intensity' : 'Balanced'}
                </p>
              </div>

              <div className="bg-[#E6E9EF] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-[#0A2A5E]" size={24} />
                  <h3 className="text-lg font-semibold text-[#0A2A5E]">Strongest Areas</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.lowestImprints.slice(0, 3).map((imprint, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="text-[#1FAFA3] flex-shrink-0" size={16} />
                      <span>{imprint.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FFF5E6] border border-[#FFB84D] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-[#FFB84D]" size={24} />
                  <h3 className="text-lg font-semibold text-[#0A2A5E]">Focus Areas</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.topImprints.slice(0, 3).map((imprint, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-[#FFB84D]">•</span>
                      <span>{imprint.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-[#3DB3E3]" size={24} />
                <h3 className="text-xl font-semibold text-[#0A2A5E]">Top 5 Neural Imprints</h3>
              </div>
              <div className="space-y-4">
                {analysis.topImprints.map((imprint, idx) => (
                  <div key={imprint.code} className="border-l-4 border-[#3DB3E3] pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-[#3DB3E3]">#{idx + 1}</span>
                        <div>
                          <h4 className="text-lg font-bold text-[#0A2A5E]">
                            {imprint.code} - {imprint.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {imprint.itemCount} questions • Score: {imprint.score} / {imprint.maxScore}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getSeverityColor(imprint.severity)}`}>
                          {getSeverityLabel(imprint.severity)}
                        </span>
                        <span className="text-2xl font-bold text-[#0A2A5E]">{imprint.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getSeverityColor(imprint.severity)}`}
                        style={{ width: `${imprint.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {analysis.domains && analysis.domains.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="text-blue-600" size={24} />
                  <h3 className="text-xl font-semibold text-[#0A2A5E]">Domain Analysis</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.domains.slice().sort((a, b) => b.percentage - a.percentage).map((domain) => (
                    <div key={domain.domain} className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-[#0A2A5E]">{domain.domain.replace(/_/g, ' ')}</h4>
                        <span className="text-blue-600 font-bold">{domain.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${domain.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {domain.itemCount} questions • {domain.score} / {domain.maxScore} points
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-[#3DB3E3]" size={28} />
                <h3 className="text-2xl font-bold text-[#0A2A5E]">All Neural Imprint Scores</h3>
              </div>

              <div className="space-y-4">
                {analysis.neuralImprints.map((imprint) => (
                  <div key={imprint.code} className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-[#0A2A5E] text-white rounded-lg font-bold text-sm">
                            {imprint.code}
                          </span>
                          <h4 className="text-lg font-bold text-[#0A2A5E]">{imprint.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getSeverityColor(imprint.severity)}`}>
                            {getSeverityLabel(imprint.severity)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 ml-1">
                          {imprint.itemCount} questions • Score: {imprint.score} / {imprint.maxScore}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-3xl font-bold text-[#0A2A5E]">{imprint.percentage}</span>
                        <span className="text-lg text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${getSeverityColor(imprint.severity)}`}
                        style={{ width: `${imprint.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
            <p className="text-green-800 font-medium">
              Assessment Complete
            </p>
            <p className="text-sm text-green-600 mt-1">
              Your results have been saved to {customerEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
