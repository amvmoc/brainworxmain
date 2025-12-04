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

// Teen Career & Future Work/Study Direction Assessment
export const careerAssessmentQuestions: SelfAssessmentQuestion[] = [
  { id: 1, text: "I enjoy listening to people's problems and helping them think of ways forward.", neuralImprint: "INFLUENCE", domain: "Interest_People" },
  { id: 2, text: "I can see myself in a job where I support or care for others (for example teaching, counselling, nursing or youth work).", neuralImprint: "INFLUENCE", domain: "Interest_People" },
  { id: 3, text: "I feel alive when I am part of something that encourages or builds up other people.", neuralImprint: "INFLUENCE", domain: "Interest_People" },
  { id: 4, text: "Friends often come to me for advice or to talk about what is going on in their lives.", neuralImprint: "LEFT/RIGHT", domain: "Interest_People" },
  { id: 5, text: "I enjoy fixing, building or working with tools, equipment or my hands.", neuralImprint: "LEFT/RIGHT", domain: "Interest_Practical" },
  { id: 6, text: "I would rather do practical tasks than write long essays.", neuralImprint: "LEFT/RIGHT", domain: "Interest_Practical" },
  { id: 7, text: "The idea of working in a trade or technical job (for example mechanic, electrician, chef) appeals to me.", neuralImprint: "RES", domain: "Interest_Practical" },
  { id: 8, text: "I like seeing a physical result of my work, like something I have made or repaired.", neuralImprint: "TRAP", domain: "Interest_Practical" },
  { id: 9, text: "I enjoy creative activities like drawing, music, dance, design, video or content creation.", neuralImprint: "LEFT/RIGHT", domain: "Interest_Creative" },
  { id: 10, text: "I often have ideas for stories, designs, videos or projects and like turning them into something real.", neuralImprint: "CPL", domain: "Interest_Creative" },
  { id: 11, text: "I would like a future where I can express myself creatively in my work.", neuralImprint: "DEC", domain: "Interest_Creative" },
  { id: 12, text: "I care about how things look and feel (for example colours, style, branding).", neuralImprint: "NAR", domain: "Interest_Creative" },
  { id: 13, text: "I enjoy solving puzzles, logic problems or working with numbers.", neuralImprint: "LEFT/RIGHT", domain: "Interest_Systems" },
  { id: 14, text: "I am curious about how systems work (for example apps, machines, finances) and like figuring them out.", neuralImprint: "DIS", domain: "Interest_Systems" },
  { id: 15, text: "I like planning steps, organising information or creating lists and structures.", neuralImprint: "DOG", domain: "Interest_Systems" },
  { id: 16, text: "I can imagine myself in work like IT, engineering, finance or science.", neuralImprint: "DIS", domain: "Interest_Systems" },
  { id: 17, text: "In group tasks or projects, I often end up taking the lead.", neuralImprint: "INFLUENCE", domain: "Interest_Leadership" },
  { id: 18, text: "I enjoy organising people and making sure things get done.", neuralImprint: "INFLUENCE", domain: "Interest_Leadership" },
  { id: 19, text: "The idea of guiding or leading others (for example manager, pastor, coach, business owner) is exciting to me.", neuralImprint: "NAR", domain: "Interest_Leadership" },
  { id: 20, text: "I like persuading others or presenting ideas to a group.", neuralImprint: "INFLUENCE", domain: "Interest_Leadership" },
  { id: 21, text: "I like the idea of a job with a clear routine and predictable tasks.", neuralImprint: "DOG", domain: "Interest_Stability" },
  { id: 22, text: "I feel calmer when I know exactly what is expected of me each day.", neuralImprint: "BURN", domain: "Interest_Stability" },
  { id: 23, text: "I can imagine myself in reliable support roles (for example admin, receptionist, back-office).", neuralImprint: "TRAP", domain: "Interest_Stability" },
  { id: 24, text: "I would rather have a safe, steady income than take big risks for a more exciting job.", neuralImprint: "LACK", domain: "Interest_Stability" },
  { id: 25, text: "It is hard for me to concentrate in noisy, busy places like open classrooms or malls.", neuralImprint: "DIS", domain: "Env_QuietBusy" },
  { id: 26, text: "I prefer smaller, quieter spaces when I need to think or work.", neuralImprint: "BURN", domain: "Env_QuietBusy" },
  { id: 27, text: "I feel energised in lively environments where there is a lot happening.", neuralImprint: "CPL", domain: "Env_QuietBusy" },
  { id: 28, text: "I like schools or workplaces that have a buzz and constant interaction.", neuralImprint: "CPL", domain: "Env_QuietBusy" },
  { id: 29, text: "I do my best when my timetable or schedule is clearly planned out.", neuralImprint: "DOG", domain: "Env_Structure" },
  { id: 30, text: "I get stressed when teachers or leaders change plans at the last minute.", neuralImprint: "ANG", domain: "Env_Structure" },
  { id: 31, text: "I prefer flexible days where I can decide the order in which I do tasks.", neuralImprint: "RES", domain: "Env_Structure" },
  { id: 32, text: "Very strict, rule-heavy environments make me feel trapped.", neuralImprint: "TRAP", domain: "Env_Structure" },
  { id: 33, text: "I enjoy working in teams and bouncing ideas off other people.", neuralImprint: "INFLUENCE", domain: "Env_TeamSolo" },
  { id: 34, text: "I prefer working alone where I can go at my own pace.", neuralImprint: "RES", domain: "Env_TeamSolo" },
  { id: 35, text: "Group projects usually energise me rather than drain me.", neuralImprint: "INFLUENCE", domain: "Env_TeamSolo" },
  { id: 36, text: "I need regular time on my own to think or reset after being with people.", neuralImprint: "BURN", domain: "Env_TeamSolo" },
  { id: 37, text: "I get bored quickly if I have to do the same kind of task every day.", neuralImprint: "RES", domain: "Env_Change" },
  { id: 38, text: "I enjoy learning new things and changing up what I do.", neuralImprint: "CPL", domain: "Env_Change" },
  { id: 39, text: "I prefer jobs where things do not change too much from week to week.", neuralImprint: "DOG", domain: "Env_Change" },
  { id: 40, text: "Sudden changes at school or home can throw me off balance.", neuralImprint: "NEG", domain: "Env_Change" },
  { id: 41, text: "I understand things best when I can try them myself, not just listen.", neuralImprint: "LEFT/RIGHT", domain: "Learn_HandsOn" },
  { id: 42, text: "Practical experiments, projects or demonstrations help information stick for me.", neuralImprint: "DIS", domain: "Learn_HandsOn" },
  { id: 43, text: "I would enjoy courses with lots of practical work (for example labs, workshops, placements).", neuralImprint: "LEFT/RIGHT", domain: "Learn_HandsOn" },
  { id: 44, text: "I struggle to stay focused in long, theory-heavy lessons.", neuralImprint: "DIS", domain: "Learn_HandsOn" },
  { id: 45, text: "I enjoy understanding ideas and concepts in depth, even when they are abstract.", neuralImprint: "LEFT/RIGHT", domain: "Learn_Theory" },
  { id: 46, text: "I do not mind reading longer texts if the topic really interests me.", neuralImprint: "BURN", domain: "Learn_Theory" },
  { id: 47, text: "I can imagine myself studying at university with lots of reading and lectures.", neuralImprint: "LEFT/RIGHT", domain: "Learn_Theory" },
  { id: 48, text: "I learn best when I can talk things through with other people.", neuralImprint: "INFLUENCE", domain: "Learn_Social" },
  { id: 49, text: "Study groups or explaining work to friends helps me remember it better.", neuralImprint: "INFLUENCE", domain: "Learn_Social" },
  { id: 50, text: "I find it fairly easy to motivate myself to study without someone checking on me.", neuralImprint: "DOG", domain: "Learn_SelfDiscipline" },
  { id: 51, text: "I often leave school work until the last minute, even when I care about the results.", neuralImprint: "CPL", domain: "Learn_SelfDiscipline" },
  { id: 52, text: "I usually need external deadlines or pressure before I really start working.", neuralImprint: "RES", domain: "Learn_SelfDiscipline" },
  { id: 53, text: "Sometimes I think I am not clever enough for the kind of future I want.", neuralImprint: "SHT", domain: "Risk_SelfWorth" },
  { id: 54, text: "My past school marks make me doubt whether I can succeed after school.", neuralImprint: "NEG", domain: "Risk_SelfWorth" },
  { id: 55, text: "I often compare myself to others and feel behind in life or success.", neuralImprint: "VICTIM", domain: "Risk_SelfWorth" },
  { id: 56, text: "I feel overwhelmed when I think about my future after school.", neuralImprint: "BURN", domain: "Risk_StressBurnout" },
  { id: 57, text: "I get stressed easily when I have many tasks or exams at the same time.", neuralImprint: "BURN", domain: "Risk_StressBurnout" },
  { id: 58, text: "It is hard to stay focused on long-term goals; short-term fun usually wins.", neuralImprint: "CPL", domain: "Risk_Motivation" },
  { id: 59, text: "Sometimes when adults talk about planning my future, I think 'what is the point?'.", neuralImprint: "RES", domain: "Risk_Motivation" },
  { id: 60, text: "Messages from my family or community about which careers are acceptable strongly influence my choices.", neuralImprint: "DOG", domain: "Risk_FamilyBeliefs" }
];

export const careerAssessment: SelfAssessmentType = {
  id: 'teen-career',
  name: 'Teen Career & Future Work/Study Direction',
  description: 'This assessment is for teenagers who want to understand what kind of future work and study paths might fit them best. It looks at your interests, the type of environments you function well in, how you like to learn, and some patterns that might help or hinder your future choices.',
  instructions: `How to answer:
• Think about how you usually are over the last 6–12 months.
• Answer honestly, not how you think you should be.
• Use the scale 1–4:
  1 = Not at all true of me
  2 = A little true of me
  3 = Often true of me
  4 = Completely true of me`,
  disclaimer: 'It uses the 16 Neural Imprint Patterns as a background lens, but it is NOT a formal psychometric career test and does NOT replace professional career counselling or psychological assessment. The results are designed for self-reflection, coaching and guided conversations with parents, mentors, teachers or counsellors.',
  questions: careerAssessmentQuestions,
  scale: {
    min: 1,
    max: 4,
    labels: ['Not at all true of me', 'A little true of me', 'Often true of me', 'Completely true of me']
  }
};

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

// Export all assessment types
export const selfAssessmentTypes: SelfAssessmentType[] = [
  careerAssessment,
  teenADHDAssessment,
  parentADHDAssessment
];
