import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PATTERN_INFO, calculateNIPPScores1118, getSeverityLabel1118, scoreToPercentage, PatternId } from '../data/adhd1118AssessmentQuestions';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ADHD1118ReportProps {
  assessmentId: string;
  teenName: string;
  teenAge: number;
  parentEmail: string;
  onClose: () => void;
}

export default function ADHD1118Report({
  assessmentId,
  teenName,
  teenAge,
  parentEmail,
  onClose
}: ADHD1118ReportProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teenResponse, setTeenResponse] = useState<any>(null);

  useEffect(() => {
    loadResponses();
  }, [assessmentId]);

  const loadResponses = async () => {
    try {
      const { data: responses, error: responseError } = await supabase
        .from('adhd_1118_assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('respondent_type', 'teen')
        .maybeSingle();

      if (responseError) throw responseError;

      console.log('Loaded ADHD1118 response:', responses);
      if (responses && !responses.completed) {
        console.warn('Response exists but completed is false/missing:', responses.completed);
      }

      setTeenResponse(responses);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading ADHD1118 response:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="animate-spin mx-auto text-[#0A2A5E] mb-4" size={32} />
          <p className="text-[#0A2A5E] font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <AlertCircle className="text-red-500 mb-4" size={32} />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!teenResponse || !teenResponse.completed) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="relative min-h-screen">
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-[110] bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-300 hover:border-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="bg-white p-12 max-w-2xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Assessment Report</h2>
            {!teenResponse ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-amber-800 font-medium mb-2">No assessment responses found</p>
                <p className="text-amber-700 text-sm">
                  There are no responses recorded for this assessment yet. Please ensure the teen has completed the assessment form.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-800 font-medium mb-2">Assessment In Progress</p>
                <p className="text-blue-700 text-sm">
                  The assessment is currently being completed. Once all questions are answered, the detailed report will be displayed here.
                </p>
                {teenResponse.responses && (
                  <p className="text-blue-600 text-xs mt-3">
                    Progress: {Object.keys(teenResponse.responses).length} questions answered
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const nippScores = teenResponse.scores?.nippScores || calculateNIPPScores1118(teenResponse.responses || {});
  const patterns = Object.keys(nippScores) as PatternId[];

  const coreADHDPatterns = patterns.filter(p => PATTERN_INFO[p]?.category === 'Core ADHD');
  const emotionalPatterns = patterns.filter(p => PATTERN_INFO[p]?.category === 'Impact / Emotional');

  const PatternCard = ({ patternId, score }: { patternId: PatternId; score: number }) => {
    const pattern = PATTERN_INFO[patternId];
    const percentage = scoreToPercentage(score);
    const severity = getSeverityLabel1118(score);

    let severityColor = 'text-green-600';
    let barColor = 'bg-green-500';
    if (percentage > 66) {
      severityColor = 'text-red-600';
      barColor = 'bg-red-500';
    } else if (percentage > 33) {
      severityColor = 'text-amber-600';
      barColor = 'bg-amber-500';
    }

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-[#0A2A5E]">{pattern.name}</h3>
            <p className="text-sm text-gray-600">{pattern.shortDescription}</p>
          </div>
          <span className={`text-sm font-bold ${severityColor}`}>{severity}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Score: {score}</span>
          <span>{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative min-h-screen">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[110] bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-300 hover:border-gray-500"
          title="Close report"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-white p-12">
          <h1 className="text-4xl font-bold text-[#0A2A5E] mb-2">ADHD 11-18 Assessment Results</h1>
          <p className="text-gray-600 text-lg mb-8">For {teenName}, Age {teenAge}</p>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Core ADHD Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreADHDPatterns.map(pattern => (
                <PatternCard key={pattern} patternId={pattern} score={nippScores[pattern]} />
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Impact & Emotional Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emotionalPatterns.map(pattern => (
                <PatternCard key={pattern} patternId={pattern} score={nippScores[pattern]} />
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-[#0A2A5E] mb-2">Respondent Information</h3>
            <p className="text-gray-700"><strong>Teen Name:</strong> {teenResponse.respondent_name}</p>
            <p className="text-gray-700"><strong>Parent Email:</strong> {parentEmail}</p>
            <p className="text-gray-700"><strong>Completed:</strong> {new Date(teenResponse.completed_at).toLocaleDateString()}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-semibold text-[#0A2A5E] mb-2">Next Steps</h3>
            <p className="text-gray-700">This assessment has been automatically sent to the parent at {parentEmail}. Review the scores and patterns to understand areas of strength and areas needing support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
