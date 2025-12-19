import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, FileText } from 'lucide-react';
import ADHD710ParentReport from './ADHD710ParentReport';
import ADHD710CoachReport from './ADHD710CoachReport';
import {
  calculateCategoryScores710,
  calculateNIPPScores,
  getSeverityLabel710,
  scoreToPercentage,
  NIPP_PATTERNS
} from '../data/adhd710AssessmentQuestions';

interface ADHD710PublicResultsProps {
  shareToken: string;
}

export default function ADHD710PublicResults({ shareToken }: ADHD710PublicResultsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState<any>(null);
  const [parentResponse, setParentResponse] = useState<any>(null);
  const [teacherResponse, setTeacherResponse] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'selection' | 'parent' | 'coach'>('selection');
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    loadResults();
  }, [shareToken]);

  const loadResults = async () => {
    try {
      // Get assessment by share token
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('adhd_assessments')
        .select('*')
        .eq('share_token', shareToken)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      // Check if both assessments are completed
      if (assessmentData.status !== 'both_completed') {
        throw new Error('Assessment is not yet complete. Please wait for both parent and teacher to finish.');
      }

      setAssessment(assessmentData);

      // Get responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('adhd_assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentData.id);

      if (responsesError) throw responsesError;

      const parent = responsesData.find(r => r.respondent_type === 'parent');
      const teacher = responsesData.find(r => r.respondent_type === 'caregiver');

      if (!parent || !teacher) {
        throw new Error('Missing assessment responses');
      }

      setParentResponse(parent);
      setTeacherResponse(teacher);

      // Calculate patterns for display
      const parentNIPP = parent.scores?.nippScores || {};
      const teacherNIPP = teacher.scores?.nippScores || {};

      const patternsData = Object.keys(NIPP_PATTERNS).map(code => {
        const parentScore = parentNIPP[code] || 0;
        const teacherScore = teacherNIPP[code] || 0;
        const combinedScore = (parentScore + teacherScore) / 2;

        return {
          code,
          name: NIPP_PATTERNS[code as keyof typeof NIPP_PATTERNS].name,
          category: NIPP_PATTERNS[code as keyof typeof NIPP_PATTERNS].category,
          parentScore,
          teacherScore,
          combinedScore,
          parentLabel: getSeverityLabel710(parentScore),
          teacherLabel: getSeverityLabel710(teacherScore),
          combinedLabel: getSeverityLabel710(combinedScore),
          percentage: scoreToPercentage(combinedScore)
        };
      });

      // Sort by combined score
      patternsData.sort((a, b) => b.combinedScore - a.combinedScore);
      setPatterns(patternsData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Unable to Load Results</h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'parent' && assessment && parentResponse && teacherResponse) {
    return (
      <div>
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={() => setViewMode('selection')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Report Selection
            </button>
          </div>
        </div>
        <ADHD710ParentReport
          childInfo={{
            name: assessment.child_name,
            age: assessment.child_age
          }}
          parentInfo={{
            name: parentResponse.respondent_name
          }}
          teacherInfo={{
            name: teacherResponse.respondent_name,
            email: teacherResponse.respondent_email
          }}
          patterns={patterns}
          date={new Date(assessment.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        />
      </div>
    );
  }

  if (viewMode === 'coach' && assessment && parentResponse && teacherResponse) {
    return (
      <div>
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button
              onClick={() => setViewMode('selection')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Report Selection
            </button>
          </div>
        </div>
        <ADHD710CoachReport
          childInfo={{
            name: assessment.child_name,
            age: assessment.child_age
          }}
          parentInfo={{
            name: parentResponse.respondent_name
          }}
          teacherInfo={{
            name: teacherResponse.respondent_name,
            email: teacherResponse.respondent_email
          }}
          patterns={patterns}
          date={new Date(assessment.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        />
      </div>
    );
  }

  // Report selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              Assessment Complete
            </h1>
            <p className="text-center text-blue-100">
              {assessment?.child_name} - Age {assessment?.child_age}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Choose Your Report
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Select which version of the report you'd like to view
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Parent Report Card */}
              <button
                onClick={() => setViewMode('parent')}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Parent Summary Report
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Easy-to-read overview with visual charts and practical guidance for home and school support.
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                  View Parent Report
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Coach Report Card */}
              <button
                onClick={() => setViewMode('coach')}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Professional / Coach Report
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Detailed clinical analysis with cross-setting comparisons and coaching focus suggestions.
                </p>
                <div className="flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                  View Coach Report
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Download Options */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Need to save or print?</h3>
              <p className="text-sm text-gray-600">
                You can print either report directly from your browser using the print function (Ctrl+P or Cmd+P).
                The reports are formatted for optimal printing.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This assessment is a screening tool and does not constitute a formal diagnosis.</p>
          <p className="mt-2">© {new Date().getFullYear()} BrainWorx. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
