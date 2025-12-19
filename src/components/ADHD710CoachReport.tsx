import React from 'react';
import { NIPP_PATTERNS, scoreToPercentage, getSeverityLabel710, getSeverityColor710, getADHDInterpretation } from '../data/adhd710AssessmentQuestions';

interface PatternScore {
  code: string;
  name: string;
  category: string;
  parentScore: number;
  teacherScore: number;
  combinedScore: number;
  parentLabel: string;
  teacherLabel: string;
  combinedLabel: string;
  percentage: number;
}

interface ADHD710CoachReportProps {
  childInfo: {
    name: string;
    age: number;
  };
  parentInfo: {
    name: string;
  };
  teacherInfo: {
    name: string;
    email?: string;
  };
  coachInfo?: {
    name: string;
  };
  patterns: PatternScore[];
  date: string;
}

export default function ADHD710CoachReport({ childInfo, parentInfo, teacherInfo, coachInfo, patterns, date }: ADHD710CoachReportProps) {
  const corePatterns = patterns.filter(p => p.category === 'Core ADHD');
  const emotionalPatterns = patterns.filter(p => p.category === 'Emotional/Impact');

  // Calculate NIPP scores for interpretation
  const nippScores: Record<string, number> = {};
  patterns.forEach(p => {
    nippScores[p.code] = p.combinedScore;
  });
  const interpretation = getADHDInterpretation(nippScores);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2">
          <div>
            <div className="w-32 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mb-3">
              BrainWorx
            </div>
            <div className="text-sm text-gray-600">
              <strong>BrainWorx</strong> – Neural Imprint Patterns (NIPP)<br />
              Child Focus & Behaviour Screen (7–10 years)
            </div>
          </div>
          <div className="text-right text-sm text-gray-700">
            <div><strong>Child Name:</strong> {childInfo.name}</div>
            <div><strong>Age:</strong> {childInfo.age}</div>
            {coachInfo && <div><strong>Coach:</strong> {coachInfo.name}</div>}
            <div><strong>Parent:</strong> {parentInfo.name}</div>
            <div><strong>Teacher:</strong> {teacherInfo.name}</div>
            {teacherInfo.email && <div><strong>Teacher email:</strong> {teacherInfo.email}</div>}
            <div><strong>Date:</strong> {date}</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Professional / Coach Report
        </h1>
        <p className="text-gray-700 mb-8 leading-relaxed">
          This report summarises parent and teacher observations of ADHD-style patterns and related
          emotional/impact domains for a school-aged child (7–10). It is a screening and coaching tool
          and does not replace a full diagnostic assessment.
        </p>

        {/* Overall ADHD Pattern Indicator */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Overall ADHD pattern indicator
          </h2>

          <div className="space-y-3">
            <p className="text-gray-800">
              <strong>Core patterns with Moderate/High combined scores:</strong> {interpretation.moderateOrHighCount} out of 5
            </p>
            <p className="text-gray-800">
              <strong>Average combined core ADHD score:</strong> {interpretation.avgCoreScore} (1.00–4.00 scale)
            </p>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Interpretation summary:</p>
              <p className="text-gray-700 leading-relaxed">{interpretation.interpretation}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600 italic">
            Summary based solely on these rating scales. Integrate with history, direct observation,
            developmental expectations and any additional assessment data.
          </p>
        </div>

        {/* Core ADHD Domains */}
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          Core ADHD domains
        </h2>

        <div className="space-y-6 mb-10">
          {corePatterns.map((pattern) => {
            const discrepancy = Math.abs(pattern.parentScore - pattern.teacherScore);
            const hasLargeDiscrepancy = discrepancy >= 1.0;

            return (
              <div key={pattern.code} className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {pattern.code} – {pattern.name}
                </h3>

                {/* Scores Table */}
                <div className="mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="text-left p-2">Rater</th>
                        <th className="text-center p-2">Score</th>
                        <th className="text-left p-2">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2"><strong>Parent ({parentInfo.name})</strong></td>
                        <td className="text-center p-2">{pattern.parentScore.toFixed(2)}</td>
                        <td className="p-2">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getSeverityColor710(pattern.parentScore) + '20',
                              color: getSeverityColor710(pattern.parentScore)
                            }}
                          >
                            {pattern.parentLabel}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><strong>Teacher ({teacherInfo.name})</strong></td>
                        <td className="text-center p-2">{pattern.teacherScore.toFixed(2)}</td>
                        <td className="p-2">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getSeverityColor710(pattern.teacherScore) + '20',
                              color: getSeverityColor710(pattern.teacherScore)
                            }}
                          >
                            {pattern.teacherLabel}
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-blue-50 font-bold">
                        <td className="p-2"><strong>Combined Average</strong></td>
                        <td className="text-center p-2">{pattern.combinedScore.toFixed(2)}</td>
                        <td className="p-2">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getSeverityColor710(pattern.combinedScore) + '20',
                              color: getSeverityColor710(pattern.combinedScore)
                            }}
                          >
                            {pattern.combinedLabel}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${pattern.percentage}%`,
                      backgroundColor: getSeverityColor710(pattern.combinedScore)
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  {pattern.percentage}% of maximum intensity
                </p>

                {/* Cross-Setting Analysis */}
                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Cross-setting analysis:</p>
                  {hasLargeDiscrepancy ? (
                    <p className="text-sm text-amber-700">
                      <strong>⚠ Significant discrepancy detected</strong> (difference of {discrepancy.toFixed(2)}).
                      This pattern shows differently at home vs. school. Consider environmental factors,
                      relationship dynamics, or setting-specific stressors that may be contributing.
                    </p>
                  ) : (
                    <p className="text-sm text-green-700">
                      <strong>✓ Consistent across settings</strong> (difference of {discrepancy.toFixed(2)}).
                      Both raters observe similar patterns, suggesting pervasive ADHD-style traits.
                    </p>
                  )}
                </div>

                {/* Clinical Notes */}
                <div className="bg-amber-50 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">Clinical considerations:</p>
                  <p className="italic">
                    Examine cross-setting consistency. Pervasive elevation (home + school) supports an
                    ADHD-style profile; context-specific elevation can highlight environmental/relational
                    contributors.
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
            const discrepancy = Math.abs(pattern.parentScore - pattern.teacherScore);
            const hasLargeDiscrepancy = discrepancy >= 1.0;

            return (
              <div key={pattern.code} className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {pattern.code} – {pattern.name}
                </h3>

                {/* Scores Table */}
                <div className="mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="text-left p-2">Rater</th>
                        <th className="text-center p-2">Score</th>
                        <th className="text-left p-2">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2"><strong>Parent ({parentInfo.name})</strong></td>
                        <td className="text-center p-2">{pattern.parentScore.toFixed(2)}</td>
                        <td className="p-2">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getSeverityColor710(pattern.parentScore) + '20',
                              color: getSeverityColor710(pattern.parentScore)
                            }}
                          >
                            {pattern.parentLabel}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><strong>Teacher ({teacherInfo.name})</strong></td>
                        <td className="text-center p-2">{pattern.teacherScore.toFixed(2)}</td>
                        <td className="p-2">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getSeverityColor710(pattern.teacherScore) + '20',
                              color: getSeverityColor710(pattern.teacherScore)
                            }}
                          >
                            {pattern.teacherLabel}
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-blue-50 font-bold">
                        <td className="p-2"><strong>Combined Average</strong></td>
                        <td className="text-center p-2">{pattern.combinedScore.toFixed(2)}</td>
                        <td className="p-2">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getSeverityColor710(pattern.combinedScore) + '20',
                              color: getSeverityColor710(pattern.combinedScore)
                            }}
                          >
                            {pattern.combinedLabel}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${pattern.percentage}%`,
                      backgroundColor: getSeverityColor710(pattern.combinedScore)
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  {pattern.percentage}% of maximum intensity
                </p>

                {/* Cross-Setting Analysis */}
                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Cross-setting analysis:</p>
                  {hasLargeDiscrepancy ? (
                    <p className="text-sm text-amber-700">
                      <strong>⚠ Significant discrepancy detected</strong> (difference of {discrepancy.toFixed(2)}).
                      This emotional/behavioral pattern shows differently at home vs. school.
                    </p>
                  ) : (
                    <p className="text-sm text-green-700">
                      <strong>✓ Consistent across settings</strong> (difference of {discrepancy.toFixed(2)}).
                      Both raters observe similar emotional/behavioral patterns.
                    </p>
                  )}
                </div>

                {/* Clinical Notes */}
                <div className="bg-amber-50 rounded-lg p-4 text-sm text-gray-700 italic">
                  Setting-specific emotional patterns may reflect different support systems, expectations,
                  or stress levels across environments.
                </div>
              </div>
            );
          })}
        </div>

        {/* Coaching/Clinical Focus Suggestions */}
        <div className="border-t-2 pt-8 mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Coaching / clinical focus suggestions
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed bg-blue-50 rounded-lg p-6">
            <p>
              <strong>•</strong> Prioritise domains with <strong>Moderate</strong> or <strong>High</strong> combined scores,
              especially in FOC/HYP/IMP/ORG/DIM plus emotional patterns (ANG, INWF, BURN).
            </p>
            <p>
              <strong>•</strong> Explore discrepancies between parent and teacher ratings. High scores in only one setting
              may indicate contextual triggers, relationship dynamics or inconsistent structure.
            </p>
            <p>
              <strong>•</strong> Use this profile as a structured starting point for further assessment or for guiding
              classroom strategies, homework routines and self-esteem support.
            </p>
            <p>
              <strong>•</strong> Consider referral for formal diagnostic evaluation if multiple core ADHD domains show
              Moderate-High elevation across both settings, especially with functional impairment.
            </p>
            <p>
              <strong>•</strong> Address emotional/impact patterns (ANG, INWF, BURN, BULLY) alongside core ADHD symptoms,
              as these often significantly affect quality of life and treatment response.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-10 bg-gray-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">Score Interpretation Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span className="font-semibold">Low / Minimal</span>
              </div>
              <p className="text-xs text-gray-600">Score 1.0-1.4</p>
              <p className="text-xs text-gray-600">Typical functioning</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="font-semibold">Mild / Occasional</span>
              </div>
              <p className="text-xs text-gray-600">Score 1.5-2.4</p>
              <p className="text-xs text-gray-600">Monitor and support</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="font-semibold">Moderate</span>
              </div>
              <p className="text-xs text-gray-600">Score 2.5-3.4</p>
              <p className="text-xs text-gray-600">Intervention recommended</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#991b1b' }}></div>
                <span className="font-semibold">High</span>
              </div>
              <p className="text-xs text-gray-600">Score 3.5-4.0</p>
              <p className="text-xs text-gray-600">Urgent attention needed</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t text-center text-sm text-gray-500">
          <p>This report is generated by BrainWorx Neural Imprint Patterns (NIPP) Assessment System</p>
          <p className="mt-2">This is a screening tool and does not constitute a formal diagnosis</p>
          <p className="mt-1">© BrainWorx {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
