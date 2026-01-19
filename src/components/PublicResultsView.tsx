import { useState, useEffect } from 'react';
import { X, Download, Calendar, User, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateClientReportData, generateClientReportFromAnalysis } from '../utils/clientReportScoring';
import { downloadHTMLReport } from '../utils/htmlReportGenerator';
import ClientReport from './ClientReport';

interface PublicResultsViewProps {
  shareToken: string;
}

export function PublicResultsView({ shareToken }: PublicResultsViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  useEffect(() => {
    loadResultsData();
  }, [shareToken]);

  const loadResultsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('responses')
        .select('*')
        .eq('share_token', shareToken)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching results:', fetchError);
        setError('Failed to load results. Please try again.');
        return;
      }

      if (!data) {
        setError('Results not found. Please check your link and try again.');
        return;
      }

      if (!data.completed_at) {
        setError('This assessment is not yet completed.');
        return;
      }

      setResponseData(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3DB3E3] mx-auto mb-4"></div>
          <p className="text-[#0A2A5E] text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-block bg-red-100 rounded-full p-4 mb-4">
            <X size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0A2A5E] mb-3">Unable to Load Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-[#3DB3E3] text-white px-6 py-3 rounded-full hover:bg-[#1FAFA3] transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  if (!responseData) {
    return null;
  }

  // Use analysis_results if available (NIP3 with correct scoring), otherwise fallback to old method
  const reportData = responseData.analysis_results?.neuralImprintPatternScores
    ? generateClientReportFromAnalysis(
        responseData.customer_name,
        responseData.analysis_results,
        new Date(responseData.completed_at)
      )
    : generateClientReportData(
        responseData.customer_name,
        responseData.answers,
        new Date(responseData.completed_at),
        Object.keys(responseData.answers).length
      );

  const handleDownloadHTML = () => {
    const patterns = Object.entries(reportData.patterns);

    const overallScore = Math.round(
      patterns.reduce((sum, [_, data]) => sum + data.score, 0) / patterns.length
    );

    const topPatterns = patterns
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 5)
      .map(([name, data]) => ({
        pattern: name,
        score: data.score,
        description: data.description,
      }));

    const categoryScores = patterns.map(([name, data]) => ({
      category: name,
      score: data.score,
      severity:
        data.score >= 70 ? 'High' : data.score >= 40 ? 'Moderate' : 'Low',
      description: data.description,
    }));

    const interpretation = `Based on this comprehensive neural imprint assessment, the profile shows an overall intensity score of ${overallScore}%. ${
      overallScore >= 70
        ? 'This indicates significant patterns that may benefit from professional support and intervention.'
        : overallScore >= 40
        ? 'This reveals moderate patterns that could be addressed through coaching and personal development strategies.'
        : 'This suggests a relatively balanced profile with manageable patterns.'
    } The most prominent patterns identified include ${topPatterns
      .slice(0, 3)
      .map((p) => p.pattern)
      .join(', ')}. These patterns provide valuable insights for personal growth and development.`;

    downloadHTMLReport({
      customerName: reportData.client.name,
      completedAt: new Date(reportData.client.date),
      questionCount: reportData.client.totalQuestions,
      overallScore,
      categoryScores,
      topPatterns,
      interpretation,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] to-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/THE REAL PNG LOGO.png" alt="BrainWorx" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-[#0A2A5E]">Assessment Results</h1>
                <p className="text-sm text-gray-500">Confidential Report</p>
              </div>
            </div>
            <a
              href="/"
              className="text-[#3DB3E3] hover:text-[#1FAFA3] transition-colors font-medium"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">
                  {responseData.customer_name}'s Results
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>Completed: {new Date(responseData.completed_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>{Object.keys(responseData.answers).length} Questions</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadHTML}
                  className="inline-flex items-center bg-[#3DB3E3] text-white px-6 py-3 rounded-lg hover:bg-[#1FAFA3] transition-colors font-medium"
                >
                  <FileText size={20} className="mr-2" />
                  Download Report
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center border-2 border-[#3DB3E3] text-[#3DB3E3] px-6 py-3 rounded-lg hover:bg-[#3DB3E3] hover:text-white transition-colors font-medium"
                >
                  <Download size={20} className="mr-2" />
                  Print PDF
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gradient-to-r from-[#E6E9EF] to-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#0A2A5E] mb-3">About This Report</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This comprehensive assessment analyzes your Neural Imprint Patterns to provide insights into
                  your cognitive and behavioral tendencies. The results are designed to help you understand
                  your strengths and identify areas for personal growth.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> This assessment is for informational and coaching purposes only.
                  It is not a diagnostic tool and should not be used as a substitute for professional
                  medical or psychological advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ClientReport results={reportData} />

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-[#0A2A5E] mb-4">Want to Learn More?</h3>
            <p className="text-gray-700 mb-6">
              Discover how BrainWorx can help you transform your cognitive patterns and unlock your full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/?coupon=start"
                className="inline-flex items-center justify-center bg-[#3DB3E3] text-white px-8 py-3 rounded-full hover:bg-[#1FAFA3] transition-colors font-medium"
              >
                Take Your Assessment
              </a>
              <a
                href="/#contact"
                className="inline-flex items-center justify-center border-2 border-[#3DB3E3] text-[#3DB3E3] px-8 py-3 rounded-full hover:bg-[#3DB3E3] hover:text-white transition-colors font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#0A2A5E] text-white py-8 px-6 mt-16">
        <div className="container mx-auto text-center">
          <img src="/THE REAL PNG LOGO.png" alt="BrainWorx" className="h-10 mx-auto mb-4 opacity-80" />
          <p className="text-[#E6E9EF]">&copy; 2025 BrainWorx. All rights reserved.</p>
          <p className="text-sm text-[#E6E9EF]/60 mt-2">Transform Your Mind, Reach The World</p>
        </div>
      </footer>
    </div>
  );
}
