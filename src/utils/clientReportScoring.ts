interface PatternData {
  score: number;
  code: string;
  description: string;
}

interface AssessmentResults {
  client: {
    name: string;
    date: string;
    totalQuestions: number;
  };
  patterns: Record<string, PatternData>;
}

const PATTERN_DEFINITIONS = [
  {
    name: "Mind In Distress",
    code: "DIS",
    description: "Experiencing significant anxiety, worry, and emotional distress. This pattern indicates high levels of mental distress that may benefit from professional support."
  },
  {
    name: "High Gear",
    code: "HYP",
    description: "Operating in constant overdrive with difficulty relaxing. This pattern suggests chronic hyperactivity and challenges with rest and recovery."
  },
  {
    name: "Anchored Anger",
    code: "ANG",
    description: "Carrying persistent unresolved anger or resentment. This pattern indicates deep-seated emotional issues that may need processing."
  },
  {
    name: "Burned Out",
    code: "BURN",
    description: "Experiencing emotional and physical exhaustion. This pattern suggests depletion of personal resources and need for recovery."
  },
  {
    name: "Time & Order",
    code: "ORG",
    description: "Struggling with organization and time management. This pattern indicates challenges with structure and planning."
  },
  {
    name: "Scattered Focus",
    code: "FOC",
    description: "Difficulty maintaining attention and concentration. This pattern suggests challenges with focus and mental clarity."
  },
  {
    name: "Self-Harm Tendency",
    code: "SHT",
    description: "Presence of self-destructive thoughts or behaviors. This pattern requires careful attention and professional support."
  },
  {
    name: "Stuck State",
    code: "TRAP",
    description: "Feeling trapped or unable to move forward. This pattern indicates a sense of being stuck in current circumstances."
  },
  {
    name: "Impulse Driver",
    code: "IMP",
    description: "Acting on impulses without full consideration. This pattern suggests challenges with impulse control."
  },
  {
    name: "Attitude",
    code: "RES",
    description: "Resistance to change or negative outlook. This pattern indicates oppositional tendencies."
  },
  {
    name: "Addictive Loops",
    code: "CPL",
    description: "Engaging in repetitive compulsive behaviors. This pattern suggests habitual patterns that may be difficult to break."
  },
  {
    name: "Negative Projection",
    code: "NEGP",
    description: "Tendency to project negative expectations onto situations. This pattern shows some pessimistic thinking."
  },
  {
    name: "Not Understanding",
    code: "NUH",
    description: "Difficulty comprehending situations or others' perspectives. Minimal presence of this pattern."
  },
  {
    name: "Dogma",
    code: "DOG",
    description: "Rigid thinking or inflexible beliefs. Low presence of this pattern indicates flexibility."
  },
  {
    name: "Inside Out",
    code: "INFL",
    description: "Self-focused perspective with limited external awareness. Minimal presence of this pattern."
  },
  {
    name: "Victim Loops",
    code: "BULLY",
    description: "Victim mentality or blaming external factors. Low presence indicates personal accountability."
  },
  {
    name: "Lack State",
    code: "LACK",
    description: "Perception of scarcity or insufficiency. Minimal presence of this pattern."
  },
  {
    name: "Dim Reality",
    code: "DIM",
    description: "Distorted perception of reality. Very low presence of this pattern."
  },
  {
    name: "Inward Focus",
    code: "INWF",
    description: "Excessive self-absorption. Very minimal presence indicates healthy balance."
  },
  {
    name: "Deceiver",
    code: "DEC",
    description: "Dishonesty or deceptive tendencies. Very low score indicates strong integrity."
  }
];

const getScoreFromAnswer = (answer: string): number => {
  const scoreMap: Record<string, number> = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
  };
  return scoreMap[answer] || 3;
};

export function generateClientReportData(
  customerName: string,
  answers: Record<string, string>,
  assessmentDate: Date,
  totalQuestions: number
): AssessmentResults {
  const patterns: Record<string, PatternData> = {};

  PATTERN_DEFINITIONS.forEach((pattern, index) => {
    const relevantAnswers = Object.entries(answers)
      .filter(([qId]) => parseInt(qId) % 20 === index)
      .map(([_, answer]) => getScoreFromAnswer(answer));

    const avgScore = relevantAnswers.length > 0
      ? relevantAnswers.reduce((a, b) => a + b, 0) / relevantAnswers.length
      : 3;

    const normalizedScore = Math.round((avgScore / 5) * 100);

    patterns[pattern.name] = {
      score: normalizedScore,
      code: pattern.code,
      description: pattern.description
    };
  });

  return {
    client: {
      name: customerName,
      date: assessmentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      totalQuestions
    },
    patterns
  };
}

export function getPatternDefinitions() {
  return PATTERN_DEFINITIONS;
}

export function generateClientReportFromAnalysis(
  customerName: string,
  analysisResults: any,
  assessmentDate: Date
): AssessmentResults {
  const patterns: Record<string, PatternData> = {};

  // Check if this is NIP3 results with neuralImprintPatternScores
  if (analysisResults?.neuralImprintPatternScores) {
    analysisResults.neuralImprintPatternScores.forEach((nip: any) => {
      // Find the pattern definition by code
      const patternDef = PATTERN_DEFINITIONS.find(p => p.code === nip.code);

      if (patternDef) {
        patterns[patternDef.name] = {
          score: Math.round(nip.score), // nip.score is already a percentage
          code: nip.code,
          description: patternDef.description
        };
      }
    });

    return {
      client: {
        name: customerName,
        date: assessmentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        totalQuestions: analysisResults.totalQuestions || 344
      },
      patterns
    };
  }

  // Fallback to empty patterns if no analysis results
  return {
    client: {
      name: customerName,
      date: assessmentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      totalQuestions: 0
    },
    patterns: {}
  };
}
