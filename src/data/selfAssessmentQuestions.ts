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

// Parent ADHD-Linked Neural Imprint Screener
export const parentADHDQuestions: SelfAssessmentQuestion[] = [
  { id: 1, text: "My child's mind often jumps from one thing to another when they are supposed to be focusing.", neuralImprint: "DIS" },
  { id: 2, text: "My child starts listening to a teacher or adult, but their attention drifts away quickly.", neuralImprint: "DIS" },
  { id: 3, text: "My child forgets what they were about to do, even when it was something important.", neuralImprint: "DIS" },
  { id: 4, text: "In class, my child seems mentally overloaded and struggles to pick up the main point.", neuralImprint: "DIS" },
  { id: 5, text: "My child makes careless mistakes because they rush or don't notice small details.", neuralImprint: "DIS" },
  { id: 6, text: "My child often realises they didn't hear instructions properly and feels lost afterwards.", neuralImprint: "DIS" },
  { id: 7, text: "My child understands things better when they can see or do them, not just listen to words.", neuralImprint: "LEFT/RIGHT" },
  { id: 8, text: "My child can focus very well on things they enjoy, but almost switches off for boring tasks.", neuralImprint: "LEFT/RIGHT" },
  { id: 9, text: "My child gets good ideas quickly but struggles to explain them step by step.", neuralImprint: "LEFT/RIGHT" },
  { id: 10, text: "My child often sees creative or unusual solutions that others don't think of.", neuralImprint: "LEFT/RIGHT" },
  { id: 11, text: "Schoolwork seems to drain my child's energy faster than it drains other learners' energy.", neuralImprint: "BURN" },
  { id: 12, text: "My child appears mentally tired after trying to concentrate for a short time.", neuralImprint: "BURN" },
  { id: 13, text: "Keeping up with school, chores, and expectations seems exhausting for my child.", neuralImprint: "BURN" },
  { id: 14, text: "My child sometimes gives up on tasks because they feel too mentally tired to keep trying.", neuralImprint: "BURN" },
  { id: 15, text: "When my child is bored, they automatically reach for their phone, games, or social media.", neuralImprint: "CPL" },
  { id: 16, text: "My child often loses track of time when they are online or gaming.", neuralImprint: "CPL" },
  { id: 17, text: "Doing homework seems almost impossible for my child when favourite apps or games are nearby.", neuralImprint: "CPL" },
  { id: 18, text: "My child uses their phone or music to keep their brain busy, even when they should be resting.", neuralImprint: "CPL" },
  { id: 19, text: "People have called my child lazy, even when they are actually struggling to focus.", neuralImprint: "SHT" },
  { id: 20, text: "When my child forgets things or loses track, they seem to feel that something is wrong with them.", neuralImprint: "SHT" },
  { id: 21, text: "My child appears embarrassed about how disorganised they can be.", neuralImprint: "SHT" },
  { id: 22, text: "My child sometimes says or behaves as if they are stupid because their marks don't show how hard they try.", neuralImprint: "SHT" },
  { id: 23, text: "My child seems ashamed when adults compare them negatively to other learners.", neuralImprint: "SHT" },
  { id: 24, text: "My child often hides how much they are struggling because they don't want people to judge them.", neuralImprint: "SHT" },
  { id: 25, text: "My child says things like 'I don't care' about school because it hurts to feel like they are failing.", neuralImprint: "RES" },
  { id: 26, text: "When people tell my child to just focus, they often become irritated or shut down.", neuralImprint: "RES" },
  { id: 27, text: "My child sometimes gives up before they start because they expect to mess it up anyway.", neuralImprint: "RES" },
  { id: 28, text: "Encouraging messages about working harder don't help my child because they feel they have already tried.", neuralImprint: "RES" },
  { id: 29, text: "My child feels that teachers or adults don't understand how hard it is for them to pay attention.", neuralImprint: "VICTIM" },
  { id: 30, text: "My child often gets into trouble for behaviours they don't fully mean to do.", neuralImprint: "VICTIM" },
  { id: 31, text: "It seems that my child is punished more than others, even when they do similar things.", neuralImprint: "VICTIM" },
  { id: 32, text: "My child feels that no matter what they do, people mainly see their mistakes.", neuralImprint: "VICTIM" },
  { id: 33, text: "My child shows signs that they can learn better ways to manage their attention and energy.", neuralImprint: "INFLUENCE" },
  { id: 34, text: "At times my child feels that their brain is simply wired wrong and cannot be improved.", neuralImprint: "INFLUENCE" },
  { id: 35, text: "When my child uses small strategies (like lists or timers), things sometimes go better for them.", neuralImprint: "INFLUENCE" },
  { id: 36, text: "My child feels stuck when adults expect them to change but don't show them how.", neuralImprint: "INFLUENCE" },
  { id: 37, text: "At home or school, people often focus more on my child's behaviour than on what might be behind it.", neuralImprint: "TRAP" },
  { id: 38, text: "In our world, there is little space for my child to talk about how their brain works differently.", neuralImprint: "TRAP" },
  { id: 39, text: "The rules where my child lives or studies don't seem to leave room for people who think like they do.", neuralImprint: "TRAP" },
  { id: 40, text: "Instead of support, my child mostly receives lectures or punishment when they struggle to focus.", neuralImprint: "TRAP" },
  { id: 41, text: "Growing up, my child was often called naughty, restless, or disruptive.", neuralImprint: "NEG" },
  { id: 42, text: "As a younger child, my child was sometimes shouted at for things that may have been due to not sitting still.", neuralImprint: "NEG" },
  { id: 43, text: "Adults in my child's past rarely asked why they struggled; they mostly told my child to behave.", neuralImprint: "NEG" },
  { id: 44, text: "My child learnt early to hide their energy or ideas so they wouldn't get into trouble.", neuralImprint: "NEG" },
  { id: 45, text: "My child becomes very frustrated with themselves when they make the same mistakes again and again.", neuralImprint: "ANG" },
  { id: 46, text: "When my child feels overwhelmed, they sometimes snap at people or storm off.", neuralImprint: "ANG" },
  { id: 47, text: "My child acts as if everything is fine at school, even when they seem completely lost inside.", neuralImprint: "DEC" },
  { id: 48, text: "My child sometimes claims not to care about a test or task so that people won't see how much they struggled.", neuralImprint: "DEC" }
];

export const parentADHDAssessment: SelfAssessmentType = {
  id: 'parent-adhd',
  name: 'Parent/Caregiver ADHD-Linked Neural Imprint Screener',
  description: 'This questionnaire helps you notice patterns in how your child or teenager focuses, manages energy, handles emotions, and responds to school and life demands. It links their behaviours to Neural Imprint Patterns.',
  instructions: `How to answer:
• Think about your child's behaviour over the last 6–12 months.
• Answer based on how they are MOST of the time, not on a single good or bad day.
• There are no right or wrong answers – be as honest and objective as you can.
• Use the scale: 1 = Does not describe my child at all, 4 = Describes my child completely.`,
  disclaimer: 'This is NOT a diagnosis of ADHD. Only a qualified health professional (such as a psychologist, psychiatrist, or medical doctor) can diagnose ADHD. This tool is designed for parent or caregiver reflection and coaching. It can highlight where your child may benefit from support, strategies, or a professional assessment.',
  questions: parentADHDQuestions,
  scale: {
    min: 1,
    max: 4,
    labels: ['Does not describe my child at all', 'Describes my child a little', 'Describes my child quite a lot', 'Describes my child completely']
  }
};

// Teen Career & Future Direction Assessment
export const careerAssessment: SelfAssessmentType = {
  id: 'teen-career',
  name: 'Teen Career & Future Direction',
  description: `BrainWorx Career & Behaviour Assessments are designed to answer one big question: "Where do I fit, and how do I function best?"

Instead of guessing about subjects, studies and future careers, our assessments give teenagers and young adults a clear, structured picture of who they are in real study and work situations. We combine three powerful lenses – Neural Imprint Patterns (NIP), RIASEC career interests, and real-life work scenarios – to create an integrated map of interests, strengths, stress patterns and decision-making style.

Traditional career tests often focus only on what you like or what you're good at on paper. BrainWorx goes further. Neural Imprint Patterns look at how your brain and behaviour typically show up: organisation and time management, focus, energy, emotional loops, burnout risk, sense of scarcity or possibility, and more. RIASEC adds a globally recognised framework for career interests – from investigative and social paths to creative, business and practical/technical roles. Scenario questions then place you in everyday workplace situations to see how you tend to respond when there are deadlines, conflict, unclear instructions or pressure from others.

Together, these pieces provide a 360° view of career fit. Learners don't just see a list of job titles; they see how their natural style will play out in real classrooms, campuses and workplaces. Parents gain language for meaningful conversations about expectations, motivation, stress and support. Schools, counsellors and BrainWorx coaches receive a professional report with clear graphs, plain-language explanations and a suggested coaching flow for a 45–60 minute feedback session.`,
  instructions: `How to answer:
• Answer honestly based on what truly describes you, not what you think sounds good.
• Think about how you are MOST of the time, not just on your best or worst days.
• For scenario questions, imagine yourself in that situation and choose the response that feels most natural to you.
• There are no right or wrong answers – every pattern and preference has value in different careers.
• Use the scale provided for each section to rate how well each statement describes you.
• The assessment takes approximately 25-35 minutes to complete.
• You can save your progress and return at any time.`,
  disclaimer: `Important: BrainWorx assessments are self-reflection and coaching tools, not clinical diagnostic instruments. They are designed to support personal growth, informed decision-making and guided conversations with qualified professionals, teachers, mentors and parents. For formal psychometric testing or psychological diagnosis, a registered psychologist should be consulted.

All assessments are delivered online and generate two reports:
• A Client Report – simple, visual and encouraging, ideal for learners and parents.
• A Coach/Teacher Report – more detailed, with interpretation notes, risk flags and practical next-step suggestions.

Used well, these assessments don't tell a young person what they must become. They provide a clear map, a shared language and a structured conversation so that learner, parent and school can make wiser, more confident choices together.`,
  questions: [], // Questions are handled in CareerAssessment component
  scale: {
    min: 1,
    max: 5,
    labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  }
};

// Export all assessment types
export const selfAssessmentTypes: SelfAssessmentType[] = [
  teenADHDAssessment,
  parentADHDAssessment,
  careerAssessment
];
