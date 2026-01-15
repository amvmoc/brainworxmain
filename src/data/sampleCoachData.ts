import type { CoachReportData, PatternScore, PatternDetail } from '../components/coach-report/types/coachReport';

const clientPatterns = [
  { name: "Mind In Distress", code: "DIS" },
  { name: "High Gear", code: "HYP" },
  { name: "Anchored Anger", code: "ANG" },
  { name: "Burned Out", code: "BURN" },
  { name: "Time & Order", code: "ORG" },
  { name: "Scattered Focus", code: "FOC" },
  { name: "Self-Harm Tendency", code: "SHT" },
  { name: "Stuck State", code: "TRAP" },
  { name: "Impulse Driver", code: "IMP" },
  { name: "Attitude", code: "RES" },
  { name: "Addictive Loops", code: "CPL" },
  { name: "Negative Projection", code: "NEGP" },
  { name: "Not Understanding", code: "NUH" },
  { name: "Dogma", code: "DOG" },
  { name: "Inside Out", code: "INFL" },
  { name: "Victim Loops", code: "BULLY" },
  { name: "Lack State", code: "LACK" },
  { name: "Dim Reality", code: "DIM" },
  { name: "Inward Focus", code: "INWF" },
  { name: "Deceiver", code: "DEC" }
];

function generateTestScores(): PatternScore[] {
  const totalQuestions = 344;
  const pattern = [2, 3, 4];
  const answers: Record<number, number> = {};

  for (let i = 1; i <= totalQuestions; i++) {
    const patternIndex = (i - 1) % 3;
    answers[i] = pattern[patternIndex];
  }

  const scores = clientPatterns.map((p, index) => {
    const relevantAnswers: number[] = [];
    for (let qId = 1; qId <= totalQuestions; qId++) {
      if ((qId - 1) % 20 === index) {
        relevantAnswers.push(answers[qId]);
      }
    }

    const avgScore = relevantAnswers.reduce((a, b) => a + b, 0) / relevantAnswers.length;
    const percentage = Math.round((avgScore / 5) * 100);

    const severity = percentage >= 60 ? 'High' : percentage >= 40 ? 'Medium' : 'Low';
    const color = percentage >= 60 ? 'red' : percentage >= 40 ? 'yellow' : 'blue';

    return {
      code: p.code,
      name: p.name,
      score: percentage,
      severity,
      color,
      questionCount: relevantAnswers.length,
      rawAverage: avgScore.toFixed(2)
    } as PatternScore;
  });

  return scores.sort((a, b) => b.score - a.score);
}

const patternDescriptions: Record<string, { description: string, clinicalSignificance: string, observedBehaviors: string[], neurologicalImpact: string, recommendations: string[] }> = {
  DIS: {
    description: "Neural pattern indicating persistent mental distress and cognitive overwhelm",
    clinicalSignificance: "Moderate presence suggests ongoing mental strain that may impact daily functioning and emotional regulation",
    observedBehaviors: [
      "Frequent expressions of feeling overwhelmed",
      "Difficulty managing stress responses",
      "Signs of mental fatigue or cognitive overload",
      "Heightened emotional reactivity"
    ],
    neurologicalImpact: "Affects prefrontal cortex functioning, potentially impairing executive function and emotional regulation",
    recommendations: [
      "Implement daily stress-reduction practices",
      "Develop cognitive coping strategies",
      "Consider mindfulness-based interventions",
      "Monitor for escalation requiring professional mental health support"
    ]
  },
  HYP: {
    description: "Pattern reflecting hyperactive neural processing and elevated arousal states",
    clinicalSignificance: "Indicates sustained high-energy state that may lead to burnout if not properly managed",
    observedBehaviors: [
      "Restlessness and difficulty with stillness",
      "Rapid speech or thought patterns",
      "Difficulty with downtime or relaxation",
      "High activity levels throughout the day"
    ],
    neurologicalImpact: "Involves overactivation of arousal systems, potentially affecting sleep quality and sustained attention",
    recommendations: [
      "Establish structured relaxation periods",
      "Practice grounding techniques",
      "Create calming environmental supports",
      "Develop healthy energy channeling activities"
    ]
  },
  FOC: {
    description: "Neural imprint showing challenges with attention maintenance and mental clarity",
    clinicalSignificance: "Moderate severity indicates noticeable impact on task completion and information processing",
    observedBehaviors: [
      "Difficulty maintaining attention on single tasks",
      "Frequent mental wandering",
      "Challenges with task organization",
      "Easy distractibility in various settings"
    ],
    neurologicalImpact: "Associated with attention network irregularities, affecting working memory and sustained focus",
    recommendations: [
      "Implement environmental modifications to reduce distractions",
      "Use attention-building exercises",
      "Break tasks into smaller, manageable segments",
      "Consider evaluation for attention-related conditions"
    ]
  }
};

const scores = generateTestScores();

const highPatterns: PatternDetail[] = scores
  .filter(s => s.score >= 60)
  .map(s => ({
    code: s.code,
    name: s.name,
    score: s.score,
    ...patternDescriptions[s.code] || {
      description: `Neural pattern ${s.name} showing elevated presence`,
      clinicalSignificance: "Requires monitoring and targeted intervention strategies",
      observedBehaviors: ["Pattern-specific behaviors observed during assessment"],
      neurologicalImpact: "Impacts neural processing in specific cognitive and emotional domains",
      recommendations: ["Develop targeted coping strategies", "Monitor progress regularly", "Implement evidence-based interventions"]
    }
  }));

const mediumPatterns: PatternDetail[] = scores
  .filter(s => s.score >= 40 && s.score < 60)
  .map(s => ({
    code: s.code,
    name: s.name,
    score: s.score,
    ...patternDescriptions[s.code] || {
      description: `Neural pattern ${s.name} present at moderate levels`,
      clinicalSignificance: "Warrants attention and proactive management",
      observedBehaviors: ["Moderate expression of pattern-related behaviors"],
      neurologicalImpact: "May affect specific cognitive or emotional processing areas",
      recommendations: ["Preventive strategies to avoid escalation", "Build resilience in affected areas"]
    }
  }));

const lowPatterns: PatternDetail[] = scores
  .filter(s => s.score < 40)
  .map(s => ({
    code: s.code,
    name: s.name,
    score: s.score,
    description: `Neural pattern ${s.name} showing minimal presence`,
    clinicalSignificance: "Low severity - not a primary concern at this time",
    observedBehaviors: ["Minimal pattern expression"],
    neurologicalImpact: "Limited impact on current functioning",
    recommendations: ["Continue monitoring", "Maintain current positive strategies"]
  }));

export const sampleCoachData: CoachReportData = {
  client: {
    name: "Test Client (Simulated Data)",
    age: 16,
    assessmentType: "NIPA - Full Neural Imprint Assessment",
    practitionerName: "Dr. Jane Smith",
    practitionerId: "NIP-12345"
  },
  assessmentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  profileOverview: "This comprehensive assessment reveals a complex neural imprint profile with multiple patterns operating at moderate levels. The test simulation uses a repeating pattern (2, 3, 4 on a 5-point scale) across all 344 questions, resulting in uniform 60% scores across all 20 neural imprint patterns. This controlled data demonstrates the report structure and scoring methodology.",
  keyStrengths: [
    "Demonstrates awareness of internal states",
    "Willing to engage in assessment process",
    "Shows capacity for self-reflection",
    "Maintains consistent response patterns"
  ],
  primaryConcerns: [
    {
      pattern: "All 20 Patterns",
      description: "Test data shows uniform moderate-level activation across all neural imprint patterns at 60%"
    }
  ],
  criticalFindings: [
    "This is simulated test data using pattern 2-3-4 repeating",
    "All patterns score at 60% (moderate level) by design",
    "Real client data would show varied scores reflecting individual neural imprint profile"
  ],
  scores,
  patterns: {
    high: highPatterns,
    medium: mediumPatterns,
    low: lowPatterns
  },
  actionPlan: [
    {
      phase: "Phase 1: Foundation",
      timeframe: "Months 1-2",
      focus: [
        "Establish baseline functioning",
        "Build rapport and trust",
        "Introduce core concepts"
      ],
      goals: [
        "Complete comprehensive intake",
        "Identify immediate support needs",
        "Establish regular session schedule"
      ],
      activities: [
        "Weekly coaching sessions",
        "Pattern awareness exercises",
        "Basic self-regulation techniques"
      ],
      successIndicators: [
        "Consistent session attendance",
        "Increased pattern awareness",
        "Initial coping strategy implementation"
      ]
    },
    {
      phase: "Phase 2: Development",
      timeframe: "Months 3-4",
      focus: [
        "Deepen pattern understanding",
        "Develop targeted interventions",
        "Build skills toolkit"
      ],
      goals: [
        "Address top 3 priority patterns",
        "Implement daily practice routines",
        "Strengthen support systems"
      ],
      activities: [
        "Pattern-specific exercises",
        "Skills training sessions",
        "Environmental modifications"
      ],
      successIndicators: [
        "Measurable pattern score improvements",
        "Consistent application of strategies",
        "Reduced symptom frequency"
      ]
    },
    {
      phase: "Phase 3: Integration",
      timeframe: "Months 5-6",
      focus: [
        "Consolidate gains",
        "Develop long-term strategies",
        "Prepare for maintenance phase"
      ],
      goals: [
        "Independent strategy application",
        "Sustained pattern improvements",
        "Establish ongoing support plan"
      ],
      activities: [
        "Progress review sessions",
        "Relapse prevention planning",
        "Transition preparation"
      ],
      successIndicators: [
        "Sustained improvements across multiple patterns",
        "Self-directed strategy use",
        "Clear maintenance plan in place"
      ]
    }
  ],
  resources: [
    {
      category: "Educational Materials",
      icon: "📚",
      resources: [
        {
          title: "Understanding Neural Imprints",
          description: "Comprehensive guide to neural imprint patterns and their impact",
          type: "PDF Guide"
        },
        {
          title: "Pattern Recognition Workbook",
          description: "Interactive exercises for identifying and tracking patterns",
          type: "Workbook"
        }
      ]
    },
    {
      category: "Support Services",
      icon: "🤝",
      resources: [
        {
          title: "Weekly Coaching Sessions",
          description: "One-on-one support with certified Neural Imprint practitioner",
          type: "Service"
        },
        {
          title: "24/7 Crisis Support",
          description: "Emergency contact line for urgent situations",
          type: "Hotline"
        }
      ]
    },
    {
      category: "Digital Tools",
      icon: "📱",
      resources: [
        {
          title: "Pattern Tracking App",
          description: "Mobile application for daily pattern monitoring",
          type: "App"
        },
        {
          title: "Online Portal",
          description: "Access progress reports, resources, and session scheduling",
          type: "Web Platform"
        }
      ]
    }
  ],
  progressTracking: {
    reviewSchedule: [
      "Initial: Baseline assessment completed",
      "30 days: Progress check-in",
      "60 days: Mid-point evaluation",
      "90 days: Comprehensive re-assessment",
      "180 days: Final evaluation and maintenance planning"
    ],
    metrics: [
      {
        metric: "Pattern Intensity Scores",
        baseline: "All patterns at 60% (test data)",
        target: "Reduce high-priority patterns by 20-30%",
        frequency: "Monthly assessment"
      },
      {
        metric: "Functional Impairment",
        baseline: "To be established from intake",
        target: "Measurable improvement in daily functioning",
        frequency: "Bi-weekly tracking"
      },
      {
        metric: "Coping Strategy Use",
        baseline: "Limited current strategies",
        target: "Consistent daily application of 3-5 core strategies",
        frequency: "Weekly monitoring"
      }
    ],
    trackingTools: [
      "Daily pattern journal",
      "Weekly check-in questionnaire",
      "Monthly progress assessment",
      "Session notes and observations"
    ]
  },
  clinicalNotes: [
    {
      date: new Date().toLocaleDateString(),
      practitioner: "Dr. Jane Smith, NIP-12345",
      observation: "Initial assessment completed using standardized NIPA protocol. Client engaged cooperatively throughout 344-question assessment. Test data shows uniform pattern (2-3-4 repeating) for demonstration purposes.",
      recommendation: "For actual client implementation: Complete comprehensive clinical interview to contextualize assessment results. Develop individualized intervention plan based on highest-priority patterns and client goals."
    }
  ],
  summary: {
    overallPrognosis: "This simulated assessment demonstrates the comprehensive nature of the NIPA evaluation system. With real client data, prognosis would be determined by specific pattern combinations, severity levels, client resources, and support systems. The structured approach provides clear pathways for intervention and progress monitoring.",
    keyTakeaways: [
      "Test data shows uniform 60% scoring across all 20 patterns",
      "Real assessments produce individualized profiles with varied pattern intensities",
      "The NIPA system provides detailed insights for targeted intervention planning",
      "Comprehensive support framework addresses multiple levels of functioning"
    ],
    priorityActions: [
      "Review full assessment results with practitioner",
      "Develop personalized intervention plan",
      "Begin Phase 1 foundation activities",
      "Establish regular session schedule"
    ],
    nextSteps: [
      {
        action: "Schedule debrief session",
        timeline: "Within 1 week"
      },
      {
        action: "Begin Phase 1 interventions",
        timeline: "Weeks 1-8"
      },
      {
        action: "First progress review",
        timeline: "30 days"
      },
      {
        action: "Comprehensive re-assessment",
        timeline: "90 days"
      }
    ],
    emergencyContacts: [
      {
        name: "Crisis Support Line",
        phone: "1-800-273-8255",
        availability: "24/7"
      },
      {
        name: "Practice Emergency Line",
        phone: "555-0100",
        availability: "24/7"
      },
      {
        name: "Practitioner Direct",
        phone: "555-0123",
        availability: "Mon-Fri 9AM-5PM"
      }
    ]
  }
};
