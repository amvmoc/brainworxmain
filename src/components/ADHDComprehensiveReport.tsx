import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ADHD_CATEGORIES, getSeverityLevel, getSeverityColor } from '../data/adhdAssessmentQuestions';

interface ADHDComprehensiveReportProps {
  assessment: any;
  parentResponse: any;
  caregiverResponse: any;
}

export default function ADHDComprehensiveReport({
  assessment,
  parentResponse,
  caregiverResponse
}: ADHDComprehensiveReportProps) {
  const parentScores = parentResponse.scores;
  const caregiverScores = caregiverResponse.scores;

  const comparisonData = Object.keys(parentScores.categories).map(category => ({
    category: category.length > 20 ? category.substring(0, 18) + '...' : category,
    fullCategory: category,
    parent: parentScores.categories[category].percentage,
    caregiver: caregiverScores.categories[category]?.percentage || 0
  }));

  const radarData = Object.keys(parentScores.categories).map(category => ({
    category: category.length > 15 ? category.substring(0, 13) + '...' : category,
    parent: parentScores.categories[category].percentage,
    caregiver: caregiverScores.categories[category]?.percentage || 0
  }));

  const parentOverall = parentScores.overall;
  const caregiverOverall = caregiverScores.overall;

  const combinedPercentage = Math.round((parentOverall.percentage + caregiverOverall.percentage) / 2);
  const combinedSeverity = getSeverityLevel(combinedPercentage);

  const getDiscrepancy = (parentPct: number, caregiverPct: number) => {
    const diff = Math.abs(parentPct - caregiverPct);
    if (diff < 15) return { level: 'Consistent', color: '#10b981' };
    if (diff < 30) return { level: 'Moderate Difference', color: '#f59e0b' };
    return { level: 'Significant Difference', color: '#ef4444' };
  };

  const areasOfAgreement = comparisonData.filter(item =>
    Math.abs(item.parent - item.caregiver) < 15 && (item.parent > 50 || item.caregiver > 50)
  );

  const areasOfDiscrepancy = comparisonData.filter(item =>
    Math.abs(item.parent - item.caregiver) >= 30
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8 text-center">
          <img
            src="/brainworx-logo.png"
            alt="BrainworX Logo"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Comprehensive ADHD Assessment Report
          </h1>
          <h2 className="text-xl text-gray-600">Combined Parent & Caregiver Analysis</h2>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-indigo-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-lg">{assessment.child_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-medium text-lg">{assessment.child_age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assessment Date</p>
              <p className="font-medium text-lg">
                {new Date(assessment.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Parent Assessment</h3>
            <p className="text-sm text-gray-600 mb-3">
              By: {parentResponse.respondent_name} ({parentResponse.respondent_relationship.replace('_', ' ')})
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold" style={{ color: getSeverityColor(getSeverityLevel(parentOverall.percentage)) }}>
                  {parentOverall.percentage}%
                </p>
                <p className="text-sm text-gray-600">{parentOverall.totalScore} / {parentOverall.maxScore} points</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold capitalize" style={{ color: getSeverityColor(getSeverityLevel(parentOverall.percentage)) }}>
                  {getSeverityLevel(parentOverall.percentage)}
                </p>
                <p className="text-sm text-gray-600">Level</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Caregiver Assessment</h3>
            <p className="text-sm text-gray-600 mb-3">
              By: {caregiverResponse.respondent_name} ({caregiverResponse.respondent_relationship.replace('_', ' ')})
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold" style={{ color: getSeverityColor(getSeverityLevel(caregiverOverall.percentage)) }}>
                  {caregiverOverall.percentage}%
                </p>
                <p className="text-sm text-gray-600">{caregiverOverall.totalScore} / {caregiverOverall.maxScore} points</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold capitalize" style={{ color: getSeverityColor(getSeverityLevel(caregiverOverall.percentage)) }}>
                  {getSeverityLevel(caregiverOverall.percentage)}
                </p>
                <p className="text-sm text-gray-600">Level</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-orange-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Combined Overall Assessment</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold" style={{ color: getSeverityColor(combinedSeverity) }}>
                {combinedPercentage}%
              </p>
              <p className="text-sm text-gray-600 mt-2">Average across both assessments</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold capitalize" style={{ color: getSeverityColor(combinedSeverity) }}>
                {combinedSeverity} Severity
              </p>
              <p className="text-sm text-gray-600 mt-1">Composite Rating</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Category Comparison Chart</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border rounded shadow-lg">
                          <p className="font-semibold mb-2">{data.fullCategory}</p>
                          <p className="text-blue-600">Parent: {data.parent}%</p>
                          <p className="text-indigo-600">Caregiver: {data.caregiver}%</p>
                          <p className="text-gray-600 text-sm mt-2">
                            Difference: {Math.abs(data.parent - data.caregiver)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="parent" fill="#3b82f6" name="Parent Rating" />
                <Bar dataKey="caregiver" fill="#6366f1" name="Caregiver Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Behavioral Profile Radar</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Parent" dataKey="parent" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Caregiver" dataKey="caregiver" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {areasOfAgreement.length > 0 && (
          <div className="mb-8 p-6 bg-green-50 rounded-lg border-2 border-green-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Areas of Strong Agreement</h3>
            <p className="text-gray-700 mb-4">
              The following areas show consistent ratings between parent and caregiver, indicating reliable observations:
            </p>
            <div className="space-y-3">
              {areasOfAgreement.map(item => {
                const avg = Math.round((item.parent + item.caregiver) / 2);
                const severity = getSeverityLevel(avg);
                return (
                  <div key={item.fullCategory} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <p className="font-semibold text-gray-900">{item.fullCategory}</p>
                      <p className="text-sm text-gray-600">
                        Parent: {item.parent}% | Caregiver: {item.caregiver}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: getSeverityColor(severity) }}>
                        {avg}%
                      </p>
                      <p className="text-xs text-gray-600 capitalize">{severity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {areasOfDiscrepancy.length > 0 && (
          <div className="mb-8 p-6 bg-red-50 rounded-lg border-2 border-red-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Areas of Significant Discrepancy</h3>
            <p className="text-gray-700 mb-4">
              These areas show notable differences between home and school/care settings, requiring further exploration:
            </p>
            <div className="space-y-3">
              {areasOfDiscrepancy.map(item => {
                const discrepancy = getDiscrepancy(item.parent, item.caregiver);
                return (
                  <div key={item.fullCategory} className="p-4 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{item.fullCategory}</h4>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: discrepancy.color }}
                      >
                        {Math.abs(item.parent - item.caregiver)}% difference
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Parent Rating</p>
                        <p className="text-xl font-bold text-blue-600">{item.parent}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Caregiver Rating</p>
                        <p className="text-xl font-bold text-indigo-600">{item.caregiver}%</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Possible reasons:</strong> Different environmental demands, observer interpretation,
                      situational behavior variation, or different expectations between settings.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Clinical Summary</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Assessment Overview:</strong> This comprehensive report combines observations from both
              home and educational/care settings to provide a complete picture of {assessment.child_name}'s
              ADHD-related behaviors.
            </p>
            <p>
              <strong>Combined Severity Level: {combinedSeverity}</strong>
            </p>
            <p>
              The combined assessment indicates a <strong>{combinedSeverity.toLowerCase()}</strong> level of
              ADHD-related concerns based on ratings from multiple environments. This multi-informant approach
              provides valuable insights into consistency and context-specific behaviors.
            </p>
            {areasOfDiscrepancy.length > 0 && (
              <p>
                <strong>Note on Discrepancies:</strong> Significant differences between parent and caregiver
                ratings in {areasOfDiscrepancy.length} area(s) suggest that behaviors may vary across settings
                or that different expectations exist between environments. These areas warrant detailed discussion
                during clinical consultation.
              </p>
            )}
          </div>
        </div>

        <div className="mb-8 p-6 bg-purple-50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations for Intervention</h3>
          <div className="space-y-4 text-gray-700">
            {combinedSeverity === 'severe' && (
              <div className="p-4 bg-red-100 border-2 border-red-400 rounded">
                <p className="font-bold text-red-900">URGENT: Immediate professional evaluation recommended</p>
                <p className="text-red-800 mt-2">
                  The severity of symptoms across both settings indicates a need for immediate consultation
                  with a qualified healthcare provider for comprehensive diagnostic assessment and intervention planning.
                </p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Professional Evaluation</h4>
              <p>
                Schedule a comprehensive evaluation with a qualified mental health professional (psychiatrist,
                psychologist, or developmental pediatrician) for formal diagnosis and treatment planning.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Environmental Modifications</h4>
              <p>
                Implement structured routines, clear expectations, and consistent behavioral strategies across
                both home and school settings. Coordinate approaches between parents and educators.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Behavioral Interventions</h4>
              <p>
                Consider evidence-based behavioral interventions such as positive reinforcement systems,
                organizational supports, and social skills training. Parent training programs can be particularly effective.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Academic Support</h4>
              <p>
                Evaluate need for educational accommodations (504 Plan or IEP). Consider preferential seating,
                extended time, frequent breaks, and modified assignments as appropriate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">5. Ongoing Monitoring</h4>
              <p>
                Regular reassessment is recommended to track progress, adjust interventions, and ensure
                strategies remain effective as the child develops.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Follow-Up Actions</h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                1
              </span>
              <p className="text-gray-700">
                Share this comprehensive report with healthcare providers and educational staff
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                2
              </span>
              <p className="text-gray-700">
                Schedule a meeting with all stakeholders (parents, teachers, healthcare providers) to develop a coordinated intervention plan
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                3
              </span>
              <p className="text-gray-700">
                Implement recommended strategies consistently across all settings
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                4
              </span>
              <p className="text-gray-700">
                Schedule follow-up assessment in 3-6 months to evaluate progress and adjust interventions
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700 mb-2">Important Disclaimer</p>
          <p>
            This assessment is a screening tool designed to identify areas of concern and guide further evaluation.
            It does NOT constitute a clinical diagnosis of ADHD or any other condition.
          </p>
          <p className="mt-2">
            Only qualified healthcare professionals can provide a formal diagnosis based on comprehensive clinical evaluation,
            including medical history, physical examination, and additional testing as appropriate.
          </p>
          <p className="mt-4">
            © {new Date().getFullYear()} BrainworX. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
