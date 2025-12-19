export interface ADHDQuestion {
  id: number;
  category: string;
  text: string;
  respondentTypes: ('parent' | 'caregiver')[];
}

export const ADHD_CATEGORIES = {
  INATTENTION: 'Inattention',
  HYPERACTIVITY: 'Hyperactivity',
  IMPULSIVITY: 'Impulsivity',
  EXECUTIVE_FUNCTION: 'Executive Function',
  EMOTIONAL_REGULATION: 'Emotional Regulation',
  SOCIAL_SKILLS: 'Social Skills',
  ACADEMIC_PERFORMANCE: 'Academic Performance',
  DAILY_FUNCTIONING: 'Daily Functioning'
};

export const ADHD_QUESTIONS: ADHDQuestion[] = [
  {
    id: 1,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Has difficulty sustaining attention in tasks or play activities',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 2,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Does not seem to listen when spoken to directly',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 3,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Fails to give close attention to details or makes careless mistakes',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 4,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Has trouble organizing tasks and activities',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 5,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Avoids tasks that require sustained mental effort',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 6,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Loses things necessary for tasks or activities',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 7,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Is easily distracted by external stimuli',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 8,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Is forgetful in daily activities',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 9,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Does not follow through on instructions and fails to finish work',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 10,
    category: ADHD_CATEGORIES.HYPERACTIVITY,
    text: 'Fidgets with hands or feet or squirms in seat',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 11,
    category: ADHD_CATEGORIES.HYPERACTIVITY,
    text: 'Leaves seat when remaining seated is expected',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 12,
    category: ADHD_CATEGORIES.HYPERACTIVITY,
    text: 'Runs or climbs excessively in inappropriate situations',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 13,
    category: ADHD_CATEGORIES.HYPERACTIVITY,
    text: 'Has difficulty playing or engaging in leisure activities quietly',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 14,
    category: ADHD_CATEGORIES.HYPERACTIVITY,
    text: 'Is "on the go" or acts as if "driven by a motor"',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 15,
    category: ADHD_CATEGORIES.HYPERACTIVITY,
    text: 'Talks excessively',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 16,
    category: ADHD_CATEGORIES.IMPULSIVITY,
    text: 'Blurts out answers before questions have been completed',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 17,
    category: ADHD_CATEGORIES.IMPULSIVITY,
    text: 'Has difficulty waiting their turn',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 18,
    category: ADHD_CATEGORIES.IMPULSIVITY,
    text: 'Interrupts or intrudes on others',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 19,
    category: ADHD_CATEGORIES.IMPULSIVITY,
    text: 'Acts without thinking about consequences',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 20,
    category: ADHD_CATEGORIES.IMPULSIVITY,
    text: 'Has difficulty controlling emotions or reactions',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 21,
    category: ADHD_CATEGORIES.EXECUTIVE_FUNCTION,
    text: 'Has trouble planning and organizing activities',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 22,
    category: ADHD_CATEGORIES.EXECUTIVE_FUNCTION,
    text: 'Struggles with time management',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 23,
    category: ADHD_CATEGORIES.EXECUTIVE_FUNCTION,
    text: 'Has difficulty prioritizing tasks',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 24,
    category: ADHD_CATEGORIES.EXECUTIVE_FUNCTION,
    text: 'Struggles to shift between tasks or activities',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 25,
    category: ADHD_CATEGORIES.EXECUTIVE_FUNCTION,
    text: 'Has trouble working memory (remembering instructions while doing tasks)',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 26,
    category: ADHD_CATEGORIES.EMOTIONAL_REGULATION,
    text: 'Has frequent mood swings',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 27,
    category: ADHD_CATEGORIES.EMOTIONAL_REGULATION,
    text: 'Becomes easily frustrated',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 28,
    category: ADHD_CATEGORIES.EMOTIONAL_REGULATION,
    text: 'Has difficulty calming down when upset',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 29,
    category: ADHD_CATEGORIES.EMOTIONAL_REGULATION,
    text: 'Overreacts to minor situations',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 30,
    category: ADHD_CATEGORIES.EMOTIONAL_REGULATION,
    text: 'Shows low frustration tolerance',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 31,
    category: ADHD_CATEGORIES.SOCIAL_SKILLS,
    text: 'Has difficulty maintaining friendships',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 32,
    category: ADHD_CATEGORIES.SOCIAL_SKILLS,
    text: 'Misses social cues',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 33,
    category: ADHD_CATEGORIES.SOCIAL_SKILLS,
    text: 'Dominates conversations or activities',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 34,
    category: ADHD_CATEGORIES.SOCIAL_SKILLS,
    text: 'Has trouble sharing or taking turns',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 35,
    category: ADHD_CATEGORIES.SOCIAL_SKILLS,
    text: 'Struggles with peer relationships',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 36,
    category: ADHD_CATEGORIES.ACADEMIC_PERFORMANCE,
    text: 'Performs below potential in school',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 37,
    category: ADHD_CATEGORIES.ACADEMIC_PERFORMANCE,
    text: 'Has incomplete or missing homework',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 38,
    category: ADHD_CATEGORIES.ACADEMIC_PERFORMANCE,
    text: 'Makes careless errors on tests or assignments',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 39,
    category: ADHD_CATEGORIES.ACADEMIC_PERFORMANCE,
    text: 'Has difficulty following multi-step directions',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 40,
    category: ADHD_CATEGORIES.ACADEMIC_PERFORMANCE,
    text: 'Struggles with reading comprehension or retention',
    respondentTypes: ['parent', 'caregiver']
  },
  {
    id: 41,
    category: ADHD_CATEGORIES.DAILY_FUNCTIONING,
    text: 'Has difficulty with morning routines',
    respondentTypes: ['parent']
  },
  {
    id: 42,
    category: ADHD_CATEGORIES.DAILY_FUNCTIONING,
    text: 'Struggles with bedtime routines',
    respondentTypes: ['parent']
  },
  {
    id: 43,
    category: ADHD_CATEGORIES.DAILY_FUNCTIONING,
    text: 'Has trouble completing chores or responsibilities',
    respondentTypes: ['parent']
  },
  {
    id: 44,
    category: ADHD_CATEGORIES.DAILY_FUNCTIONING,
    text: 'Requires constant reminders for daily tasks',
    respondentTypes: ['parent']
  },
  {
    id: 45,
    category: ADHD_CATEGORIES.DAILY_FUNCTIONING,
    text: 'Has difficulty managing personal belongings',
    respondentTypes: ['parent']
  },
  {
    id: 46,
    category: ADHD_CATEGORIES.ACADEMIC_PERFORMANCE,
    text: 'Needs frequent redirection during lessons',
    respondentTypes: ['caregiver']
  },
  {
    id: 47,
    category: ADHD_CATEGORIES.ACADEMIC_PERFORMANCE,
    text: 'Struggles to stay on task during independent work',
    respondentTypes: ['caregiver']
  },
  {
    id: 48,
    category: ADHD_CATEGORIES.SOCIAL_SKILLS,
    text: 'Has conflicts with classmates',
    respondentTypes: ['caregiver']
  },
  {
    id: 49,
    category: ADHD_CATEGORIES.HYPERACTIVITY,
    text: 'Cannot sit still during circle time or group activities',
    respondentTypes: ['caregiver']
  },
  {
    id: 50,
    category: ADHD_CATEGORIES.INATTENTION,
    text: 'Daydreams or seems to be in their own world',
    respondentTypes: ['caregiver']
  }
];

export const RESPONSE_OPTIONS = [
  { value: 0, label: 'Never', score: 0 },
  { value: 1, label: 'Rarely', score: 1 },
  { value: 2, label: 'Sometimes', score: 2 },
  { value: 3, label: 'Often', score: 3 },
  { value: 4, label: 'Very Often', score: 4 }
];

export const RELATIONSHIP_OPTIONS = {
  parent: [
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'guardian', label: 'Legal Guardian' },
    { value: 'stepparent', label: 'Step-parent' },
    { value: 'other_parent', label: 'Other Caregiver' }
  ],
  caregiver: [
    { value: 'teacher', label: 'Teacher' },
    { value: 'counselor', label: 'School Counselor' },
    { value: 'aide', label: 'Teaching Aide' },
    { value: 'coach', label: 'Coach' },
    { value: 'therapist', label: 'Therapist' },
    { value: 'daycare_provider', label: 'Daycare Provider' },
    { value: 'other_caregiver', label: 'Other Caregiver' }
  ]
};

export function getQuestionsForRespondent(respondentType: 'parent' | 'caregiver'): ADHDQuestion[] {
  return ADHD_QUESTIONS.filter(q => q.respondentTypes.includes(respondentType));
}

export function calculateCategoryScores(responses: Record<number, number>, respondentType: 'parent' | 'caregiver') {
  const questions = getQuestionsForRespondent(respondentType);
  const categoryScores: Record<string, { score: number; maxScore: number; percentage: number; count: number }> = {};

  Object.values(ADHD_CATEGORIES).forEach(category => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const score = categoryQuestions.reduce((sum, q) => sum + (responses[q.id] || 0), 0);
    const maxScore = categoryQuestions.length * 4;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    if (categoryQuestions.length > 0) {
      categoryScores[category] = {
        score,
        maxScore,
        percentage,
        count: categoryQuestions.length
      };
    }
  });

  return categoryScores;
}

export function calculateOverallScore(responses: Record<number, number>, respondentType: 'parent' | 'caregiver') {
  const questions = getQuestionsForRespondent(respondentType);
  const totalScore = questions.reduce((sum, q) => sum + (responses[q.id] || 0), 0);
  const maxScore = questions.length * 4;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalScore,
    maxScore,
    percentage,
    questionCount: questions.length
  };
}

export function getSeverityLevel(percentage: number): 'low' | 'moderate' | 'high' | 'severe' {
  if (percentage < 25) return 'low';
  if (percentage < 50) return 'moderate';
  if (percentage < 75) return 'high';
  return 'severe';
}

export function getSeverityColor(severity: 'low' | 'moderate' | 'high' | 'severe'): string {
  const colors = {
    low: '#10b981',
    moderate: '#f59e0b',
    high: '#ef4444',
    severe: '#991b1b'
  };
  return colors[severity];
}
