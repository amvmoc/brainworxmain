import React from 'react';
import { ADHD_CATEGORIES, getSeverityLevel, getSeverityColor } from '../data/adhdAssessmentQuestions';

interface ADHDParentReportProps {
  assessment: any;
  response: any;
  onClose?: () => void;
}

export default function ADHDParentReport({ assessment, response, onClose }: ADHDParentReportProps) {
  const { scores } = response;
  const { categories, overall } = scores;

  const categoryArray = Object.entries(categories).map(([name, data]: [string, any]) => ({
    name,
    ...data,
    severity: getSeverityLevel(data.percentage)
  })).sort((a, b) => b.percentage - a.percentage);

  const overallSeverity = getSeverityLevel(overall.percentage);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8 text-center">
          <img
            src="/brainworx-logo.png"
            alt="BrainworX Logo"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ADHD Assessment Report
          </h1>
          <h2 className="text-xl text-gray-600">Parent/Guardian Report</h2>
        </div>

        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Child's Name</p>
              <p className="font-medium">{assessment.child_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-medium">{assessment.child_age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Respondent</p>
              <p className="font-medium">{response.respondent_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Relationship</p>
              <p className="font-medium capitalize">{response.respondent_relationship.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed On</p>
              <p className="font-medium">
                {new Date(response.completed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Score</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold" style={{ color: getSeverityColor(overallSeverity) }}>
                {overall.percentage}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {overall.totalScore} out of {overall.maxScore} points
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold capitalize" style={{ color: getSeverityColor(overallSeverity) }}>
                {overallSeverity} Level
              </p>
              <p className="text-sm text-gray-600">Severity Assessment</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryArray.map(category => (
              <div key={category.name} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: getSeverityColor(category.severity) }}
                  >
                    {category.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: getSeverityColor(category.severity)
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Score: {category.score} / {category.maxScore} ({category.count} questions)
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Top 3 Areas of Concern</h3>
          <div className="space-y-2">
            {categoryArray.slice(0, 3).map((category, index) => (
              <div key={category.name} className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600">
                    {category.percentage}% severity ({category.severity} level)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 p-6 bg-green-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Understanding Your Results</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              This assessment provides insights into your child's ADHD-related behaviors based on your observations as a parent/guardian.
            </p>
            <p>
              <strong>Severity Levels:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><span style={{ color: getSeverityColor('low') }}>Low (0-24%):</span> Minimal concerns in this area</li>
              <li><span style={{ color: getSeverityColor('moderate') }}>Moderate (25-49%):</span> Some concerns that may benefit from monitoring</li>
              <li><span style={{ color: getSeverityColor('high') }}>High (50-74%):</span> Significant concerns that warrant professional consultation</li>
              <li><span style={{ color: getSeverityColor('severe') }}>Severe (75-100%):</span> Critical concerns requiring immediate professional attention</li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Next Steps</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              1. <strong>Complete the Caregiver Assessment:</strong> A teacher or other caregiver's perspective is essential for a comprehensive evaluation.
            </p>
            <p>
              2. <strong>Review the Comprehensive Report:</strong> Once both assessments are complete, a detailed combined report will be available.
            </p>
            <p>
              3. <strong>Consult with a Professional:</strong> Share these results with your child's healthcare provider or a qualified mental health professional.
            </p>
            <p>
              4. <strong>Develop an Action Plan:</strong> Work with professionals to create strategies and interventions tailored to your child's needs.
            </p>
          </div>
        </div>

        {onClose && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close Report
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} BrainworX. All rights reserved.</p>
          <p className="mt-1">
            This assessment is for informational purposes only and does not constitute a clinical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}
