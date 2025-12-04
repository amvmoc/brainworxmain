import React from 'react';
import type { ClinicalNote } from '../types/coachReport';

interface ClinicalNotesProps {
  notes: ClinicalNote[];
}

const ClinicalNotes: React.FC<ClinicalNotesProps> = ({ notes }) => {
  return (
    <div className="bg-white p-8 print:page-break-before-always">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">📝</span>
            Clinical Notes
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-8">
          <p className="text-blue-900 font-semibold mb-2">🔒 Confidential Professional Documentation</p>
          <p className="text-gray-700 text-sm">
            These clinical notes document professional observations, assessments, and recommendations.
            They serve as a record of the evaluation process and provide context for ongoing care.
          </p>
        </div>

        <div className="space-y-6">
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-lg print:page-break-inside-avoid"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{note.practitioner}</p>
                    <p className="text-sm text-gray-600">{note.date}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  Clinical Note
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>👁️</span> Observation
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{note.observation}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span>💡</span> Recommendation
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{note.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
          <h4 className="font-semibold text-amber-900 mb-3">⚠️ Important Information</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>Clinical notes are part of your confidential health record</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>These observations inform treatment planning and track progress over time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>You may request copies of clinical documentation at any time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>Notes may be updated following each session or significant clinical event</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClinicalNotes;
