import React from 'react';
import type { CoachReportData } from './types/coachReport';
import CoverPage from './components/CoverPage';
import ExecutiveSummary from './components/ExecutiveSummary';
import ScoringOverview from './components/ScoringOverview';
import PatternAnalysis from './components/PatternAnalysis';
import ActionPlan from './components/ActionPlan';
import Resources from './components/Resources';
import ProgressTracking from './components/ProgressTracking';
import ClinicalNotes from './components/ClinicalNotes';
import Summary from './components/Summary';

interface CoachReportProps {
  data: CoachReportData;
}

const CoachReport: React.FC<CoachReportProps> = ({ data }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <CoverPage
        client={data.client}
        assessmentDate={data.assessmentDate}
      />

      <ExecutiveSummary
        client={data.client}
        profileOverview={data.profileOverview}
        keyStrengths={data.keyStrengths}
        primaryConcerns={data.primaryConcerns}
        criticalFindings={data.criticalFindings}
      />

      <ScoringOverview scores={data.scores} />

      <PatternAnalysis patterns={data.patterns} />

      <ActionPlan plan={data.actionPlan} />

      <Resources resources={data.resources} />

      <ProgressTracking tracking={data.progressTracking} />

      <ClinicalNotes notes={data.clinicalNotes} />

      <Summary summary={data.summary} />
    </div>
  );
};

export default CoachReport;
