import React from 'react';
import type { ProgressTrackingData } from '../types/coachReport';

interface ProgressTrackingProps {
  tracking: ProgressTrackingData;
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ tracking }) => {
  return (
    <div className="bg-white p-8 print:page-break-before-always">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">📈</span>
            Progress Tracking Framework
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border-l-4 border-blue-900">
          <p className="text-gray-700 leading-relaxed">
            Systematic progress tracking is essential for measuring improvement and adjusting interventions.
            This framework provides structure for monitoring changes across multiple domains and timeframes.
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500 mb-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <span>📅</span> Review Schedule
          </h3>
          <div className="space-y-3">
            {tracking.reviewSchedule.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span> Key Tracking Metrics
          </h3>
          <div className="space-y-4">
            {tracking.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-lg print:page-break-inside-avoid"
              >
                <h4 className="text-lg font-bold text-gray-800 mb-4">{metric.metric}</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Baseline</p>
                    <p className="text-gray-700">{metric.baseline}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-green-900 mb-1">Target</p>
                    <p className="text-gray-700">{metric.target}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="text-sm font-semibold text-purple-900 mb-1">Frequency</p>
                    <p className="text-gray-700">{metric.frequency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cyan-50 rounded-xl p-6 border-l-4 border-cyan-500 mb-8">
          <h3 className="text-xl font-bold text-cyan-900 mb-4 flex items-center gap-2">
            <span>🛠️</span> Tracking Tools
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {tracking.trackingTools.map((tool, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 flex items-center gap-3 hover:-translate-y-1 transition-transform"
              >
                <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-gray-700 font-medium">{tool}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <span>✓</span> Best Practices
            </h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Track consistently at the same time each day/week</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Be honest and objective in self-reporting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Look for trends over time, not day-to-day fluctuations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Celebrate small wins and progressive improvements</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
            <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <span>⚠️</span> Important Reminders
            </h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Progress is rarely linear - expect ups and downs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Share tracking data with your practitioner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Adjust goals and strategies based on what data reveals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Don't get discouraged by temporary setbacks</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-cyan-500 rounded-xl p-6 text-white text-center">
          <h4 className="text-xl font-bold mb-3">🎯 Remember: Data Drives Success</h4>
          <p className="leading-relaxed">
            Consistent tracking provides objective evidence of progress, helps identify what's working,
            and guides adjustments to maximize your success. Make it a non-negotiable part of your routine.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;
