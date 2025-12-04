import React from 'react';
import type { PatternDetail } from '../types/coachReport';
import PatternCard from './PatternCard';

interface PatternAnalysisProps {
  patterns: {
    high: PatternDetail[];
    medium: PatternDetail[];
    low: PatternDetail[];
  };
}

const PatternAnalysis: React.FC<PatternAnalysisProps> = ({ patterns }) => {
  return (
    <div className="bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">🔍</span>
            Detailed Pattern Analysis
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        {patterns.high.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                !
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-900">High Priority Patterns</h3>
                <p className="text-gray-600">Scores 60-100% - Require immediate attention</p>
              </div>
            </div>
            <div className="space-y-6">
              {patterns.high.map((pattern, idx) => (
                <PatternCard key={pattern.code} pattern={pattern} index={idx} />
              ))}
            </div>
          </div>
        )}

        {patterns.medium.length > 0 && (
          <div className="mb-12 print:page-break-before-always">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                ⚠
              </div>
              <div>
                <h3 className="text-2xl font-bold text-yellow-900">Medium Priority Patterns</h3>
                <p className="text-gray-600">Scores 40-59% - Warrant monitoring and management</p>
              </div>
            </div>
            <div className="space-y-6">
              {patterns.medium.map((pattern, idx) => (
                <PatternCard key={pattern.code} pattern={pattern} index={idx} />
              ))}
            </div>
          </div>
        )}

        {patterns.low.length > 0 && (
          <div className="mb-12 print:page-break-before-always">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900">Low Priority Patterns</h3>
                <p className="text-gray-600">Scores 0-39% - Minimal concern</p>
              </div>
            </div>
            <div className="space-y-6">
              {patterns.low.map((pattern, idx) => (
                <PatternCard key={pattern.code} pattern={pattern} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternAnalysis;
