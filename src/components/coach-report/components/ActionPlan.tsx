import React from 'react';
import type { ActionPlanPhase } from '../types/coachReport';

interface ActionPlanProps {
  plan: ActionPlanPhase[];
}

const ActionPlan: React.FC<ActionPlanProps> = ({ plan }) => {
  return (
    <div className="bg-white p-8 print:page-break-before-always">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            6-Month Action Plan
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border-l-4 border-blue-900">
          <p className="text-gray-700 leading-relaxed">
            This structured action plan provides a comprehensive roadmap for addressing identified neural
            imprint patterns over a 6-month period. Each phase builds upon previous progress and includes
            specific, measurable goals and activities.
          </p>
        </div>

        <div className="space-y-8">
          {plan.map((phase, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow print:page-break-inside-avoid"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-900 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{phase.phase}</h3>
                  <p className="text-cyan-600 font-semibold">{phase.timeframe}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span>🎯</span> Focus Areas
                  </h4>
                  <ul className="space-y-2">
                    {phase.focus.map((item, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-blue-600 mt-1">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <span>🏆</span> Goals
                  </h4>
                  <ul className="space-y-2">
                    {phase.goals.map((item, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-1">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <span>⚡</span> Activities
                  </h4>
                  <ul className="space-y-2">
                    {phase.activities.map((item, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-purple-600 mt-1">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-cyan-50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <h4 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                    <span>✓</span> Success Indicators
                  </h4>
                  <ul className="space-y-2">
                    {phase.successIndicators.map((item, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-cyan-600 mt-1">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
          <h4 className="font-semibold text-amber-900 mb-3">⚠️ Important Notes</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>This plan should be reviewed and adjusted monthly based on progress and changing needs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>Consistency is key - daily practice of strategies yields best results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>Regular check-ins with practitioner ensure proper implementation and support</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ActionPlan;
