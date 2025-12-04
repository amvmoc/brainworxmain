import React from 'react';
import type { PatternDetail } from '../types/coachReport';

interface PatternCardProps {
  pattern: PatternDetail;
  index: number;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, index }) => {
  const getColorClasses = (score: number) => {
    if (score >= 60) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-900',
        badge: 'bg-red-500'
      };
    } else if (score >= 40) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-900',
        badge: 'bg-yellow-500'
      };
    } else {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-900',
        badge: 'bg-blue-500'
      };
    }
  };

  const colors = getColorClasses(pattern.score);

  return (
    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6 mb-6 print:page-break-inside-avoid`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
              {index + 1}
            </span>
            <h4 className={`text-xl font-bold ${colors.text}`}>
              {pattern.code} - {pattern.name}
            </h4>
          </div>
          <p className="text-gray-700 italic">{pattern.description}</p>
        </div>
        <div className="ml-4 text-right">
          <div className={`inline-block px-4 py-2 ${colors.badge} text-white rounded-full font-bold text-lg`}>
            {pattern.score}%
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div className="bg-white rounded-lg p-4">
          <h5 className="font-semibold text-gray-800 mb-2">🔬 Clinical Significance</h5>
          <p className="text-gray-700 text-sm">{pattern.clinicalSignificance}</p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h5 className="font-semibold text-gray-800 mb-2">👁️ Observed Behaviors</h5>
          <ul className="space-y-1">
            {pattern.observedBehaviors.map((behavior, idx) => (
              <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                <span className="text-gray-500 mt-1">•</span>
                <span>{behavior}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h5 className="font-semibold text-gray-800 mb-2">🧠 Neurological Impact</h5>
          <p className="text-gray-700 text-sm">{pattern.neurologicalImpact}</p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h5 className="font-semibold text-gray-800 mb-2">💡 Recommendations</h5>
          <ul className="space-y-1">
            {pattern.recommendations.map((rec, idx) => (
              <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatternCard;
