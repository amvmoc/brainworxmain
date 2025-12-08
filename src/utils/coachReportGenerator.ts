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

const patternDescriptions: Record<string, { description: string, clinicalSignificance: string, observedBehaviors: string[], neurologicalImpact: string, recommendations: string[] }> = {
  DIS: {
    description: "Neural pattern indicating persistent mental distress and cognitive overwhelm",
    clinicalSignificance: "Presence suggests ongoing mental strain that may impact daily functioning and emotional regulation",
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
    clinicalSignificance: "Impact on task completion and information processing",
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

function convertAnswerToNumber(answer: string): number {
  const answerLower = answer.toLowerCase();
  if (answerLower.includes('strongly agree')) return 5;
  if (answerLower.includes('agree')) return 4;
  if (answerLower.includes('neutral')) return 3;
  if (answerLower.includes('disagree') && !answerLower.includes('strongly')) return 2;
  if (answerLower.includes('strongly disagree')) return 1;
  return parseInt(answer) || 3;
}

export function generateCoachReportData(
  customerName: string,
  answers: Record<string, string>,
  completedAt: Date,
  totalQuestions: number
): CoachReportData {
  const scores: PatternScore[] = clientPatterns.map((p, index) => {
    const relevantAnswers: number[] = [];
    for (let qId = 1; qId <= totalQuestions; qId++) {
      if ((qId - 1) % 20 === index) {
        const answer = answers[qId.toString()];
        if (answer) {
          relevantAnswers.push(convertAnswerToNumber(answer));
        }
      }
    }

    const avgScore = relevantAnswers.length > 0
      ? relevantAnswers.reduce((a, b) => a + b, 0) / relevantAnswers.length
      : 0;
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

  scores.sort((a, b) => b.score - a.score);

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
      description: `Neural pattern ${s.name} showing low presence`,
      clinicalSignificance: "Within normal range, indicating relative strength in this area",
      observedBehaviors: ["Minimal expression of pattern-related challenges"],
      neurologicalImpact: "Functioning well in this neural processing area",
      recommendations: ["Maintain current positive patterns", "Leverage as strength in intervention planning"]
    }));

  const highCount = highPatterns.length;
  const mediumCount = mediumPatterns.length;

  return {
    client: {
      name: customerName,
      age: 0,
      assessmentType: "Neural Imprint Pattern Assessment (NIPA)",
      practitionerName: "BrainWorx Practitioner",
      practitionerId: "BWX-001"
    },
    assessmentDate: completedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    profileOverview: `This comprehensive assessment reveals ${highCount} high-priority patterns requiring immediate attention, ${mediumCount} moderate patterns warranting monitoring, and ${lowPatterns.length} areas of relative strength. The profile suggests a complex neural imprint landscape requiring tailored intervention strategies.`,
    keyStrengths: lowPatterns.slice(0, 3).map(p => p.name),
    primaryConcerns: highPatterns.map(p => ({
      pattern: p.name,
      description: p.clinicalSignificance
    })),
    criticalFindings: highPatterns.length > 0
      ? [`${highPatterns.length} patterns showing high severity`, "Requires comprehensive intervention plan", "Monitor closely for changes"]
      : ["No critical findings at this time"],
    scores,
    patterns: {
      high: highPatterns,
      medium: mediumPatterns,
      low: lowPatterns
    },
    actionPlan: [
      {
        phase: "Phase 1: Immediate Interventions",
        timeframe: "Weeks 1-4",
        focus: highPatterns.slice(0, 2).map(p => p.name),
        goals: [
          "Establish safety and stability",
          "Begin addressing highest-priority patterns",
          "Build therapeutic alliance"
        ],
        activities: [
          "Weekly coaching sessions",
          "Daily self-regulation practices",
          "Implement primary coping strategies"
        ],
        successIndicators: [
          "Reduced intensity of primary concerns",
          "Improved daily functioning",
          "Consistent engagement with interventions"
        ]
      },
      {
        phase: "Phase 2: Skills Building",
        timeframe: "Weeks 5-12",
        focus: [...highPatterns.slice(2), ...mediumPatterns.slice(0, 2)].map(p => p.name),
        goals: [
          "Develop comprehensive coping toolkit",
          "Address moderate-level patterns",
          "Strengthen resilience factors"
        ],
        activities: [
          "Bi-weekly coaching sessions",
          "Structured skill-building exercises",
          "Progress monitoring and adjustment"
        ],
        successIndicators: [
          "Consistent use of coping strategies",
          "Measurable improvement in target areas",
          "Increased self-awareness"
        ]
      }
    ],
    resources: [
      {
        category: "Self-Regulation Tools",
        icon: "🧠",
        resources: [
          {
            title: "Mindfulness Meditation Guide",
            description: "Daily practices for emotional regulation",
            type: "Practice Guide"
          },
          {
            title: "Breathing Techniques",
            description: "Quick interventions for stress management",
            type: "Technique Sheet"
          }
        ]
      },
      {
        category: "Educational Materials",
        icon: "📚",
        resources: [
          {
            title: "Understanding Neural Patterns",
            description: "Comprehensive guide to neural imprints",
            type: "Educational PDF"
          }
        ]
      }
    ],
    progressTracking: {
      reviewSchedule: [
        "2-week initial review",
        "Monthly progress assessments",
        "3-month comprehensive re-evaluation"
      ],
      metrics: [
        {
          metric: "Pattern Intensity",
          baseline: "Current scores as documented",
          target: "20% reduction in high-severity patterns",
          frequency: "Monthly"
        },
        {
          metric: "Daily Functioning",
          baseline: "Self-reported baseline",
          target: "Improved functioning in key areas",
          frequency: "Weekly"
        }
      ],
      trackingTools: [
        "Daily symptom log",
        "Weekly progress check-ins",
        "Standardized assessment tools"
      ]
    },
    clinicalNotes: [
      {
        date: completedAt.toLocaleDateString(),
        practitioner: "BrainWorx Practitioner",
        observation: "Initial assessment completed. Client engaged well with assessment process.",
        recommendation: "Begin Phase 1 interventions with focus on highest-priority patterns"
      }
    ],
    summary: {
      overallPrognosis: "With consistent intervention and engagement, significant improvement is expected. The presence of multiple strength areas provides good foundation for change.",
      keyTakeaways: [
        `${highCount} high-priority patterns identified requiring immediate attention`,
        `${mediumCount} moderate patterns for ongoing monitoring`,
        `Strong areas identified that can support intervention process`
      ],
      priorityActions: [
        "Implement Phase 1 action plan immediately",
        "Establish regular coaching schedule",
        "Begin daily self-regulation practices",
        "Schedule 2-week follow-up assessment"
      ],
      nextSteps: [
        {
          action: "Schedule initial coaching session",
          timeline: "Within 3-5 days"
        },
        {
          action: "Begin daily practices",
          timeline: "Immediately"
        },
        {
          action: "2-week progress review",
          timeline: "Week 2"
        }
      ],
      emergencyContacts: [
        {
          name: "Crisis Hotline",
          phone: "1-800-273-8255",
          availability: "24/7"
        }
      ]
    }
  };
}
