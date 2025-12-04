import { SelfAssessmentType } from '../data/selfAssessmentQuestions';

export interface NeuralImprintScore {
  code: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  severity: 'low' | 'moderate' | 'high';
  itemCount: number;
}

export interface DomainScore {
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  itemCount: number;
}

export interface SelfAssessmentAnalysis {
  neuralImprints: NeuralImprintScore[];
  domains?: DomainScore[];
  topImprints: NeuralImprintScore[];
  lowestImprints: NeuralImprintScore[];
  recommendations: string[];
  overallScore: number;
}

const NEURAL_IMPRINT_NAMES: Record<string, string> = {
  'DIS': 'Dissociation',
  'ANG': 'Emotional Anger',
  'SHT': 'Shattered Worth',
  'LACK': 'Lack',
  'NEG': 'Unmet Needs',
  'BURN': 'Burned Out',
  'DEC': 'Deceiver',
  'INFLUENCE': 'External Influence',
  'TRAP': 'Trapped Environment',
  'HOS': 'Heartless',
  'VICTIM': 'Victim Mentality',
  'LEFT/RIGHT': 'Brain Balance',
  'CPL': 'Compulsive Patterns',
  'RES': 'Resistance',
  'NAR': 'Narcissism',
  'DOG': 'Dogmatic Thinking'
};

export function calculateSelfAssessmentScores(
  assessmentType: SelfAssessmentType,
  answers: Record<number, number>
): SelfAssessmentAnalysis {
  // Group answers by neural imprint
  const imprintScores = new Map<string, number[]>();
  const domainScores = new Map<string, number[]>();

  assessmentType.questions.forEach((question) => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      // Neural Imprint scoring
      if (!imprintScores.has(question.neuralImprint)) {
        imprintScores.set(question.neuralImprint, []);
      }
      imprintScores.get(question.neuralImprint)!.push(answer);

      // Domain scoring (if applicable)
      if (question.domain) {
        if (!domainScores.has(question.domain)) {
          domainScores.set(question.domain, []);
        }
        domainScores.get(question.domain)!.push(answer);
      }
    }
  });

  // Calculate Neural Imprint scores
  const neuralImprints: NeuralImprintScore[] = [];
  imprintScores.forEach((scores, code) => {
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxScore = scores.length * assessmentType.scale.max;
    const percentage = Math.round((totalScore / maxScore) * 100);

    let severity: 'low' | 'moderate' | 'high';
    if (percentage <= 40) severity = 'low';
    else if (percentage <= 70) severity = 'moderate';
    else severity = 'high';

    neuralImprints.push({
      code,
      name: NEURAL_IMPRINT_NAMES[code] || code,
      score: totalScore,
      maxScore,
      percentage,
      severity,
      itemCount: scores.length
    });
  });

  // Calculate Domain scores (if applicable)
  const domains: DomainScore[] = [];
  domainScores.forEach((scores, domain) => {
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxScore = scores.length * assessmentType.scale.max;
    const percentage = Math.round((totalScore / maxScore) * 100);

    domains.push({
      domain,
      score: totalScore,
      maxScore,
      percentage,
      itemCount: scores.length
    });
  });

  // Sort by percentage
  const sortedImprints = [...neuralImprints].sort((a, b) => b.percentage - a.percentage);
  const topImprints = sortedImprints.slice(0, 5);
  const lowestImprints = sortedImprints.slice(-5).reverse();

  // Calculate overall score
  const overallScore = Math.round(
    neuralImprints.reduce((sum, imp) => sum + imp.percentage, 0) / neuralImprints.length
  );

  // Generate recommendations based on top imprints
  const recommendations = generateRecommendations(topImprints, domains);

  return {
    neuralImprints: sortedImprints,
    domains: domains.length > 0 ? domains : undefined,
    topImprints,
    lowestImprints,
    recommendations,
    overallScore
  };
}

function generateRecommendations(
  topImprints: NeuralImprintScore[],
  domains: DomainScore[]
): string[] {
  const recommendations: string[] = [];

  // Recommendations based on top neural imprints
  topImprints.forEach((imprint) => {
    if (imprint.severity === 'high' || imprint.severity === 'moderate') {
      switch (imprint.code) {
        case 'BURN':
          recommendations.push('Prioritize rest and stress management. Consider setting clearer boundaries around work and personal time.');
          break;
        case 'DIS':
          recommendations.push('Seek professional support to address attention and focus challenges. Structured environments may be beneficial.');
          break;
        case 'RES':
          recommendations.push('Work on building flexibility and openness to change. Practice saying "yes" to new opportunities.');
          break;
        case 'CPL':
          recommendations.push('Develop healthier coping mechanisms and break compulsive patterns through mindfulness practices.');
          break;
        case 'SHT':
          recommendations.push('Focus on rebuilding self-worth through positive affirmations and professional counseling if needed.');
          break;
        case 'VICTIM':
          recommendations.push('Work on developing personal agency and taking ownership of choices and outcomes.');
          break;
        case 'DOG':
          recommendations.push('Practice open-mindedness and challenge rigid beliefs. Seek diverse perspectives.');
          break;
        case 'INFLUENCE':
          recommendations.push('Build internal locus of control. Focus on what you can control rather than external factors.');
          break;
        case 'LEFT/RIGHT':
          recommendations.push('Balance analytical thinking with creative intuition for well-rounded decision-making.');
          break;
        case 'NEG':
          recommendations.push('Address unmet emotional needs through therapy and building supportive relationships.');
          break;
      }
    }
  });

  // Domain-specific recommendations for career assessment
  if (domains.length > 0) {
    const sortedDomains = [...domains].sort((a, b) => b.percentage - a.percentage);
    const topDomains = sortedDomains.slice(0, 3);

    topDomains.forEach((domain) => {
      if (domain.domain.startsWith('Interest_')) {
        const interest = domain.domain.replace('Interest_', '');
        recommendations.push(`Strong interest in ${interest.toLowerCase()} areas - explore careers and studies aligned with this passion.`);
      } else if (domain.domain.startsWith('Env_')) {
        const env = domain.domain.replace('Env_', '');
        recommendations.push(`Consider work environments that match your preference for ${env.toLowerCase().replace('_', ' ')}.`);
      } else if (domain.domain.startsWith('Learn_')) {
        const learning = domain.domain.replace('Learn_', '');
        recommendations.push(`Your learning style favors ${learning.toLowerCase().replace('_', ' ')} - choose educational paths that support this.`);
      }
    });
  }

  return recommendations.slice(0, 6);
}
