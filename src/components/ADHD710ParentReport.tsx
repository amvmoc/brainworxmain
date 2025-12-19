import React from 'react';
import { NIPP_PATTERNS, scoreToPercentage, getSeverityLabel710, getSeverityColor710 } from '../data/adhd710AssessmentQuestions';

interface PatternScore {
  code: string;
  name: string;
  category: string;
  parentScore: number;
  teacherScore: number;
  combinedScore: number;
  parentLabel: string;
  teacherLabel: string;
  combinedLabel: string;
  percentage: number;
}

interface ADHD710ParentReportProps {
  childInfo: {
    name: string;
    age: number;
  };
  parentInfo: {
    name: string;
  };
  teacherInfo: {
    name: string;
    email?: string;
  };
  patterns: PatternScore[];
  date: string;
}

export default function ADHD710ParentReport({ childInfo, parentInfo, teacherInfo, patterns, date }: ADHD710ParentReportProps) {
  const corePatterns = patterns.filter(p => p.category === 'Core ADHD');
  const emotionalPatterns = patterns.filter(p => p.category === 'Emotional/Impact');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2">
          <div>
            <div className="w-32 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mb-3">
              BrainWorx
            </div>
            <div className="text-sm text-gray-600">
              <strong>BrainWorx</strong> – Neural Imprint Patterns (NIPP)<br />
              Child Focus & Behaviour Screen (7–10 years)
            </div>
          </div>
          <div className="text-right text-sm text-gray-700">
            <div><strong>Child Name:</strong> {childInfo.name}</div>
            <div><strong>Age:</strong> {childInfo.age}</div>
            <div><strong>Parent:</strong> {parentInfo.name}</div>
            <div><strong>Teacher:</strong> {teacherInfo.name}</div>
            {teacherInfo.email && <div><strong>Teacher email:</strong> {teacherInfo.email}</div>}
            <div><strong>Date:</strong> {date}</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Parent Summary Report
        </h1>
        <p className="text-gray-700 mb-8 leading-relaxed">
          This report gives a picture of how your child's focus, homework habits, energy and emotions
          show up at home and at school. It is not a diagnosis, but a map to guide support and possible
          next steps.
        </p>

        {/* Core ADHD Patterns */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">
          Focus, homework and impulse patterns
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          These patterns show how your child manages attention, organisation and self-control for
          school-age demands.
        </p>

        <div className="space-y-6 mb-10">
          {corePatterns.map((pattern) => (
            <div key={pattern.code} className="border border-gray-300 rounded-lg p-5 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {pattern.code} – {pattern.name}
              </h3>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>At home:</strong> Average {pattern.parentScore.toFixed(2)} ({pattern.parentLabel})
                </p>
                <p className="text-sm text-gray-700">
                  <strong>At school:</strong> Average {pattern.teacherScore.toFixed(2)} ({pattern.teacherLabel})
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Overall pattern:</strong> Average {pattern.combinedScore.toFixed(2)} ({pattern.combinedLabel})
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${pattern.percentage}%`,
                    backgroundColor: getSeverityColor710(pattern.combinedScore)
                  }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {pattern.percentage}% of maximum intensity
              </p>

              {/* Pattern Description */}
              <p className="mt-3 text-sm text-gray-600 italic">
                {NIPP_PATTERNS[pattern.code as keyof typeof NIPP_PATTERNS].description}
              </p>
            </div>
          ))}
        </div>

        {/* Emotional/Impact Patterns */}
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-3">
          Emotional and impact patterns
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          These patterns look at frustration, worry, resistance and how your child experiences themselves
          and other children in this stage of school.
        </p>

        <div className="space-y-6 mb-10">
          {emotionalPatterns.map((pattern) => (
            <div key={pattern.code} className="border border-gray-300 rounded-lg p-5 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {pattern.code} – {pattern.name}
              </h3>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>At home:</strong> Average {pattern.parentScore.toFixed(2)} ({pattern.parentLabel})
                </p>
                <p className="text-sm text-gray-700">
                  <strong>At school:</strong> Average {pattern.teacherScore.toFixed(2)} ({pattern.teacherLabel})
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Overall pattern:</strong> Average {pattern.combinedScore.toFixed(2)} ({pattern.combinedLabel})
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${pattern.percentage}%`,
                    backgroundColor: getSeverityColor710(pattern.combinedScore)
                  }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {pattern.percentage}% of maximum intensity
              </p>

              {/* Pattern Description */}
              <p className="mt-3 text-sm text-gray-600 italic">
                {NIPP_PATTERNS[pattern.code as keyof typeof NIPP_PATTERNS].description}
              </p>
            </div>
          ))}
        </div>

        {/* How to Use This Report */}
        <div className="border-t-2 pt-8 mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to use this as a parent
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>•</strong> Patterns in the <strong>Moderate</strong> or <strong>High</strong> range are good places
              to start working with your coach or a professional on practical support at home and school.
            </p>
            <p>
              <strong>•</strong> A higher score does not mean your child is "lazy" or "naughty". It usually shows where
              their brain needs more structure, routines and understanding.
            </p>
            <p>
              <strong>•</strong> This report cannot diagnose ADHD. If you are concerned, please discuss these results with
              a paediatrician, psychologist or other qualified health professional.
            </p>
            <p>
              <strong>•</strong> Look at differences between home and school scores. If one setting shows much higher
              scores than the other, it may indicate that environmental factors or specific supports in one
              environment are helping your child succeed.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-10 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">Understanding the Scores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span className="font-semibold">Low / Minimal</span>
              </div>
              <p className="text-xs text-gray-600">Score 1.0-1.4</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="font-semibold">Mild / Occasional</span>
              </div>
              <p className="text-xs text-gray-600">Score 1.5-2.4</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="font-semibold">Moderate</span>
              </div>
              <p className="text-xs text-gray-600">Score 2.5-3.4</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#991b1b' }}></div>
                <span className="font-semibold">High</span>
              </div>
              <p className="text-xs text-gray-600">Score 3.5-4.0</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t text-center text-sm text-gray-500">
          <p>This report is generated by BrainWorx Neural Imprint Patterns (NIPP) Assessment System</p>
          <p className="mt-2">For more information or support, please contact your BrainWorx coach</p>
        </div>
      </div>
    </div>
  );
}
