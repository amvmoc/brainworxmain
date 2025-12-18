export interface SelfAssessmentQuestion {
  id: number;
  text: string;
  neuralImprint: string;
  domain?: string;
}

export interface SelfAssessmentType {
  id: string;
  name: string;
  description: string;
  instructions: string;
  disclaimer: string;
  questions: SelfAssessmentQuestion[];
  scale: {
    min: number;
    max: number;
    labels: string[];
  };
}

// Teen ADHD-Linked Neural Imprint Screener
export const teenADHDQuestions: SelfAssessmentQuestion[] = [
  { id: 1, text: "My mind often jumps from one thing to another when I'm supposed to be focusing.", neuralImprint: "DIS" },
  { id: 2, text: "I start listening to a teacher or parent, but my thoughts drift away quickly.", neuralImprint: "DIS" },
  { id: 3, text: "I forget what I was about to do, even when it was something important.", neuralImprint: "DIS" },
  { id: 4, text: "In class, it feels like my brain is full of noise and it's hard to hear the main point.", neuralImprint: "DIS" },
  { id: 5, text: "I make careless mistakes because I rush or don't notice small details.", neuralImprint: "DIS" },
  { id: 6, text: "I often realise I didn't hear instructions properly and feel lost afterwards.", neuralImprint: "DIS" },
  { id: 7, text: "I understand things better when I can see or do them, not just listen to words.", neuralImprint: "LEFT/RIGHT" },
  { id: 8, text: "I can focus really well on things I find interesting, but almost switch off for boring tasks.", neuralImprint: "LEFT/RIGHT" },
  { id: 9, text: "I get good ideas quickly, but struggle to explain them step-by-step.", neuralImprint: "LEFT/RIGHT" },
  { id: 10, text: "I often see creative or unusual solutions that others don't think of.", neuralImprint: "LEFT/RIGHT" },
  { id: 11, text: "Schoolwork drains my energy faster than it seems to drain other people's energy.", neuralImprint: "BURN" },
  { id: 12, text: "I feel mentally tired after trying to concentrate for a short time.", neuralImprint: "BURN" },
  { id: 13, text: "Keeping up with school, chores, and expectations feels exhausting for me.", neuralImprint: "BURN" },
  { id: 14, text: "I sometimes give up on tasks because my brain feels too tired to keep trying.", neuralImprint: "BURN" },
  { id: 15, text: "When I'm bored, I automatically reach for my phone, games, or social media.", neuralImprint: "CPL" },
  { id: 16, text: "I often lose track of time when I'm online or gaming.", neuralImprint: "CPL" },
  { id: 17, text: "Doing homework feels almost impossible when my favourite apps or games are nearby.", neuralImprint: "CPL" },
  { id: 18, text: "I use my phone or music to keep my brain busy, even when I should be resting.", neuralImprint: "CPL" },
  { id: 19, text: "People have called me lazy, even when I'm actually struggling to focus.", neuralImprint: "SHT" },
  { id: 20, text: "When I forget things or lose track, I feel like there's something wrong with me.", neuralImprint: "SHT" },
  { id: 21, text: "I feel embarrassed about how disorganised I can be.", neuralImprint: "SHT" },
  { id: 22, text: "I sometimes think I'm stupid because my marks don't show how hard I try.", neuralImprint: "SHT" },
  { id: 23, text: "I feel ashamed when adults compare me negatively to other learners.", neuralImprint: "SHT" },
  { id: 24, text: "I often hide how much I'm struggling because I don't want people to judge me.", neuralImprint: "SHT" },
  { id: 25, text: "I say things like 'I don't care' about school because it hurts to feel like I'm failing.", neuralImprint: "RES" },
  { id: 26, text: "When people tell me to just focus, I feel irritated or shut down.", neuralImprint: "RES" },
  { id: 27, text: "I sometimes give up before I start because I expect to mess it up anyway.", neuralImprint: "RES" },
  { id: 28, text: "Encouraging messages about working harder don't help, because it feels like I have already tried.", neuralImprint: "RES" },
  { id: 29, text: "I feel like teachers or adults don't understand how hard it is for me to pay attention.", neuralImprint: "VICTIM" },
  { id: 30, text: "I often get into trouble for behaviours I don't fully mean to do.", neuralImprint: "VICTIM" },
  { id: 31, text: "It feels like I'm punished more than others, even when we do similar things.", neuralImprint: "VICTIM" },
  { id: 32, text: "Sometimes I feel like no matter what I do, people only see my mistakes.", neuralImprint: "VICTIM" },
  { id: 33, text: "Part of me believes I can learn better ways to manage my attention and energy.", neuralImprint: "INFLUENCE" },
  { id: 34, text: "Another part of me feels like my brain is just wired wrong and can't be improved.", neuralImprint: "INFLUENCE" },
  { id: 35, text: "When I use small strategies (like lists or timers), things sometimes go better.", neuralImprint: "INFLUENCE" },
  { id: 36, text: "I feel stuck when adults expect me to change, but don't show me how.", neuralImprint: "INFLUENCE" },
  { id: 37, text: "At home or school, people focus more on my behaviour than on what might be behind it.", neuralImprint: "TRAP" },
  { id: 38, text: "In my world, there is little space to talk about how my brain works differently.", neuralImprint: "TRAP" },
  { id: 39, text: "I feel like the rules where I live or study don't leave room for people who think like me.", neuralImprint: "TRAP" },
  { id: 40, text: "Instead of support, I mostly receive lectures or punishment when I struggle to focus.", neuralImprint: "TRAP" },
  { id: 41, text: "Growing up, I was often called naughty, restless, or disruptive.", neuralImprint: "NEG" },
  { id: 42, text: "As a child, I was sometimes shouted at for things I now think were because I couldn't sit still.", neuralImprint: "NEG" },
  { id: 43, text: "Adults in my past rarely asked why I struggled; they mostly told me to behave.", neuralImprint: "NEG" },
  { id: 44, text: "I learnt early to hide my energy or ideas so I wouldn't get into trouble.", neuralImprint: "NEG" },
  { id: 45, text: "I get very frustrated with myself when I make the same mistakes again and again.", neuralImprint: "ANG" },
  { id: 46, text: "When I feel overwhelmed, I sometimes snap at people or storm off.", neuralImprint: "ANG" },
  { id: 47, text: "I act like everything is fine at school, even when inside I feel completely lost.", neuralImprint: "DEC" },
  { id: 48, text: "I sometimes pretend I didn't care about a test or task, just so people won't see I struggled.", neuralImprint: "DEC" }
];

export const teenADHDAssessment: SelfAssessmentType = {
  id: 'teen-adhd',
  name: 'Teen ADHD-Linked Neural Imprint Screener',
  description: 'This questionnaire helps you notice patterns in how your brain focuses, manages energy, handles emotions, and responds to school and life demands. It links your answers to Neural Imprint Patterns.',
  instructions: `How to answer:
• This is about YOU, not what others expect.
• There are no right or wrong answers.
• Answer honestly about how things are MOST of the time.
• Use the scale: 1 = Does not describe me at all, 4 = Describes me completely.`,
  disclaimer: 'This is NOT a diagnosis of ADHD. Only a qualified health professional (such as a psychologist, psychiatrist, or medical doctor) can diagnose ADHD. This tool is designed for self-reflection and coaching. It can highlight where you may benefit from support, strategies, or a professional assessment.',
  questions: teenADHDQuestions,
  scale: {
    min: 1,
    max: 4,
    labels: ['Does not describe me at all', 'Describes me a little', 'Describes me quite a lot', 'Describes me completely']
  }
};

// Teen Career & Future Direction Assessment
export const careerAssessment: SelfAssessmentType = {
  id: 'teen-career',
  name: 'Teen Career & Future Direction',
  description: 'This comprehensive assessment combines Neural Imprint Patterns, RIASEC career interests, and real workplace scenarios to give you a clear picture of where you fit and how you function best in study and work environments.',
  instructions: `How to answer:
• This is about YOU, not what others expect.
• There are no right or wrong answers.
• Answer honestly about how things are MOST of the time.
• Use the scale: 1 = Strongly Disagree, 5 = Strongly Agree.`,
  disclaimer: 'This is a self-reflection and coaching tool, not a clinical diagnostic instrument. It is designed to support personal growth, informed decision-making and guided conversations with qualified professionals, teachers, mentors and parents. For formal psychometric testing or psychological diagnosis, a registered psychologist should be consulted.',
  questions: [], // Questions are handled in CareerAssessment component
  scale: {
    min: 1,
    max: 5,
    labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  }
};

// 7-10 Year Old ADHD Screener (Parent & Teacher)
export const child710ADHDQuestions: SelfAssessmentQuestion[] = [
  // FOC - Scattered Focus (Parent perspective)
  { id: 1, text: "[AT HOME] My child has trouble staying focused on homework or chores without getting distracted.", neuralImprint: "FOC", domain: "parent" },
  { id: 2, text: "[AT HOME] My child starts one activity but quickly moves to something else before finishing.", neuralImprint: "FOC", domain: "parent" },
  { id: 3, text: "[AT HOME] My child often daydreams or seems 'somewhere else' when I'm talking to them.", neuralImprint: "FOC", domain: "parent" },
  { id: 4, text: "[AT HOME] My child makes careless mistakes in schoolwork because they rush or don't pay attention to details.", neuralImprint: "FOC", domain: "parent" },
  { id: 5, text: "[AT HOME] My child forgets instructions I've just given them.", neuralImprint: "FOC", domain: "parent" },

  // FOC - Scattered Focus (Teacher perspective)
  { id: 6, text: "[AT SCHOOL] My child has difficulty staying focused during lessons or class activities.", neuralImprint: "FOC", domain: "teacher" },
  { id: 7, text: "[AT SCHOOL] My child is easily distracted by things happening around them in class.", neuralImprint: "FOC", domain: "teacher" },
  { id: 8, text: "[AT SCHOOL] My child struggles to follow multi-step instructions.", neuralImprint: "FOC", domain: "teacher" },
  { id: 9, text: "[AT SCHOOL] My child's attention wanders during group work or independent tasks.", neuralImprint: "FOC", domain: "teacher" },
  { id: 10, text: "[AT SCHOOL] My child makes careless errors in their schoolwork.", neuralImprint: "FOC", domain: "teacher" },

  // HYP - High Gear (Parent perspective)
  { id: 11, text: "[AT HOME] My child is constantly on the go, as if 'driven by a motor'.", neuralImprint: "HYP", domain: "parent" },
  { id: 12, text: "[AT HOME] My child has difficulty sitting still during meals, homework, or quiet activities.", neuralImprint: "HYP", domain: "parent" },
  { id: 13, text: "[AT HOME] My child fidgets, squirms, or taps their hands or feet.", neuralImprint: "HYP", domain: "parent" },
  { id: 14, text: "[AT HOME] My child talks excessively.", neuralImprint: "HYP", domain: "parent" },
  { id: 15, text: "[AT HOME] My child finds it hard to play or do activities quietly.", neuralImprint: "HYP", domain: "parent" },

  // HYP - High Gear (Teacher perspective)
  { id: 16, text: "[AT SCHOOL] My child leaves their seat when they're expected to remain seated.", neuralImprint: "HYP", domain: "teacher" },
  { id: 17, text: "[AT SCHOOL] My child fidgets or moves constantly during class time.", neuralImprint: "HYP", domain: "teacher" },
  { id: 18, text: "[AT SCHOOL] My child runs or climbs in situations where it's inappropriate.", neuralImprint: "HYP", domain: "teacher" },
  { id: 19, text: "[AT SCHOOL] My child has difficulty waiting their turn or staying in line.", neuralImprint: "HYP", domain: "teacher" },
  { id: 20, text: "[AT SCHOOL] My child seems restless and unable to settle down.", neuralImprint: "HYP", domain: "teacher" },

  // IMP - Impulse Rush (Parent perspective)
  { id: 21, text: "[AT HOME] My child acts before thinking, often getting into trouble as a result.", neuralImprint: "IMP", domain: "parent" },
  { id: 22, text: "[AT HOME] My child blurts out answers before questions are finished.", neuralImprint: "IMP", domain: "parent" },
  { id: 23, text: "[AT HOME] My child interrupts conversations or activities.", neuralImprint: "IMP", domain: "parent" },
  { id: 24, text: "[AT HOME] My child has difficulty waiting for their turn in games or activities.", neuralImprint: "IMP", domain: "parent" },
  { id: 25, text: "[AT HOME] My child grabs things from others without asking.", neuralImprint: "IMP", domain: "parent" },

  // IMP - Impulse Rush (Teacher perspective)
  { id: 26, text: "[AT SCHOOL] My child calls out answers without raising their hand.", neuralImprint: "IMP", domain: "teacher" },
  { id: 27, text: "[AT SCHOOL] My child interrupts the teacher or other students.", neuralImprint: "IMP", domain: "teacher" },
  { id: 28, text: "[AT SCHOOL] My child has trouble waiting in line or taking turns.", neuralImprint: "IMP", domain: "teacher" },
  { id: 29, text: "[AT SCHOOL] My child acts impulsively without considering consequences.", neuralImprint: "IMP", domain: "teacher" },
  { id: 30, text: "[AT SCHOOL] My child intrudes on other children's games or activities.", neuralImprint: "IMP", domain: "teacher" },

  // ORG - Time & Order (Parent perspective)
  { id: 31, text: "[AT HOME] My child loses or misplaces homework, books, toys, or other belongings.", neuralImprint: "ORG", domain: "parent" },
  { id: 32, text: "[AT HOME] My child's room or workspace is very disorganised.", neuralImprint: "ORG", domain: "parent" },
  { id: 33, text: "[AT HOME] My child struggles to plan or organise tasks and activities.", neuralImprint: "ORG", domain: "parent" },
  { id: 34, text: "[AT HOME] My child has difficulty keeping track of time.", neuralImprint: "ORG", domain: "parent" },
  { id: 35, text: "[AT HOME] My child avoids or resists tasks that require sustained mental effort (like homework).", neuralImprint: "ORG", domain: "parent" },

  // ORG - Time & Order (Teacher perspective)
  { id: 36, text: "[AT SCHOOL] My child loses school supplies, assignments, or permission slips.", neuralImprint: "ORG", domain: "teacher" },
  { id: 37, text: "[AT SCHOOL] My child's desk or locker is very messy and disorganised.", neuralImprint: "ORG", domain: "teacher" },
  { id: 38, text: "[AT SCHOOL] My child has difficulty organising their schoolwork or following routines.", neuralImprint: "ORG", domain: "teacher" },
  { id: 39, text: "[AT SCHOOL] My child struggles to complete assignments on time.", neuralImprint: "ORG", domain: "teacher" },
  { id: 40, text: "[AT SCHOOL] My child appears forgetful in daily activities.", neuralImprint: "ORG", domain: "teacher" },

  // DIM - Flexible Focus (Parent perspective)
  { id: 41, text: "[AT HOME] My child hyperfocuses on activities they enjoy (games, TV, toys) but can't focus on required tasks.", neuralImprint: "DIM", domain: "parent" },
  { id: 42, text: "[AT HOME] My child has extreme difficulty switching from a preferred activity to something less interesting.", neuralImprint: "DIM", domain: "parent" },
  { id: 43, text: "[AT HOME] My child gets so absorbed in play that they don't hear me calling them.", neuralImprint: "DIM", domain: "parent" },
  { id: 44, text: "[AT HOME] My child can concentrate intensely on things they like but gives up quickly on homework.", neuralImprint: "DIM", domain: "parent" },
  { id: 45, text: "[AT HOME] My child becomes upset or resistant when asked to stop a preferred activity.", neuralImprint: "DIM", domain: "parent" },

  // DIM - Flexible Focus (Teacher perspective)
  { id: 46, text: "[AT SCHOOL] My child can focus well on subjects they enjoy but not on others.", neuralImprint: "DIM", domain: "teacher" },
  { id: 47, text: "[AT SCHOOL] My child has difficulty transitioning between activities or subjects.", neuralImprint: "DIM", domain: "teacher" },
  { id: 48, text: "[AT SCHOOL] My child gets 'stuck' on certain topics or activities.", neuralImprint: "DIM", domain: "teacher" },
  { id: 49, text: "[AT SCHOOL] My child shows very uneven academic performance across subjects.", neuralImprint: "DIM", domain: "teacher" },
  { id: 50, text: "[AT SCHOOL] My child resists changing from one task to another.", neuralImprint: "DIM", domain: "teacher" },

  // ANG - Anchored Anger (Parent perspective)
  { id: 51, text: "[AT HOME] My child has frequent temper outbursts or meltdowns.", neuralImprint: "ANG", domain: "parent" },
  { id: 52, text: "[AT HOME] My child gets very frustrated when things don't go their way.", neuralImprint: "ANG", domain: "parent" },
  { id: 53, text: "[AT HOME] My child has difficulty calming down once upset.", neuralImprint: "ANG", domain: "parent" },
  { id: 54, text: "[AT HOME] My child shows intense emotional reactions to minor problems.", neuralImprint: "ANG", domain: "parent" },
  { id: 55, text: "[AT HOME] My child becomes angry or defiant when corrected.", neuralImprint: "ANG", domain: "parent" },

  // ANG - Anchored Anger (Teacher perspective)
  { id: 56, text: "[AT SCHOOL] My child loses their temper easily in class.", neuralImprint: "ANG", domain: "teacher" },
  { id: 57, text: "[AT SCHOOL] My child has difficulty managing frustration during schoolwork.", neuralImprint: "ANG", domain: "teacher" },
  { id: 58, text: "[AT SCHOOL] My child reacts angrily to feedback or correction.", neuralImprint: "ANG", domain: "teacher" },
  { id: 59, text: "[AT SCHOOL] My child has emotional outbursts that disrupt the class.", neuralImprint: "ANG", domain: "teacher" },
  { id: 60, text: "[AT SCHOOL] My child argues or becomes defiant with adults.", neuralImprint: "ANG", domain: "teacher" },

  // RES - Resistance / Attitude (Parent perspective)
  { id: 61, text: "[AT HOME] My child argues or talks back when asked to do things.", neuralImprint: "RES", domain: "parent" },
  { id: 62, text: "[AT HOME] My child refuses to follow household rules or instructions.", neuralImprint: "RES", domain: "parent" },
  { id: 63, text: "[AT HOME] My child says 'no' or 'I don't want to' frequently.", neuralImprint: "RES", domain: "parent" },
  { id: 64, text: "[AT HOME] My child deliberately annoys others or tests boundaries.", neuralImprint: "RES", domain: "parent" },
  { id: 65, text: "[AT HOME] My child blames others for their mistakes or behavior.", neuralImprint: "RES", domain: "parent" },

  // RES - Resistance / Attitude (Teacher perspective)
  { id: 66, text: "[AT SCHOOL] My child actively defies teacher requests or school rules.", neuralImprint: "RES", domain: "teacher" },
  { id: 67, text: "[AT SCHOOL] My child argues or negotiates excessively about tasks.", neuralImprint: "RES", domain: "teacher" },
  { id: 68, text: "[AT SCHOOL] My child refuses to participate in class activities.", neuralImprint: "RES", domain: "teacher" },
  { id: 69, text: "[AT SCHOOL] My child shows a negative or defiant attitude.", neuralImprint: "RES", domain: "teacher" },
  { id: 70, text: "[AT SCHOOL] My child deliberately annoys classmates or the teacher.", neuralImprint: "RES", domain: "teacher" },

  // INWF - Inward Focus (Parent perspective)
  { id: 71, text: "[AT HOME] My child seems anxious or worried frequently.", neuralImprint: "INWF", domain: "parent" },
  { id: 72, text: "[AT HOME] My child withdraws or becomes quiet when stressed.", neuralImprint: "INWF", domain: "parent" },
  { id: 73, text: "[AT HOME] My child appears sad or down more often than their peers.", neuralImprint: "INWF", domain: "parent" },
  { id: 74, text: "[AT HOME] My child has low confidence or negative self-talk.", neuralImprint: "INWF", domain: "parent" },
  { id: 75, text: "[AT HOME] My child keeps feelings inside rather than expressing them.", neuralImprint: "INWF", domain: "parent" },

  // INWF - Inward Focus (Teacher perspective)
  { id: 76, text: "[AT SCHOOL] My child seems anxious or worried during school activities.", neuralImprint: "INWF", domain: "teacher" },
  { id: 77, text: "[AT SCHOOL] My child is withdrawn or doesn't participate socially.", neuralImprint: "INWF", domain: "teacher" },
  { id: 78, text: "[AT SCHOOL] My child appears sad, tearful, or emotionally sensitive.", neuralImprint: "INWF", domain: "teacher" },
  { id: 79, text: "[AT SCHOOL] My child shows signs of low self-esteem or self-confidence.", neuralImprint: "INWF", domain: "teacher" },
  { id: 80, text: "[AT SCHOOL] My child seems internalised or 'in their own world'.", neuralImprint: "INWF", domain: "teacher" },

  // BURN - Burned Out (Parent perspective)
  { id: 81, text: "[AT HOME] My child seems mentally or physically exhausted, especially after school.", neuralImprint: "BURN", domain: "parent" },
  { id: 82, text: "[AT HOME] My child complains about being tired or needing breaks constantly.", neuralImprint: "BURN", domain: "parent" },
  { id: 83, text: "[AT HOME] My child's energy seems drained by everyday tasks that others handle easily.", neuralImprint: "BURN", domain: "parent" },
  { id: 84, text: "[AT HOME] My child needs more downtime or sleep than other children their age.", neuralImprint: "BURN", domain: "parent" },
  { id: 85, text: "[AT HOME] My child seems overwhelmed by the demands of school and home life.", neuralImprint: "BURN", domain: "parent" },

  // BURN - Burned Out (Teacher perspective)
  { id: 86, text: "[AT SCHOOL] My child appears tired or low-energy during the school day.", neuralImprint: "BURN", domain: "teacher" },
  { id: 87, text: "[AT SCHOOL] My child's performance drops noticeably as the day progresses.", neuralImprint: "BURN", domain: "teacher" },
  { id: 88, text: "[AT SCHOOL] My child seems overwhelmed by schoolwork demands.", neuralImprint: "BURN", domain: "teacher" },
  { id: 89, text: "[AT SCHOOL] My child gives up easily or shows low persistence on tasks.", neuralImprint: "BURN", domain: "teacher" },
  { id: 90, text: "[AT SCHOOL] My child appears mentally exhausted or 'checked out'.", neuralImprint: "BURN", domain: "teacher" },

  // BULLY - Victim Loops (Parent perspective)
  { id: 91, text: "[AT HOME] My child reports being teased, excluded, or picked on by peers.", neuralImprint: "BULLY", domain: "parent" },
  { id: 92, text: "[AT HOME] My child seems to be targeted more than other children in social situations.", neuralImprint: "BULLY", domain: "parent" },
  { id: 93, text: "[AT HOME] My child feels like they don't fit in or are different from others.", neuralImprint: "BULLY", domain: "parent" },
  { id: 94, text: "[AT HOME] My child is reluctant to go to school or social events because of peer issues.", neuralImprint: "BULLY", domain: "parent" },
  { id: 95, text: "[AT HOME] My child talks about feeling left out or not having friends.", neuralImprint: "BULLY", domain: "parent" },

  // BULLY - Victim Loops (Teacher perspective)
  { id: 96, text: "[AT SCHOOL] My child is frequently teased or excluded by classmates.", neuralImprint: "BULLY", domain: "teacher" },
  { id: 97, text: "[AT SCHOOL] My child has difficulty making or keeping friends.", neuralImprint: "BULLY", domain: "teacher" },
  { id: 98, text: "[AT SCHOOL] My child is targeted by other children more than typical peer conflict.", neuralImprint: "BULLY", domain: "teacher" },
  { id: 99, text: "[AT SCHOOL] My child appears isolated or plays alone frequently.", neuralImprint: "BULLY", domain: "teacher" },
  { id: 100, text: "[AT SCHOOL] My child seems to attract negative attention from peers.", neuralImprint: "BULLY", domain: "teacher" }
];

export const child710ADHDAssessment: SelfAssessmentType = {
  id: 'child-adhd-7-10',
  name: 'Child Focus & Behaviour Screen (7–10 years)',
  description: 'This screening tool helps parents/caregivers and teachers observe ADHD-style patterns in children aged 7-10, covering attention, activity level, impulse control, emotional patterns, and social experiences at home and school.',
  instructions: `How to answer:
• This is about YOUR CHILD, based on your observations.
• Answer questions marked [AT HOME] based on home observations.
• Answer questions marked [AT SCHOOL] based on school observations (ask the teacher if needed).
• Think about how your child behaves MOST of the time, not just on their best or worst days.
• Use the scale: 1 = Never/Not at all, 4 = Very Often/Very Much.`,
  disclaimer: 'This is NOT a diagnosis of ADHD. Only a qualified health professional (such as a paediatrician, psychologist, or psychiatrist) can diagnose ADHD. This tool is designed for parent, caregiver, and teacher observation. It can highlight where a child may benefit from support, strategies, or a professional assessment.',
  questions: child710ADHDQuestions,
  scale: {
    min: 1,
    max: 4,
    labels: ['Never/Not at all', 'Sometimes/A little', 'Often/Quite a lot', 'Very Often/Very Much']
  }
};

// Export all assessment types
export const selfAssessmentTypes: SelfAssessmentType[] = [
  teenADHDAssessment,
  child710ADHDAssessment,
  careerAssessment
];
