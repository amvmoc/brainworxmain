import React from 'react';
import type { PatternScore } from '../types/coachReport';

interface ScoringOverviewProps {
  scores: PatternScore[];
}

const ScoringOverview: React.FC<ScoringOverviewProps> = ({ scores }) => {
  const overallAvg = (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1);
  const highCount = scores.filter(s => s.score >= 60).length;
  const mediumCount = scores.filter(s => s.score >= 40 && s.score < 60).length;
  const lowCount = scores.filter(s => s.score < 40).length;

  return (
    <div className="bg-white p-8 print:page-break-after-always">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            Scoring Overview
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-cyan-500 rounded-xl p-6 text-white text-center">
            <p className="text-sm opacity-90 mb-2">Overall Average</p>
            <p className="text-5xl font-bold">{overallAvg}%</p>
            <p className="text-xs opacity-75 mt-2">Across 20 patterns</p>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
            <p className="text-sm text-red-800 font-semibold mb-2">High Priority</p>
            <p className="text-5xl font-bold text-red-600">{highCount}</p>
            <p className="text-xs text-red-700 mt-2">60-100%</p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
            <p className="text-sm text-yellow-800 font-semibold mb-2">Medium</p>
            <p className="text-5xl font-bold text-yellow-600">{mediumCount}</p>
            <p className="text-xs text-yellow-700 mt-2">40-59%</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
            <p className="text-sm text-blue-800 font-semibold mb-2">Low</p>
            <p className="text-5xl font-bold text-blue-600">{lowCount}</p>
            <p className="text-xs text-blue-700 mt-2">0-39%</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">All Pattern Scores</h3>
          <div className="space-y-4">
            {scores.map((pattern, idx) => {
              const bgColor = pattern.color === 'red' ? 'bg-red-100' :
                              pattern.color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100';
              const barColor = pattern.color === 'red' ? 'bg-red-500' :
                               pattern.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500';
              const textColor = pattern.color === 'red' ? 'text-red-900' :
                                pattern.color === 'yellow' ? 'text-yellow-900' : 'text-blue-900';
              const borderColor = pattern.color === 'red' ? 'border-red-300' :
                                  pattern.color === 'yellow' ? 'border-yellow-300' : 'border-blue-300';

              return (
                <div key={idx} className={`${bgColor} ${borderColor} border-2 rounded-lg p-4`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-600">#{idx + 1}</span>
                      <div>
                        <p className={`font-bold ${textColor}`}>{pattern.code} - {pattern.name}</p>
                        <p className="text-xs text-gray-600">{pattern.questionCount} questions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{pattern.score}%</p>
                      <p className="text-xs text-gray-600">{pattern.severity}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div
                      className={`${barColor} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${pattern.score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-cyan-50 border-l-4 border-cyan-500 rounded-r-lg p-6">
          <h4 className="font-semibold text-cyan-900 mb-2">📖 Interpretation Guide</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-red-900">High (60-100%)</p>
              <p>Requires immediate attention and targeted intervention</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-900">Medium (40-59%)</p>
              <p>Warrants monitoring and proactive management</p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Low (0-39%)</p>
              <p>Minimal concern, continue current positive strategies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringOverview;
