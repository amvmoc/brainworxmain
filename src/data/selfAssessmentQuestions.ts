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

// Teen Career & Future Work/Study Direction Assessment (132 Questions - NIP + RIASEC)
export const careerAssessmentQuestions: SelfAssessmentQuestion[] = [
  // SECTION A – INTERESTS
  // A1 – Helping & People Care
  { id: 1, text: "I feel good when I support someone who is struggling.", neuralImprint: "INFLUENCE", domain: "A1_HELPING" },
  { id: 2, text: "Friends often come to me when they have personal problems.", neuralImprint: "INFLUENCE", domain: "A1_HELPING" },
  { id: 3, text: "I enjoy listening to people and trying to understand how they feel.", neuralImprint: "INFLUENCE", domain: "A1_HELPING" },
  { id: 4, text: "I like the idea of a job where I can help people feel better.", neuralImprint: "INFLUENCE", domain: "A1_HELPING" },

  // A2 – Technical & Mechanical
  { id: 5, text: "I enjoy understanding how machines, devices or systems work.", neuralImprint: "DIS", domain: "A2_TECHNICAL" },
  { id: 6, text: "I like fixing things that are broken.", neuralImprint: "LEFT/RIGHT", domain: "A2_TECHNICAL" },
  { id: 7, text: "I am curious about how cars, computers or gadgets are put together.", neuralImprint: "DIS", domain: "A2_TECHNICAL" },
  { id: 8, text: "I enjoy following steps or diagrams to build or assemble something.", neuralImprint: "DOG", domain: "A2_TECHNICAL" },

  // A3 – Creative & Design
  { id: 9, text: "I enjoy coming up with new ideas for stories, videos, art or music.", neuralImprint: "CPL", domain: "A3_CREATIVE" },
  { id: 10, text: "I like making things look good visually (posters, rooms, presentations).", neuralImprint: "LEFT/RIGHT", domain: "A3_CREATIVE" },
  { id: 11, text: "I enjoy expressing myself through drawing, writing, music or design.", neuralImprint: "NAR", domain: "A3_CREATIVE" },
  { id: 12, text: "I like imagining new concepts or worlds in my mind.", neuralImprint: "CPL", domain: "A3_CREATIVE" },

  // A4 – Business & Entrepreneurship
  { id: 13, text: "I like thinking about how to make money from ideas or products.", neuralImprint: "INFLUENCE", domain: "A4_BUSINESS" },
  { id: 14, text: "I enjoy finding ways to promote or 'sell' something I believe in.", neuralImprint: "INFLUENCE", domain: "A4_BUSINESS" },
  { id: 15, text: "I notice business opportunities around me (things that could be improved or sold).", neuralImprint: "DIS", domain: "A4_BUSINESS" },
  { id: 16, text: "I like the idea of starting my own small business one day.", neuralImprint: "CPL", domain: "A4_BUSINESS" },

  // A5 – Outdoor & Practical
  { id: 17, text: "I enjoy working with my hands and being physically active.", neuralImprint: "LEFT/RIGHT", domain: "A5_OUTDOOR" },
  { id: 18, text: "I would rather move around than sit at a desk all day.", neuralImprint: "RES", domain: "A5_OUTDOOR" },
  { id: 19, text: "I like tasks like building, repairing, planting or setting things up.", neuralImprint: "LEFT/RIGHT", domain: "A5_OUTDOOR" },
  { id: 20, text: "I enjoy being outdoors more than being in an office or classroom.", neuralImprint: "RES", domain: "A5_OUTDOOR" },

  // A6 – Investigative & Analytical
  { id: 21, text: "I enjoy solving puzzles or tricky problems.", neuralImprint: "DIS", domain: "A6_INVESTIGATIVE" },
  { id: 22, text: "I like understanding why things happen, not just that they happen.", neuralImprint: "DIS", domain: "A6_INVESTIGATIVE" },
  { id: 23, text: "I enjoy doing research or searching for information on topics that interest me.", neuralImprint: "DIS", domain: "A6_INVESTIGATIVE" },
  { id: 24, text: "I like subjects or activities where I have to think deeply and analyse.", neuralImprint: "LEFT/RIGHT", domain: "A6_INVESTIGATIVE" },

  // SECTION B – PERSONALITY / WORK STYLE
  // B1 – Planner / Structured
  { id: 25, text: "I like having a clear plan before I start something.", neuralImprint: "DOG", domain: "B1_PLANNER" },
  { id: 26, text: "I feel uncomfortable when plans change at the last minute.", neuralImprint: "ANG", domain: "B1_PLANNER" },
  { id: 27, text: "I often plan my school work or tasks ahead of time.", neuralImprint: "DOG", domain: "B1_PLANNER" },
  { id: 28, text: "I get stressed if I don't know what is going to happen next.", neuralImprint: "BURN", domain: "B1_PLANNER" },

  // B2 – Detail Orientation
  { id: 29, text: "I notice small mistakes or details that other people miss.", neuralImprint: "DIS", domain: "B2_DETAIL" },
  { id: 30, text: "I get bored if I have to check small details for a long time.", neuralImprint: "RES", domain: "B2_DETAIL" },
  { id: 31, text: "I like understanding the overall idea before I focus on details.", neuralImprint: "DIS", domain: "B2_DETAIL" },
  { id: 32, text: "I enjoy tasks where accuracy and neatness are important.", neuralImprint: "DOG", domain: "B2_DETAIL" },

  // B3 – Introverted vs Extraverted Energy (higher = more introverted)
  { id: 33, text: "Being with lots of people for a long time drains my energy.", neuralImprint: "BURN", domain: "B3_INTROVERSION" },
  { id: 34, text: "I feel energised when I meet new people and talk a lot.", neuralImprint: "INFLUENCE", domain: "B3_INTROVERSION" },
  { id: 35, text: "I prefer a few close friends rather than many casual friends.", neuralImprint: "RES", domain: "B3_INTROVERSION" },
  { id: 36, text: "I usually feel comfortable speaking up in a group.", neuralImprint: "INFLUENCE", domain: "B3_INTROVERSION" },

  // B4 – Persistence / Grit
  { id: 37, text: "If something is difficult, I usually keep going until I figure it out.", neuralImprint: "DOG", domain: "B4_PERSISTENCE" },
  { id: 38, text: "I give up quickly if I don't succeed the first time.", neuralImprint: "RES", domain: "B4_PERSISTENCE" },
  { id: 39, text: "I am willing to put in effort over a long time to reach a goal.", neuralImprint: "DOG", domain: "B4_PERSISTENCE" },
  { id: 40, text: "When I fail at something, I try to learn from it and try again.", neuralImprint: "INFLUENCE", domain: "B4_PERSISTENCE" },

  // B5 – Structure Preference
  { id: 41, text: "I like clear rules and instructions.", neuralImprint: "DOG", domain: "B5_STRUCTURE" },
  { id: 42, text: "I get frustrated when people keep changing the way things are done.", neuralImprint: "ANG", domain: "B5_STRUCTURE" },
  { id: 43, text: "I enjoy having the freedom to work in my own way.", neuralImprint: "CPL", domain: "B5_STRUCTURE" },
  { id: 44, text: "I prefer knowing exactly what is expected of me before I start.", neuralImprint: "DOG", domain: "B5_STRUCTURE" },

  // B6 – Risk & Change Comfort
  { id: 45, text: "I enjoy trying new things, even if I might fail.", neuralImprint: "CPL", domain: "B6_RISK" },
  { id: 46, text: "I feel nervous when I have to make big changes in my life.", neuralImprint: "BURN", domain: "B6_RISK" },
  { id: 47, text: "I like taking on challenges that push me out of my comfort zone.", neuralImprint: "INFLUENCE", domain: "B6_RISK" },
  { id: 48, text: "I prefer to stay with what I know rather than experiment.", neuralImprint: "RES", domain: "B6_RISK" },

  // SECTION C – VALUES
  // C1 – Security & Stability
  { id: 49, text: "Having a stable job and steady income is very important to me.", neuralImprint: "DOG", domain: "C1_SECURITY" },
  { id: 50, text: "I would rather choose a safe career than a risky but exciting one.", neuralImprint: "RES", domain: "C1_SECURITY" },
  { id: 51, text: "I want a job where I can plan my life with some certainty.", neuralImprint: "DOG", domain: "C1_SECURITY" },

  // C2 – Meaning & Helping Others
  { id: 52, text: "I want my work to make a real difference in people's lives.", neuralImprint: "INFLUENCE", domain: "C2_MEANING" },
  { id: 53, text: "I would rather have meaningful work than a job that only pays well.", neuralImprint: "NAR", domain: "C2_MEANING" },
  { id: 54, text: "I want to feel that my work is connected to something bigger than myself.", neuralImprint: "NAR", domain: "C2_MEANING" },

  // C3 – Achievement & Success
  { id: 55, text: "I want to be very successful in whatever I choose to do.", neuralImprint: "NAR", domain: "C3_ACHIEVEMENT" },
  { id: 56, text: "I feel motivated when I have clear goals to achieve.", neuralImprint: "DOG", domain: "C3_ACHIEVEMENT" },
  { id: 57, text: "I like the idea of setting big goals and working hard to reach them.", neuralImprint: "INFLUENCE", domain: "C3_ACHIEVEMENT" },

  // C4 – Freedom & Autonomy
  { id: 58, text: "I don't like being tightly controlled or micromanaged.", neuralImprint: "RES", domain: "C4_FREEDOM" },
  { id: 59, text: "I want a career where I have some say in how I work.", neuralImprint: "CPL", domain: "C4_FREEDOM" },
  { id: 60, text: "I value having flexibility to organise my own time.", neuralImprint: "CPL", domain: "C4_FREEDOM" },

  // C5 – Recognition & Status
  { id: 61, text: "It is important to me that people respect the work I do.", neuralImprint: "NAR", domain: "C5_RECOGNITION" },
  { id: 62, text: "I like the idea of being known as an expert in my field.", neuralImprint: "NAR", domain: "C5_RECOGNITION" },
  { id: 63, text: "I would enjoy a job where I can feel proud of my title or position.", neuralImprint: "NAR", domain: "C5_RECOGNITION" },

  // C6 – Creativity & Self-Expression
  { id: 64, text: "I want space to bring my own ideas and style into my work.", neuralImprint: "CPL", domain: "C6_CREATIVITY" },
  { id: 65, text: "I would struggle in a job where I must always do things in one fixed way.", neuralImprint: "RES", domain: "C6_CREATIVITY" },
  { id: 66, text: "It is important to me that I can express who I am through my work.", neuralImprint: "NAR", domain: "C6_CREATIVITY" },

  // SECTION D – STRENGTHS / ABILITIES (SELF-VIEW)
  // D1 – Verbal / Communication
  { id: 67, text: "I can explain ideas clearly so that others understand.", neuralImprint: "INFLUENCE", domain: "D1_VERBAL" },
  { id: 68, text: "I enjoy reading or writing more than most people my age.", neuralImprint: "LEFT/RIGHT", domain: "D1_VERBAL" },
  { id: 69, text: "I am often the one who helps classmates understand school work.", neuralImprint: "INFLUENCE", domain: "D1_VERBAL" },

  // D2 – Numerical / Logical
  { id: 70, text: "I find it easy to work with numbers and basic calculations.", neuralImprint: "LEFT/RIGHT", domain: "D2_NUMERICAL" },
  { id: 71, text: "I enjoy subjects or tasks where logic and problem-solving are needed.", neuralImprint: "DIS", domain: "D2_NUMERICAL" },
  { id: 72, text: "I can usually see patterns in information or data.", neuralImprint: "DIS", domain: "D2_NUMERICAL" },

  // D3 – People Insight / Empathy
  { id: 73, text: "I quickly pick up when someone is upset, even if they don't say it.", neuralImprint: "DIS", domain: "D3_EMPATHY" },
  { id: 74, text: "Friends often say I understand them well.", neuralImprint: "INFLUENCE", domain: "D3_EMPATHY" },
  { id: 75, text: "I can usually see both sides when people disagree.", neuralImprint: "DIS", domain: "D3_EMPATHY" },

  // D4 – Practical / Technical / Hands-on
  { id: 76, text: "I am good at learning how to use new tools, apps or equipment.", neuralImprint: "LEFT/RIGHT", domain: "D4_PRACTICAL" },
  { id: 77, text: "I can often figure out how to fix things without much help.", neuralImprint: "DIS", domain: "D4_PRACTICAL" },
  { id: 78, text: "I am confident with practical tasks like setting up, building or installing things.", neuralImprint: "LEFT/RIGHT", domain: "D4_PRACTICAL" },

  // D5 – Creative / Innovative
  { id: 79, text: "I often come up with original ideas or new ways to do things.", neuralImprint: "CPL", domain: "D5_CREATIVE_STRENGTH" },
  { id: 80, text: "I enjoy turning an idea into something visible (a drawing, design, video, etc.).", neuralImprint: "CPL", domain: "D5_CREATIVE_STRENGTH" },
  { id: 81, text: "I can usually think of more than one solution when faced with a problem.", neuralImprint: "DIS", domain: "D5_CREATIVE_STRENGTH" },

  // D6 – Leadership / Initiative
  { id: 82, text: "I naturally take the lead when a group needs direction.", neuralImprint: "INFLUENCE", domain: "D6_LEADERSHIP" },
  { id: 83, text: "I am comfortable making decisions when others are unsure.", neuralImprint: "INFLUENCE", domain: "D6_LEADERSHIP" },
  { id: 84, text: "People often look to me when something needs to get organised.", neuralImprint: "INFLUENCE", domain: "D6_LEADERSHIP" },

  // SECTION E – WORK ENVIRONMENT PREFERENCES
  // E1 – People vs Data/Things (high = people focus)
  { id: 85, text: "I would rather work with people than with data or machines.", neuralImprint: "INFLUENCE", domain: "E1_PEOPLE" },
  { id: 86, text: "I would enjoy a job where I talk to people most of the day.", neuralImprint: "INFLUENCE", domain: "E1_PEOPLE" },
  { id: 87, text: "I would enjoy a job where I mainly work with information, systems or objects.", neuralImprint: "LEFT/RIGHT", domain: "E1_PEOPLE" },

  // E2 – Structure Preference (Environment)
  { id: 88, text: "I prefer a job with clear rules, routines and schedules.", neuralImprint: "DOG", domain: "E2_STRUCTURE_ENV" },
  { id: 89, text: "I would like a job where each day is different from the last.", neuralImprint: "CPL", domain: "E2_STRUCTURE_ENV" },
  { id: 90, text: "I would feel stressed in a job with no clear routines.", neuralImprint: "BURN", domain: "E2_STRUCTURE_ENV" },

  // E3 – Pace (high = faster/busier)
  { id: 91, text: "I would enjoy working in a busy, fast-moving environment.", neuralImprint: "CPL", domain: "E3_PACE" },
  { id: 92, text: "I prefer a calm, steady pace where I can take my time.", neuralImprint: "DOG", domain: "E3_PACE" },
  { id: 93, text: "I enjoy having many tasks happening at once.", neuralImprint: "CPL", domain: "E3_PACE" },

  // E4 – Team vs Solo (high = team)
  { id: 94, text: "I would rather work in a team than work alone most of the time.", neuralImprint: "INFLUENCE", domain: "E4_TEAM" },
  { id: 95, text: "I do my best work when I can focus alone without interruptions.", neuralImprint: "RES", domain: "E4_TEAM" },
  { id: 96, text: "I like being part of a group where everyone contributes something.", neuralImprint: "INFLUENCE", domain: "E4_TEAM" },

  // E5 – Physical vs Desk-Based (high = physical)
  { id: 97, text: "I would enjoy a job where I move around a lot.", neuralImprint: "LEFT/RIGHT", domain: "E5_PHYSICAL" },
  { id: 98, text: "I don't mind sitting at a desk for long periods.", neuralImprint: "DOG", domain: "E5_PHYSICAL" },
  { id: 99, text: "I like using my body and physical energy in my activities.", neuralImprint: "LEFT/RIGHT", domain: "E5_PHYSICAL" },

  // E6 – Variety vs Routine (high = variety)
  { id: 100, text: "I like knowing what I will be doing every day at work.", neuralImprint: "DOG", domain: "E6_VARIETY" },
  { id: 101, text: "I would get bored if my job was the same every day.", neuralImprint: "RES", domain: "E6_VARIETY" },
  { id: 102, text: "I enjoy having a mix of different tasks and responsibilities.", neuralImprint: "CPL", domain: "E6_VARIETY" },

  // SECTION R – RIASEC CAREER INTERESTS (Yes = 2, Maybe = 1, No = 0)
  // Realistic (R)
  { id: 103, text: "I enjoy working with tools, machines or equipment.", neuralImprint: "LEFT/RIGHT", domain: "R_REALISTIC" },
  { id: 104, text: "I like repairing or fixing physical things.", neuralImprint: "LEFT/RIGHT", domain: "R_REALISTIC" },
  { id: 105, text: "I prefer practical, hands-on tasks rather than theories.", neuralImprint: "LEFT/RIGHT", domain: "R_REALISTIC" },
  { id: 106, text: "I would enjoy a job that involves working outdoors.", neuralImprint: "LEFT/RIGHT", domain: "R_REALISTIC" },
  { id: 107, text: "I like building or assembling things.", neuralImprint: "LEFT/RIGHT", domain: "R_REALISTIC" },

  // Investigative (I)
  { id: 108, text: "I enjoy figuring out how and why things work.", neuralImprint: "DIS", domain: "R_INVESTIGATIVE" },
  { id: 109, text: "I like science, experiments or research tasks.", neuralImprint: "DIS", domain: "R_INVESTIGATIVE" },
  { id: 110, text: "I enjoy analysing data, facts or information.", neuralImprint: "DIS", domain: "R_INVESTIGATIVE" },
  { id: 111, text: "I like solving complex problems or puzzles.", neuralImprint: "DIS", domain: "R_INVESTIGATIVE" },
  { id: 112, text: "I would enjoy a job where I investigate questions and find answers.", neuralImprint: "DIS", domain: "R_INVESTIGATIVE" },

  // Artistic (A)
  { id: 113, text: "I enjoy drawing, writing, music or other creative activities.", neuralImprint: "CPL", domain: "R_ARTISTIC" },
  { id: 114, text: "I like expressing myself through design, colour or style.", neuralImprint: "NAR", domain: "R_ARTISTIC" },
  { id: 115, text: "I prefer open-ended tasks where I can use my imagination.", neuralImprint: "CPL", domain: "R_ARTISTIC" },
  { id: 116, text: "I am attracted to jobs that involve art, media or creativity.", neuralImprint: "CPL", domain: "R_ARTISTIC" },
  { id: 117, text: "I enjoy creating something new rather than following strict instructions.", neuralImprint: "CPL", domain: "R_ARTISTIC" },

  // Social (S)
  { id: 118, text: "I enjoy helping people with their problems or challenges.", neuralImprint: "INFLUENCE", domain: "R_SOCIAL" },
  { id: 119, text: "I like teaching, tutoring or explaining things to others.", neuralImprint: "INFLUENCE", domain: "R_SOCIAL" },
  { id: 120, text: "I feel energised when I can support or encourage other people.", neuralImprint: "INFLUENCE", domain: "R_SOCIAL" },
  { id: 121, text: "I would enjoy working in a job that improves people's lives.", neuralImprint: "INFLUENCE", domain: "R_SOCIAL" },
  { id: 122, text: "I like working in groups where cooperation is important.", neuralImprint: "INFLUENCE", domain: "R_SOCIAL" },

  // Enterprising (E)
  { id: 123, text: "I enjoy leading or organising activities for others.", neuralImprint: "INFLUENCE", domain: "R_ENTERPRISING" },
  { id: 124, text: "I like persuading people or selling ideas, products or services.", neuralImprint: "INFLUENCE", domain: "R_ENTERPRISING" },
  { id: 125, text: "I am comfortable taking risks to reach a goal.", neuralImprint: "CPL", domain: "R_ENTERPRISING" },
  { id: 126, text: "I would enjoy running my own business or project.", neuralImprint: "CPL", domain: "R_ENTERPRISING" },
  { id: 127, text: "I like positions where I can take charge and make decisions.", neuralImprint: "INFLUENCE", domain: "R_ENTERPRISING" },

  // Conventional (C)
  { id: 128, text: "I enjoy organising information, files or records.", neuralImprint: "DOG", domain: "R_CONVENTIONAL" },
  { id: 129, text: "I like working with numbers, lists or schedules.", neuralImprint: "DOG", domain: "R_CONVENTIONAL" },
  { id: 130, text: "I prefer tasks with clear rules, procedures and structures.", neuralImprint: "DOG", domain: "R_CONVENTIONAL" },
  { id: 131, text: "I would enjoy a job that involves accuracy and attention to detail.", neuralImprint: "DOG", domain: "R_CONVENTIONAL" },
  { id: 132, text: "I feel satisfied when I can keep things neat, ordered and under control.", neuralImprint: "DOG", domain: "R_CONVENTIONAL" },
];

export const careerAssessment: SelfAssessmentType = {
  id: 'teen-career',
  name: 'Teen Career Direction Assessment (NIP + RIASEC)',
  description: 'This comprehensive assessment helps teenagers understand what kind of future work and study paths might fit them best. It integrates Neural Imprint Patterns with RIASEC career interest theory to provide a detailed profile of your interests, work style, values, strengths, and environment preferences.',
  instructions: `How to answer:
• Think about how you usually are over the last 6–12 months.
• Answer honestly, not how you think you should be.
• For Sections A–E, use the scale 1–5:
  1 = Strongly disagree
  2 = Disagree
  3 = Not sure
  4 = Agree
  5 = Strongly agree
• For Section R (RIASEC), use:
  0 = No
  1 = Maybe
  2 = Yes`,
  disclaimer: 'This assessment uses the 16 Neural Imprint Patterns and RIASEC career interest theory as analytical lenses, but it is NOT a formal psychometric career test and does NOT replace professional career counselling or psychological assessment. The results are designed for self-reflection, coaching and guided conversations with parents, mentors, teachers or counsellors.',
  questions: careerAssessmentQuestions,
  scale: {
    min: 1,
    max: 5,
    labels: ['Strongly disagree', 'Disagree', 'Not sure', 'Agree', 'Strongly agree']
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
