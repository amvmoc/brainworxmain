import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PatternScore {
  code: string;
  name: string;
  short: string;
  zone: 'Green' | 'Amber' | 'Red';
  pct: number;
  avg: number;
}

interface TraumaCoachReportProps {
  assessmentId: string;
  customerName: string;
  customerEmail: string;
  onClose: () => void;
}

const ZONE_COLORS: Record<string, string> = {
  Green: '#10b981',
  Amber: '#f59e0b',
  Red: '#ef4444'
};

const PATTERN_DEFINITIONS: Record<string, { name: string; short: string }> = {
  TRAP: { name: 'Stuck Mode', short: 'Survival mode; low direction.' },
  SHT: { name: 'Shame Load', short: 'Self-blame; worth hit.' },
  ORG: { name: 'Order Pressure', short: 'Planning/admin overwhelm.' },
  NEGP: { name: 'Support Gap', short: 'Avoid help-seeking; feeling unsupported.' },
  HYP: { name: 'High Alert', short: 'Jumpy; restless; always on.' },
  DOG: { name: 'Rigid Thinking', short: 'Locked beliefs; low adaptability.' },
  IMP: { name: 'Impulse Relief', short: 'Fast reactions to reduce stress.' },
  NUH: { name: 'Numb/Freeze', short: 'Shutdown; emotional distance.' },
  DIS: { name: 'High Distress', short: 'Panic; hopelessness; intrusive thoughts.' },
  ANG: { name: 'Anger Charge', short: 'Snapping; resentment loops.' },
  INFL: { name: 'Helpless Story', short: 'Low agency interpretations.' },
  BULLY: { name: 'Victim Loop', short: 'Replay/blame; stuckness.' },
  LACK: { name: 'Scarcity Stress', short: 'Resource insecurity pressure.' },
  DIM: { name: 'Detail Trap', short: 'Stuck in details; low priority clarity.' },
  FOC: { name: 'Scattered Focus', short: 'Attention jumps; finishing is hard.' },
  RES: { name: 'Resistance Mode', short: 'Irritable; pessimistic; pushing support away.' },
  INWF: { name: 'Inward Pull', short: 'Withdrawal; narrowed capacity.' },
  CPL: { name: 'Coping Loop', short: 'Hard-to-stop coping habits.' },
  BURN: { name: 'Burnout', short: 'Depleted energy; shutdown.' },
  DEC: { name: 'Masking', short: 'Guarded; hiding needs/feelings.' },
};

export default function TraumaCoachReport({
  assessmentId,
  customerName,
  customerEmail,
  onClose
}: TraumaCoachReportProps) {
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessmentData();
  }, []);

  const loadAssessmentData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('self_assessment_responses')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (fetchError || !data) {
        setError('Unable to load assessment data');
        return;
      }

      setAssessmentData(data);
    } catch (err) {
      setError('Error loading assessment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading assessment report...</p>
        </div>
      </div>
    );
  }

  if (error || !assessmentData?.analysis_results) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="relative min-h-screen flex items-center justify-center">
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-[110] bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-300 hover:border-gray-500"
          >
            <X size={24} />
          </button>
          <div className="bg-white p-12 rounded-lg max-w-2xl">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Assessment Report</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-amber-800 font-medium">
                {error || 'No analysis results available yet. Please wait for the assessment to be processed.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const analysis = assessmentData.analysis_results;
  const participantInfo = assessmentData.answers?.participantInfo || {};
  const overall = analysis.overall || {};
  const top5 = analysis.top5 || [];
  const allPatterns = analysis.patternScores || [];
  const safetyFlag = analysis.safetyFlag || false;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative min-h-screen">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[110] bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-300 hover:border-gray-500"
        >
          <X size={24} />
        </button>

        <div className="bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Trauma & Loss Impact Assessment</h1>
            <p className="opacity-90">Coach Report - Comprehensive Analysis</p>
          </div>

          <div className="max-w-6xl mx-auto p-8 space-y-8">
            {/* Participant Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Participant Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Name</p>
                  <p className="text-gray-900">{participantInfo.name || '—'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Age</p>
                  <p className="text-gray-900">{participantInfo.age || '—'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{participantInfo.email || customerEmail}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Time Anchor</p>
                  <p className="text-gray-900">{participantInfo.context || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium text-gray-600">Event</p>
                  <p className="text-gray-900">
                    {participantInfo.incidentLabel || 'the incident'}{' '}
                    {participantInfo.incidentDate && `(${participantInfo.incidentDate})`}
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Flag */}
            {safetyFlag && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 flex gap-4">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-red-900 mb-2">SAFETY FLAG - Immediate Attention Required</h3>
                  <p className="text-red-800 text-sm">
                    This participant reported high distress levels. Immediate follow-up recommended. If active self-harm intent or severe dissociation is present, pause coaching and refer to qualified clinical care.
                  </p>
                </div>
              </div>
            )}

            {/* Overall Impact Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Overall Impact Summary</h2>
              <div className="grid grid-cols-3 gap-8 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Zone</p>
                  <p
                    className="text-4xl font-bold"
                    style={{ color: ZONE_COLORS[overall.zone] || '#666' }}
                  >
                    {overall.zone || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Score</p>
                  <p
                    className="text-4xl font-bold"
                    style={{ color: ZONE_COLORS[overall.zone] || '#666' }}
                  >
                    {overall.pct}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Average</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {overall.avg?.toFixed(2) || '0.00'} / 4
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3]"
                  style={{ width: `${overall.pct}%` }}
                />
              </div>
            </div>

            {/* Top 5 Patterns */}
            {top5.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Top 5 Activated Patterns</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="text-left p-3 font-semibold text-gray-700">Code</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Pattern</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Zone</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Score</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5.map((pattern: PatternScore, idx: number) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-semibold text-gray-900">{pattern.code}</td>
                          <td className="p-3">
                            <div className="font-semibold text-gray-900">{pattern.name}</div>
                            <div className="text-xs text-gray-600">{pattern.short}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className="font-bold text-sm"
                              style={{ color: ZONE_COLORS[pattern.zone] }}
                            >
                              {pattern.zone}
                            </span>
                          </td>
                          <td className="p-3 text-center font-semibold text-gray-900">
                            {pattern.pct}%
                          </td>
                          <td className="p-3 text-center text-gray-900">
                            {pattern.avg?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Coaching Focus */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-[#1e40af] mb-3">Coaching Focus Recommendations</h3>
              <p className="text-[#1e3a8a] text-sm mb-3">Based on the top patterns:</p>
              <ul className="text-[#1e3a8a] text-sm space-y-2 list-disc list-inside">
                <li>Start with stabilization: basics (sleep, hydration, meals) + nervous system downshift</li>
                <li>Build support plan: identify safe people, create micro-connection routine</li>
                <li>Address high-activation patterns (DIS, HYP, ANG) with regulation techniques</li>
                <li>Restore structure if ORG/FOC/DIM are high: 3-item lists + timer blocks</li>
                <li>Focus on small, controllable steps to rebuild agency (TRAP, INFL, BULLY)</li>
              </ul>
            </div>

            {/* All 20 Patterns */}
            {allPatterns.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">All 20 Pattern Scores</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="text-left p-2 font-semibold text-gray-700">Code</th>
                        <th className="text-left p-2 font-semibold text-gray-700">Pattern</th>
                        <th className="text-center p-2 font-semibold text-gray-700">Zone</th>
                        <th className="text-center p-2 font-semibold text-gray-700">Score</th>
                        <th className="text-center p-2 font-semibold text-gray-700">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPatterns.map((pattern: PatternScore, idx: number) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-2 font-semibold text-gray-900">{pattern.code}</td>
                          <td className="p-2 text-gray-900">{pattern.name}</td>
                          <td className="p-2 text-center">
                            <span
                              className="font-bold text-xs"
                              style={{ color: ZONE_COLORS[pattern.zone] }}
                            >
                              {pattern.zone}
                            </span>
                          </td>
                          <td className="p-2 text-center font-semibold text-gray-900">
                            {pattern.pct}%
                          </td>
                          <td className="p-2 text-center text-gray-900">
                            {pattern.avg?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Risk-Aware Boundaries */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-[#92400e] mb-3">Risk-Aware Coaching Boundaries</h3>
              <ul className="text-[#78350f] text-sm space-y-2 list-disc list-inside">
                <li>Coaching focuses on stability, routine, agency, and support planning—not trauma therapy</li>
                <li>If client reports active self-harm intent, inability to stay safe, or severe dissociation: pause coaching and refer</li>
                <li>Document boundaries clearly and keep qualified referral options available</li>
                <li>This is a non-diagnostic tool for coaching support, not clinical assessment</li>
              </ul>
            </div>

            {/* Suggested Coaching Plan */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Suggested 6-Session Coaching Plan</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-center p-3 font-semibold text-gray-700 w-20">Session</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Goal</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['1', 'Stabilize', 'Basics + downshift + support plan'],
                      ['2', 'Structure', '3-item priorities + timer blocks'],
                      ['3', 'Agency', 'Choices + small controllable steps'],
                      ['4', 'Connection', 'Support map + boundaries'],
                      ['5', 'Rebuild', 'Practical rebuild plan'],
                      ['6', 'Maintain', 'Relapse plan + weekly rhythm'],
                    ].map(([session, goal, focus], idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-center font-semibold text-gray-900">{session}</td>
                        <td className="p-3 text-gray-900">{goal}</td>
                        <td className="p-3 text-gray-900">{focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
