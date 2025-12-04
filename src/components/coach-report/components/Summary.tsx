import React from 'react';
import type { Summary as SummaryData } from '../types/coachReport';

interface SummaryProps {
  summary: SummaryData;
}

const Summary: React.FC<SummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white p-8 print:page-break-before-always">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Summary & Next Steps
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-cyan-500 rounded-xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-4">Overall Prognosis</h3>
          <p className="leading-relaxed text-lg">{summary.overallPrognosis}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-cyan-50 rounded-xl p-6 border-l-4 border-cyan-500">
            <h3 className="text-xl font-bold text-cyan-900 mb-4 flex items-center gap-2">
              <span>🔑</span> Key Takeaways
            </h3>
            <ul className="space-y-3">
              {summary.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-cyan-600 mt-1 flex-shrink-0">▸</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <span>⚡</span> Priority Actions
            </h3>
            <ul className="space-y-3">
              {summary.priorityActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500 mb-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <span>📅</span> Next Steps Timeline
          </h3>
          <div className="space-y-4">
            {summary.nextSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="text-gray-800 font-medium">{step.action}</span>
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                  {step.timeline}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <span>🚨</span> Emergency Contacts
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {summary.emergencyContacts.map((contact, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                <p className="font-semibold text-gray-800 mb-2">{contact.name}</p>
                <p className="text-lg font-bold text-red-600 mb-1">{contact.phone}</p>
                <p className="text-xs text-gray-600">{contact.availability}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-red-100 rounded-lg p-4">
            <p className="text-sm text-red-900">
              <strong>If you are experiencing a mental health emergency:</strong> Call 911 or go to your
              nearest emergency room. The National Suicide Prevention Lifeline is available 24/7 at
              1-800-273-8255.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-900 to-cyan-500 rounded-full mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">You've Taken an Important Step</h3>
          <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Completing this comprehensive assessment demonstrates commitment to understanding and
            transforming your neural patterns. With dedicated effort and professional support, meaningful
            change is possible. Your journey to improved well-being starts now.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-900 to-cyan-500 text-white rounded-full font-semibold">
            <span>Ready to Begin</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-gray-200 text-center text-sm text-gray-600">
          <p className="mb-2">This report is confidential and intended solely for the client and authorized healthcare providers.</p>
          <p>© {new Date().getFullYear()} BrainWorx Neural Imprint Assessment System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Summary;
