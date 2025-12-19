export interface ADHD710Question {
  id: number;
  category: string;
  text: string;
}

export const ADHD710_CATEGORIES = {
  INATTENTION: 'Inattention',
  HYPERACTIVITY: 'Hyperactivity',
  IMPULSIVITY: 'Impulsivity',
  EXECUTIVE_FUNCTION: 'Executive Function',
  EMOTIONAL_REGULATION: 'Emotional Regulation',
  SOCIAL_SKILLS: 'Social Skills',
  ACADEMIC_PERFORMANCE: 'Academic Performance',
  DAILY_FUNCTIONING: 'Daily Functioning'
};

export const NIPP_PATTERNS = {
  FOC: { code: 'FOC', name: 'Scattered Focus', category: 'Core ADHD', description: 'Difficulty sustaining attention and focusing on tasks' },
  HYP: { code: 'HYP', name: 'High Gear', category: 'Core ADHD', description: 'Excessive physical activity and restlessness' },
  IMP: { code: 'IMP', name: 'Impulse Rush', category: 'Core ADHD', description: 'Acting without thinking and difficulty with self-control' },
  ORG: { code: 'ORG', name: 'Time & Order', category: 'Core ADHD', description: 'Challenges with organization and time management' },
  DIM: { code: 'DIM', name: 'Flexible Focus', category: 'Core ADHD', description: 'Inconsistent academic performance and mental fatigue' },
  ANG: { code: 'ANG', name: 'Anchored Anger', category: 'Emotional/Impact', description: 'Frequent emotional outbursts and frustration' },
  RES: { code: 'RES', name: 'Resistance / Attitude', category: 'Emotional/Impact', description: 'Oppositional behavior and resistance to routines' },
  INWF: { code: 'INWF', name: 'Inward Focus', category: 'Emotional/Impact', description: 'Withdrawal and negative self-perception' },
  BURN: { code: 'BURN', name: 'Burned Out', category: 'Emotional/Impact', description: 'Mental exhaustion and need for recovery time' },
  BULLY: { code: 'BULLY', name: 'Victim Loops', category: 'Emotional/Impact', description: 'Social difficulties and peer relationship challenges' }
};

// 80 questions - 10 per category
export const ADHD710_QUESTIONS: ADHD710Question[] = [
  // INATTENTION (10 questions)
  { id: 1, category: ADHD710_CATEGORIES.INATTENTION, text: 'Has trouble keeping attention on tasks or play activities' },
  { id: 2, category: ADHD710_CATEGORIES.INATTENTION, text: 'Doesn\'t seem to listen when spoken to directly' },
  { id: 3, category: ADHD710_CATEGORIES.INATTENTION, text: 'Doesn\'t follow through on instructions and fails to finish schoolwork' },
  { id: 4, category: ADHD710_CATEGORIES.INATTENTION, text: 'Has difficulty organizing tasks and activities' },
  { id: 5, category: ADHD710_CATEGORIES.INATTENTION, text: 'Avoids tasks that require sustained mental effort' },
  { id: 6, category: ADHD710_CATEGORIES.INATTENTION, text: 'Loses things necessary for tasks or activities' },
  { id: 7, category: ADHD710_CATEGORIES.INATTENTION, text: 'Is easily distracted by external stimuli' },
  { id: 8, category: ADHD710_CATEGORIES.INATTENTION, text: 'Is forgetful in daily activities' },
  { id: 9, category: ADHD710_CATEGORIES.INATTENTION, text: 'Makes careless mistakes in schoolwork' },
  { id: 10, category: ADHD710_CATEGORIES.INATTENTION, text: 'Has difficulty sustaining attention during lectures or reading' },

  // HYPERACTIVITY (10 questions)
  { id: 11, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Fidgets with hands or feet or squirms in seat' },
  { id: 12, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Leaves seat when remaining seated is expected' },
  { id: 13, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Runs about or climbs excessively in inappropriate situations' },
  { id: 14, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Has difficulty playing or engaging in leisure activities quietly' },
  { id: 15, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Is "on the go" or acts as if "driven by a motor"' },
  { id: 16, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Talks excessively' },
  { id: 17, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Has difficulty sitting still for meals' },
  { id: 18, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Seems restless or unable to relax' },
  { id: 19, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Has high energy levels that are hard to manage' },
  { id: 20, category: ADHD710_CATEGORIES.HYPERACTIVITY, text: 'Moves constantly even when trying to focus' },

  // IMPULSIVITY (10 questions)
  { id: 21, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Blurts out answers before questions have been completed' },
  { id: 22, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Has difficulty waiting their turn' },
  { id: 23, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Interrupts or intrudes on others' },
  { id: 24, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Acts without thinking about consequences' },
  { id: 25, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Has difficulty controlling impulses' },
  { id: 26, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Rushes through tasks without checking work' },
  { id: 27, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Makes quick decisions without considering alternatives' },
  { id: 28, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Has trouble stopping an activity when told to' },
  { id: 29, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Grabs things from others without asking' },
  { id: 30, category: ADHD710_CATEGORIES.IMPULSIVITY, text: 'Reacts immediately without pausing to think' },

  // EXECUTIVE_FUNCTION (10 questions)
  { id: 31, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Has difficulty planning ahead for tasks' },
  { id: 32, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Struggles to estimate how long tasks will take' },
  { id: 33, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Has trouble organizing belongings and materials' },
  { id: 34, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Forgets to bring home necessary materials' },
  { id: 35, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Has difficulty managing time effectively' },
  { id: 36, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Struggles with multi-step directions' },
  { id: 37, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Has messy backpack, desk, or room' },
  { id: 38, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Loses track of assignments or deadlines' },
  { id: 39, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Has difficulty prioritizing tasks' },
  { id: 40, category: ADHD710_CATEGORIES.EXECUTIVE_FUNCTION, text: 'Needs reminders to complete basic routines' },

  // EMOTIONAL_REGULATION (10 questions)
  { id: 41, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Has frequent angry outbursts' },
  { id: 42, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Gets frustrated easily with tasks' },
  { id: 43, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Has difficulty calming down once upset' },
  { id: 44, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Reacts intensely to small disappointments' },
  { id: 45, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Shows irritability or bad temper' },
  { id: 46, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Has meltdowns or tantrums' },
  { id: 47, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Struggles with transitions between activities' },
  { id: 48, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Gets anxious or worried frequently' },
  { id: 49, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Has negative thoughts about themselves' },
  { id: 50, category: ADHD710_CATEGORIES.EMOTIONAL_REGULATION, text: 'Feels ashamed or embarrassed often' },

  // SOCIAL_SKILLS (10 questions)
  { id: 51, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Has difficulty making or keeping friends' },
  { id: 52, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Experiences conflict with peers frequently' },
  { id: 53, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Is teased or bullied by other children' },
  { id: 54, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Feels left out or excluded by peers' },
  { id: 55, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Withdraws from social situations' },
  { id: 56, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Is overly sensitive to peer rejection' },
  { id: 57, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Has trouble reading social cues' },
  { id: 58, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Struggles with cooperative play' },
  { id: 59, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Reports feeling "different" from other kids' },
  { id: 60, category: ADHD710_CATEGORIES.SOCIAL_SKILLS, text: 'Avoids group activities or recess' },

  // ACADEMIC_PERFORMANCE (10 questions)
  { id: 61, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Starts assignments but doesn\'t finish them' },
  { id: 62, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Has inconsistent academic performance' },
  { id: 63, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Loses track during reading or listening' },
  { id: 64, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Performance varies greatly day to day' },
  { id: 65, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Struggles to keep up with classwork' },
  { id: 66, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Shows mental fatigue during homework' },
  { id: 67, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Gives up easily on difficult tasks' },
  { id: 68, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Has difficulty retaining information' },
  { id: 69, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Needs constant help with schoolwork' },
  { id: 70, category: ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE, text: 'Falls behind despite effort' },

  // DAILY_FUNCTIONING (10 questions)
  { id: 71, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Resists or argues about daily routines' },
  { id: 72, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Avoids or delays homework time' },
  { id: 73, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Pushes back against chores or responsibilities' },
  { id: 74, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Has difficulty with morning or bedtime routines' },
  { id: 75, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Complains about being overwhelmed' },
  { id: 76, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Seems tired or exhausted frequently' },
  { id: 77, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Has meltdowns after school' },
  { id: 78, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Needs excessive downtime to recover' },
  { id: 79, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Refuses to participate in family activities' },
  { id: 80, category: ADHD710_CATEGORIES.DAILY_FUNCTIONING, text: 'Shows oppositional behavior at home' }
];

export const RESPONSE_OPTIONS_710 = [
  { value: 1, label: 'Not at all true', score: 1 },
  { value: 2, label: 'Somewhat true', score: 2 },
  { value: 3, label: 'Mostly true', score: 3 },
  { value: 4, label: 'Completely true', score: 4 }
];

// Calculate category scores from responses
export function calculateCategoryScores710(responses: Record<number, number>) {
  const categoryScores: Record<string, number> = {};

  Object.values(ADHD710_CATEGORIES).forEach(category => {
    const categoryQuestions = ADHD710_QUESTIONS.filter(q => q.category === category);
    const scores = categoryQuestions.map(q => responses[q.id] || 0);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    categoryScores[category] = average;
  });

  return categoryScores;
}

// Calculate NIPP pattern scores from category scores
export function calculateNIPPScores(categoryScores: Record<string, number>) {
  return {
    FOC: categoryScores[ADHD710_CATEGORIES.INATTENTION],
    HYP: categoryScores[ADHD710_CATEGORIES.HYPERACTIVITY],
    IMP: categoryScores[ADHD710_CATEGORIES.IMPULSIVITY],
    ORG: categoryScores[ADHD710_CATEGORIES.EXECUTIVE_FUNCTION],
    DIM: categoryScores[ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE],
    ANG: categoryScores[ADHD710_CATEGORIES.EMOTIONAL_REGULATION],
    RES: categoryScores[ADHD710_CATEGORIES.DAILY_FUNCTIONING],
    INWF: (categoryScores[ADHD710_CATEGORIES.EMOTIONAL_REGULATION] + categoryScores[ADHD710_CATEGORIES.SOCIAL_SKILLS]) / 2,
    BURN: (categoryScores[ADHD710_CATEGORIES.ACADEMIC_PERFORMANCE] + categoryScores[ADHD710_CATEGORIES.DAILY_FUNCTIONING]) / 2,
    BULLY: categoryScores[ADHD710_CATEGORIES.SOCIAL_SKILLS]
  };
}

// Get severity label based on score (1-4 scale)
export function getSeverityLabel710(score: number): string {
  if (score < 1.5) return 'Low / Minimal';
  if (score < 2.5) return 'Mild / Occasional';
  if (score < 3.5) return 'Moderate';
  return 'High';
}

// Get severity color
export function getSeverityColor710(score: number): string {
  if (score < 1.5) return '#10b981'; // green
  if (score < 2.5) return '#f59e0b'; // yellow
  if (score < 3.5) return '#ef4444'; // orange
  return '#991b1b'; // red
}

// Convert score to percentage (1-4 scale to 0-100%)
export function scoreToPercentage(score: number): number {
  return Math.round(((score - 1) / 3) * 100);
}

// Get ADHD interpretation based on combined scores
export function getADHDInterpretation(nippScores: Record<string, number>) {
  const corePatterns = ['FOC', 'HYP', 'IMP', 'ORG', 'DIM'];
  const coreScores = corePatterns.map(p => nippScores[p]);
  const moderateOrHighCount = coreScores.filter(s => s >= 2.5).length;
  const avgCoreScore = coreScores.reduce((a, b) => a + b, 0) / coreScores.length;

  let interpretation = '';
  if (moderateOrHighCount >= 4 && avgCoreScore >= 3.0) {
    interpretation = 'Parent + teacher ratings show a strong ADHD-style pattern across several core domains (attention, organisation, activity level and impulse control). This is highly suggestive of clinically significant ADHD traits. A formal diagnostic assessment by a psychologist or psychiatrist is strongly recommended.';
  } else if (moderateOrHighCount >= 3 && avgCoreScore >= 2.5) {
    interpretation = 'Ratings indicate moderate ADHD-style patterns across multiple domains. Several areas show consistent elevation. A professional evaluation is recommended to determine if formal assessment is warranted.';
  } else if (moderateOrHighCount >= 2) {
    interpretation = 'Some ADHD-style patterns are present. Consider discussing these results with a qualified professional to determine appropriate support strategies.';
  } else {
    interpretation = 'Current ratings show limited ADHD-style patterns. Continue monitoring and provide support in areas showing mild elevation.';
  }

  return { moderateOrHighCount, avgCoreScore: avgCoreScore.toFixed(2), interpretation };
}
