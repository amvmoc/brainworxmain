import React from 'react';
import type { ClientInfo } from '../types/coachReport';

interface ExecutiveSummaryProps {
  client: ClientInfo;
  profileOverview: string;
  keyStrengths: string[];
  primaryConcerns: { pattern: string; description: string }[];
  criticalFindings: string[];
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  client,
  profileOverview,
  keyStrengths,
  primaryConcerns,
  criticalFindings
}) => {
  return (
    <div className="bg-white p-8 print:page-break-after-always">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            Executive Summary
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Client Information</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {client.name}</p>
              <p><strong>Age:</strong> {client.age} years</p>
              <p><strong>Assessment:</strong> {client.assessmentType}</p>
            </div>
          </div>

          <div className="bg-cyan-50 rounded-xl p-6 border-l-4 border-cyan-500">
            <h3 className="text-lg font-bold text-cyan-900 mb-2">Practitioner</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {client.practitionerName}</p>
              <p><strong>ID:</strong> {client.practitionerId}</p>
              <p><strong>Specialization:</strong> Neural Imprint Analysis</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border-l-4 border-blue-900">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Overview</h3>
          <p className="text-gray-700 leading-relaxed">{profileOverview}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <span>💪</span> Key Strengths
            </h3>
            <ul className="space-y-2">
              {keyStrengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-6 border-l-4 border-amber-500">
            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> Primary Concerns
            </h3>
            <div className="space-y-3">
              {primaryConcerns.map((concern, idx) => (
                <div key={idx} className="text-gray-700">
                  <p className="font-semibold text-amber-900">{concern.pattern}</p>
                  <p className="text-sm mt-1">{concern.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {criticalFindings.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <span>🚨</span> Critical Findings
            </h3>
            <ul className="space-y-2">
              {criticalFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-red-600 mt-1">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveSummary;
