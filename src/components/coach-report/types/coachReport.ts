export interface ClientInfo {
  name: string;
  age: number;
  assessmentType: string;
  practitionerName: string;
  practitionerId: string;
}

export interface PatternScore {
  code: string;
  name: string;
  score: number;
  severity: 'High' | 'Medium' | 'Low';
  color: 'red' | 'yellow' | 'blue';
  questionCount: number;
  rawAverage: string;
}

export interface PatternDetail {
  code: string;
  name: string;
  score: number;
  description: string;
  clinicalSignificance: string;
  observedBehaviors: string[];
  neurologicalImpact: string;
  recommendations: string[];
}

export interface ActionPlanPhase {
  phase: string;
  timeframe: string;
  focus: string[];
  goals: string[];
  activities: string[];
  successIndicators: string[];
}

export interface Resource {
  title: string;
  description: string;
  type: string;
}

export interface ResourceCategory {
  category: string;
  icon: string;
  resources: Resource[];
}

export interface ProgressMetric {
  metric: string;
  baseline: string;
  target: string;
  frequency: string;
}

export interface ProgressTrackingData {
  reviewSchedule: string[];
  metrics: ProgressMetric[];
  trackingTools: string[];
}

export interface ClinicalNote {
  date: string;
  practitioner: string;
  observation: string;
  recommendation: string;
}

export interface Summary {
  overallPrognosis: string;
  keyTakeaways: string[];
  priorityActions: string[];
  nextSteps: {
    action: string;
    timeline: string;
  }[];
  emergencyContacts: {
    name: string;
    phone: string;
    availability: string;
  }[];
}

export interface CoachReportData {
  client: ClientInfo;
  assessmentDate: string;
  profileOverview: string;
  keyStrengths: string[];
  primaryConcerns: {
    pattern: string;
    description: string;
  }[];
  criticalFindings: string[];
  scores: PatternScore[];
  patterns: {
    high: PatternDetail[];
    medium: PatternDetail[];
    low: PatternDetail[];
  };
  actionPlan: ActionPlanPhase[];
  resources: ResourceCategory[];
  progressTracking: ProgressTrackingData;
  clinicalNotes: ClinicalNote[];
  summary: Summary;
}
