import { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type SectionId = "A" | "B" | "C" | "D" | "E" | "R";

type ScaleId =
  | "A1_HELPING" | "A2_TECHNICAL" | "A3_CREATIVE" | "A4_BUSINESS" | "A5_OUTDOOR" | "A6_INVESTIGATIVE"
  | "B1_PLANNER" | "B2_DETAIL" | "B3_INTROVERSION" | "B4_PERSISTENCE" | "B5_STRUCTURE" | "B6_RISK"
  | "C1_SECURITY" | "C2_MEANING" | "C3_ACHIEVEMENT" | "C4_FREEDOM" | "C5_RECOGNITION" | "C6_CREATIVITY"
  | "D1_VERBAL" | "D2_NUMERICAL" | "D3_EMPATHY" | "D4_PRACTICAL" | "D5_CREATIVE_STRENGTH" | "D6_LEADERSHIP"
  | "E1_PEOPLE" | "E2_STRUCTURE_ENV" | "E3_PACE" | "E4_TEAM" | "E5_PHYSICAL" | "E6_VARIETY"
  | "R_REALISTIC" | "R_INVESTIGATIVE" | "R_ARTISTIC" | "R_SOCIAL" | "R_ENTERPRISING" | "R_CONVENTIONAL";

interface Question {
  id: number;
  text: string;
  section: SectionId;
  scale: ScaleId;
  reverse?: boolean;
}

type AnswersState = Partial<Record<number, number>>;

interface ScaleScore {
  average: number;
  rawSum: number;
  itemCount: number;
}

type ScaleScores = Partial<Record<ScaleId, ScaleScore>>;

type RiaSecLetter = "R" | "I" | "A" | "S" | "E" | "C";

interface CareerAssessmentProps {
  onClose: () => void;
  email?: string;
  customerName?: string;
  franchiseOwnerId?: string | null;
  couponId?: string | null;
}

const questions: Question[] = [
  { id: 1, text: "I feel good when I support someone who is struggling.", section: "A", scale: "A1_HELPING" },
  { id: 2, text: "Friends often come to me when they have personal problems.", section: "A", scale: "A1_HELPING" },
  { id: 3, text: "I enjoy listening to people and trying to understand how they feel.", section: "A", scale: "A1_HELPING" },
  { id: 4, text: "I like the idea of a job where I can help people feel better.", section: "A", scale: "A1_HELPING" },
  { id: 5, text: "I enjoy understanding how machines, devices or systems work.", section: "A", scale: "A2_TECHNICAL" },
  { id: 6, text: "I like fixing things that are broken.", section: "A", scale: "A2_TECHNICAL" },
  { id: 7, text: "I am curious about how cars, computers or gadgets are put together.", section: "A", scale: "A2_TECHNICAL" },
  { id: 8, text: "I enjoy following steps or diagrams to build or assemble something.", section: "A", scale: "A2_TECHNICAL" },
  { id: 9, text: "I enjoy coming up with new ideas for stories, videos, art or music.", section: "A", scale: "A3_CREATIVE" },
  { id: 10, text: "I like making things look good visually (posters, rooms, presentations).", section: "A", scale: "A3_CREATIVE" },
  { id: 11, text: "I enjoy expressing myself through drawing, writing, music or design.", section: "A", scale: "A3_CREATIVE" },
  { id: 12, text: "I like imagining new concepts or worlds in my mind.", section: "A", scale: "A3_CREATIVE" },
  { id: 13, text: "I like thinking about how to make money from ideas or products.", section: "A", scale: "A4_BUSINESS" },
  { id: 14, text: "I enjoy finding ways to promote or 'sell' something I believe in.", section: "A", scale: "A4_BUSINESS" },
  { id: 15, text: "I notice business opportunities around me (things that could be improved or sold).", section: "A", scale: "A4_BUSINESS" },
  { id: 16, text: "I like the idea of starting my own small business one day.", section: "A", scale: "A4_BUSINESS" },
  { id: 17, text: "I enjoy working with my hands and being physically active.", section: "A", scale: "A5_OUTDOOR" },
  { id: 18, text: "I would rather move around than sit at a desk all day.", section: "A", scale: "A5_OUTDOOR" },
  { id: 19, text: "I like tasks like building, repairing, planting or setting things up.", section: "A", scale: "A5_OUTDOOR" },
  { id: 20, text: "I enjoy being outdoors more than being in an office or classroom.", section: "A", scale: "A5_OUTDOOR" },
  { id: 21, text: "I enjoy solving puzzles or tricky problems.", section: "A", scale: "A6_INVESTIGATIVE" },
  { id: 22, text: "I like understanding why things happen, not just that they happen.", section: "A", scale: "A6_INVESTIGATIVE" },
  { id: 23, text: "I enjoy doing research or searching for information on topics that interest me.", section: "A", scale: "A6_INVESTIGATIVE" },
  { id: 24, text: "I like subjects or activities where I have to think deeply and analyse.", section: "A", scale: "A6_INVESTIGATIVE" },

  { id: 25, text: "I like having a clear plan before I start something.", section: "B", scale: "B1_PLANNER" },
  { id: 26, text: "I feel uncomfortable when plans change at the last minute.", section: "B", scale: "B1_PLANNER" },
  { id: 27, text: "I often plan my school work or tasks ahead of time.", section: "B", scale: "B1_PLANNER" },
  { id: 28, text: "I get stressed if I don't know what is going to happen next.", section: "B", scale: "B1_PLANNER" },
  { id: 29, text: "I notice small mistakes or details that other people miss.", section: "B", scale: "B2_DETAIL" },
  { id: 30, text: "I get bored if I have to check small details for a long time.", section: "B", scale: "B2_DETAIL", reverse: true },
  { id: 31, text: "I like understanding the overall idea before I focus on details.", section: "B", scale: "B2_DETAIL" },
  { id: 32, text: "I enjoy tasks where accuracy and neatness are important.", section: "B", scale: "B2_DETAIL" },
  { id: 33, text: "Being with lots of people for a long time drains my energy.", section: "B", scale: "B3_INTROVERSION" },
  { id: 34, text: "I feel energised when I meet new people and talk a lot.", section: "B", scale: "B3_INTROVERSION", reverse: true },
  { id: 35, text: "I prefer a few close friends rather than many casual friends.", section: "B", scale: "B3_INTROVERSION" },
  { id: 36, text: "I usually feel comfortable speaking up in a group.", section: "B", scale: "B3_INTROVERSION", reverse: true },
  { id: 37, text: "If something is difficult, I usually keep going until I figure it out.", section: "B", scale: "B4_PERSISTENCE" },
  { id: 38, text: "I give up quickly if I don't succeed the first time.", section: "B", scale: "B4_PERSISTENCE", reverse: true },
  { id: 39, text: "I am willing to put in effort over a long time to reach a goal.", section: "B", scale: "B4_PERSISTENCE" },
  { id: 40, text: "When I fail at something, I try to learn from it and try again.", section: "B", scale: "B4_PERSISTENCE" },
  { id: 41, text: "I like clear rules and instructions.", section: "B", scale: "B5_STRUCTURE" },
  { id: 42, text: "I get frustrated when people keep changing the way things are done.", section: "B", scale: "B5_STRUCTURE" },
  { id: 43, text: "I enjoy having the freedom to work in my own way.", section: "B", scale: "B5_STRUCTURE", reverse: true },
  { id: 44, text: "I prefer knowing exactly what is expected of me before I start.", section: "B", scale: "B5_STRUCTURE" },
  { id: 45, text: "I enjoy trying new things, even if I might fail.", section: "B", scale: "B6_RISK" },
  { id: 46, text: "I feel nervous when I have to make big changes in my life.", section: "B", scale: "B6_RISK", reverse: true },
  { id: 47, text: "I like taking on challenges that push me out of my comfort zone.", section: "B", scale: "B6_RISK" },
  { id: 48, text: "I prefer to stay with what I know rather than experiment.", section: "B", scale: "B6_RISK", reverse: true },

  { id: 49, text: "Having a stable job and steady income is very important to me.", section: "C", scale: "C1_SECURITY" },
  { id: 50, text: "I would rather choose a safe career than a risky but exciting one.", section: "C", scale: "C1_SECURITY" },
  { id: 51, text: "I want a job where I can plan my life with some certainty.", section: "C", scale: "C1_SECURITY" },
  { id: 52, text: "I want my work to make a real difference in people's lives.", section: "C", scale: "C2_MEANING" },
  { id: 53, text: "I would rather have meaningful work than a job that only pays well.", section: "C", scale: "C2_MEANING" },
  { id: 54, text: "I want to feel that my work is connected to something bigger than myself.", section: "C", scale: "C2_MEANING" },
  { id: 55, text: "I want to be very successful in whatever I choose to do.", section: "C", scale: "C3_ACHIEVEMENT" },
  { id: 56, text: "I feel motivated when I have clear goals to achieve.", section: "C", scale: "C3_ACHIEVEMENT" },
  { id: 57, text: "I like the idea of setting big goals and working hard to reach them.", section: "C", scale: "C3_ACHIEVEMENT" },
  { id: 58, text: "I don't like being tightly controlled or micromanaged.", section: "C", scale: "C4_FREEDOM" },
  { id: 59, text: "I want a career where I have some say in how I work.", section: "C", scale: "C4_FREEDOM" },
  { id: 60, text: "I value having flexibility to organise my own time.", section: "C", scale: "C4_FREEDOM" },
  { id: 61, text: "It is important to me that people respect the work I do.", section: "C", scale: "C5_RECOGNITION" },
  { id: 62, text: "I like the idea of being known as an expert in my field.", section: "C", scale: "C5_RECOGNITION" },
  { id: 63, text: "I would enjoy a job where I can feel proud of my title or position.", section: "C", scale: "C5_RECOGNITION" },
  { id: 64, text: "I want space to bring my own ideas and style into my work.", section: "C", scale: "C6_CREATIVITY" },
  { id: 65, text: "I would struggle in a job where I must always do things in one fixed way.", section: "C", scale: "C6_CREATIVITY" },
  { id: 66, text: "It is important to me that I can express who I am through my work.", section: "C", scale: "C6_CREATIVITY" },

  { id: 67, text: "I can explain ideas clearly so that others understand.", section: "D", scale: "D1_VERBAL" },
  { id: 68, text: "I enjoy reading or writing more than most people my age.", section: "D", scale: "D1_VERBAL" },
  { id: 69, text: "I am often the one who helps classmates understand school work.", section: "D", scale: "D1_VERBAL" },
  { id: 70, text: "I find it easy to work with numbers and basic calculations.", section: "D", scale: "D2_NUMERICAL" },
  { id: 71, text: "I enjoy subjects or tasks where logic and problem-solving are needed.", section: "D", scale: "D2_NUMERICAL" },
  { id: 72, text: "I can usually see patterns in information or data.", section: "D", scale: "D2_NUMERICAL" },
  { id: 73, text: "I quickly pick up when someone is upset, even if they don't say it.", section: "D", scale: "D3_EMPATHY" },
  { id: 74, text: "Friends often say I understand them well.", section: "D", scale: "D3_EMPATHY" },
  { id: 75, text: "I can usually see both sides when people disagree.", section: "D", scale: "D3_EMPATHY" },
  { id: 76, text: "I am good at learning how to use new tools, apps or equipment.", section: "D", scale: "D4_PRACTICAL" },
  { id: 77, text: "I can often figure out how to fix things without much help.", section: "D", scale: "D4_PRACTICAL" },
  { id: 78, text: "I am confident with practical tasks like setting up, building or installing things.", section: "D", scale: "D4_PRACTICAL" },
  { id: 79, text: "I often come up with original ideas or new ways to do things.", section: "D", scale: "D5_CREATIVE_STRENGTH" },
  { id: 80, text: "I enjoy turning an idea into something visible (a drawing, design, video, etc.).", section: "D", scale: "D5_CREATIVE_STRENGTH" },
  { id: 81, text: "I can usually think of more than one solution when faced with a problem.", section: "D", scale: "D5_CREATIVE_STRENGTH" },
  { id: 82, text: "I naturally take the lead when a group needs direction.", section: "D", scale: "D6_LEADERSHIP" },
  { id: 83, text: "I am comfortable making decisions when others are unsure.", section: "D", scale: "D6_LEADERSHIP" },
  { id: 84, text: "People often look to me when something needs to get organised.", section: "D", scale: "D6_LEADERSHIP" },

  { id: 85, text: "I would rather work with people than with data or machines.", section: "E", scale: "E1_PEOPLE" },
  { id: 86, text: "I would enjoy a job where I talk to people most of the day.", section: "E", scale: "E1_PEOPLE" },
  { id: 87, text: "I would enjoy a job where I mainly work with information, systems or objects.", section: "E", scale: "E1_PEOPLE", reverse: true },
  { id: 88, text: "I prefer a job with clear rules, routines and schedules.", section: "E", scale: "E2_STRUCTURE_ENV" },
  { id: 89, text: "I would like a job where each day is different from the last.", section: "E", scale: "E2_STRUCTURE_ENV", reverse: true },
  { id: 90, text: "I would feel stressed in a job with no clear routines.", section: "E", scale: "E2_STRUCTURE_ENV" },
  { id: 91, text: "I would enjoy working in a busy, fast-moving environment.", section: "E", scale: "E3_PACE" },
  { id: 92, text: "I prefer a calm, steady pace where I can take my time.", section: "E", scale: "E3_PACE", reverse: true },
  { id: 93, text: "I enjoy having many tasks happening at once.", section: "E", scale: "E3_PACE" },
  { id: 94, text: "I would rather work in a team than work alone most of the time.", section: "E", scale: "E4_TEAM" },
  { id: 95, text: "I do my best work when I can focus alone without interruptions.", section: "E", scale: "E4_TEAM", reverse: true },
  { id: 96, text: "I like being part of a group where everyone contributes something.", section: "E", scale: "E4_TEAM" },
  { id: 97, text: "I would enjoy a job where I move around a lot.", section: "E", scale: "E5_PHYSICAL" },
  { id: 98, text: "I don't mind sitting at a desk for long periods.", section: "E", scale: "E5_PHYSICAL", reverse: true },
  { id: 99, text: "I like using my body and physical energy in my activities.", section: "E", scale: "E5_PHYSICAL" },
  { id: 100, text: "I like knowing what I will be doing every day at work.", section: "E", scale: "E6_VARIETY", reverse: true },
  { id: 101, text: "I would get bored if my job was the same every day.", section: "E", scale: "E6_VARIETY" },
  { id: 102, text: "I enjoy having a mix of different tasks and responsibilities.", section: "E", scale: "E6_VARIETY" },

  { id: 103, text: "I enjoy working with tools, machines or equipment.", section: "R", scale: "R_REALISTIC" },
  { id: 104, text: "I like repairing or fixing physical things.", section: "R", scale: "R_REALISTIC" },
  { id: 105, text: "I prefer practical, hands-on tasks rather than theories.", section: "R", scale: "R_REALISTIC" },
  { id: 106, text: "I would enjoy a job that involves working outdoors.", section: "R", scale: "R_REALISTIC" },
  { id: 107, text: "I like building or assembling things.", section: "R", scale: "R_REALISTIC" },
  { id: 108, text: "I enjoy figuring out how and why things work.", section: "R", scale: "R_INVESTIGATIVE" },
  { id: 109, text: "I like science, experiments or research tasks.", section: "R", scale: "R_INVESTIGATIVE" },
  { id: 110, text: "I enjoy analysing data, facts or information.", section: "R", scale: "R_INVESTIGATIVE" },
  { id: 111, text: "I like solving complex problems or puzzles.", section: "R", scale: "R_INVESTIGATIVE" },
  { id: 112, text: "I would enjoy a job where I investigate questions and find answers.", section: "R", scale: "R_INVESTIGATIVE" },
  { id: 113, text: "I enjoy drawing, writing, music or other creative activities.", section: "R", scale: "R_ARTISTIC" },
  { id: 114, text: "I like expressing myself through design, colour or style.", section: "R", scale: "R_ARTISTIC" },
  { id: 115, text: "I prefer open-ended tasks where I can use my imagination.", section: "R", scale: "R_ARTISTIC" },
  { id: 116, text: "I am attracted to jobs that involve art, media or creativity.", section: "R", scale: "R_ARTISTIC" },
  { id: 117, text: "I enjoy creating something new rather than following strict instructions.", section: "R", scale: "R_ARTISTIC" },
  { id: 118, text: "I enjoy helping people with their problems or challenges.", section: "R", scale: "R_SOCIAL" },
  { id: 119, text: "I like teaching, tutoring or explaining things to others.", section: "R", scale: "R_SOCIAL" },
  { id: 120, text: "I feel energised when I can support or encourage other people.", section: "R", scale: "R_SOCIAL" },
  { id: 121, text: "I would enjoy working in a job that improves people's lives.", section: "R", scale: "R_SOCIAL" },
  { id: 122, text: "I like working in groups where cooperation is important.", section: "R", scale: "R_SOCIAL" },
  { id: 123, text: "I enjoy leading or organising activities for others.", section: "R", scale: "R_ENTERPRISING" },
  { id: 124, text: "I like persuading people or selling ideas, products or services.", section: "R", scale: "R_ENTERPRISING" },
  { id: 125, text: "I am comfortable taking risks to reach a goal.", section: "R", scale: "R_ENTERPRISING" },
  { id: 126, text: "I would enjoy running my own business or project.", section: "R", scale: "R_ENTERPRISING" },
  { id: 127, text: "I like positions where I can take charge and make decisions.", section: "R", scale: "R_ENTERPRISING" },
  { id: 128, text: "I enjoy organising information, files or records.", section: "R", scale: "R_CONVENTIONAL" },
  { id: 129, text: "I like working with numbers, lists or schedules.", section: "R", scale: "R_CONVENTIONAL" },
  { id: 130, text: "I prefer tasks with clear rules, procedures and structures.", section: "R", scale: "R_CONVENTIONAL" },
  { id: 131, text: "I would enjoy a job that involves accuracy and attention to detail.", section: "R", scale: "R_CONVENTIONAL" },
  { id: 132, text: "I feel satisfied when I can keep things neat, ordered and under control.", section: "R", scale: "R_CONVENTIONAL" },
];

const sectionTitles: Record<SectionId, string> = {
  A: "Section A – Interests",
  B: "Section B – Personality / Work Style",
  C: "Section C – Values",
  D: "Section D – Strengths / Abilities",
  E: "Section E – Work Environment Preferences",
  R: "Section R – RIASEC Career Interests",
};

function computeScaleScores(answers: AnswersState): ScaleScores {
  const scaleAccum: { [k in ScaleId]?: { sum: number; count: number } } = {};

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined) continue;

    const value = q.reverse ? 6 - raw : raw;

    if (!scaleAccum[q.scale]) {
      scaleAccum[q.scale] = { sum: 0, count: 0 };
    }
    scaleAccum[q.scale]!.sum += value;
    scaleAccum[q.scale]!.count += 1;
  }

  const scores: ScaleScores = {};
  (Object.keys(scaleAccum) as ScaleId[]).forEach((scaleId) => {
    const data = scaleAccum[scaleId]!;
    scores[scaleId] = {
      rawSum: data.sum,
      itemCount: data.count,
      average: data.sum / data.count,
    };
  });

  return scores;
}

function getRiaSecCode(scores: ScaleScores): string {
  const mapping: { scale: ScaleId; letter: RiaSecLetter }[] = [
    { scale: "R_REALISTIC", letter: "R" },
    { scale: "R_INVESTIGATIVE", letter: "I" },
    { scale: "R_ARTISTIC", letter: "A" },
    { scale: "R_SOCIAL", letter: "S" },
    { scale: "R_ENTERPRISING", letter: "E" },
    { scale: "R_CONVENTIONAL", letter: "C" },
  ];

  const list = mapping
    .map(({ scale, letter }) => {
      const s = scores[scale];
      if (!s) return null;
      return { letter, avg: s.average };
    })
    .filter((x): x is { letter: RiaSecLetter; avg: number } => !!x)
    .sort((a, b) => b.avg - a.avg);

  return list.slice(0, 3).map((x) => x.letter).join("");
}

export function CareerAssessment({
  onClose,
  email = '',
  customerName = '',
  franchiseOwnerId = null,
  couponId = null
}: CareerAssessmentProps) {
  const [currentSection, setCurrentSection] = useState<SectionId>("A");
  const [answers, setAnswers] = useState<AnswersState>({});
  const [customerInfo, setCustomerInfo] = useState({
    name: customerName,
    email: email,
    age: '',
    grade: ''
  });
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riaSecCode, setRiaSecCode] = useState('');

  const sections: SectionId[] = ["A", "B", "C", "D", "E", "R"];
  const currentSectionIndex = sections.indexOf(currentSection);

  const sectionQuestions = useMemo(
    () => questions.filter(q => q.section === currentSection),
    [currentSection]
  );

  const answeredInSection = sectionQuestions.filter(q => answers[q.id] !== undefined).length;
  const progress = (answeredInSection / sectionQuestions.length) * 100;

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSection(sections[currentSectionIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSection(sections[currentSectionIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered || !customerInfo.name || !customerInfo.email) {
      alert('Please complete all questions and provide your information');
      return;
    }

    setIsSubmitting(true);

    try {
      const scores = computeScaleScores(answers);
      const riaSecCode = getRiaSecCode(scores);

      const { data, error } = await supabase
        .from('self_assessment_responses')
        .insert({
          assessment_type: 'teen-career',
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          status: 'completed',
          entry_type: franchiseOwnerId ? 'coach_link' : 'random_visitor',
          franchise_owner_id: franchiseOwnerId,
          coupon_id: couponId,
          answers: answers,
          analysis_results: {
            scores,
            riaSecCode,
            overallScore: 0,
            metadata: {
              age: customerInfo.age,
              grade: customerInfo.grade
            }
          },
          completed_at: new Date().toISOString(),
          current_question: 132,
          last_activity_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (couponId) {
        await supabase
          .from('coupon_redemptions')
          .update({ response_id: data.id })
          .eq('coupon_id', couponId)
          .eq('user_email', customerInfo.email);

        await supabase
          .from('coupon_codes')
          .update({
            is_active: false,
            current_uses: 1
          })
          .eq('id', couponId);
      }

      setRiaSecCode(riaSecCode);
      setShowResults(true);
    } catch (error) {
      console.error('Error saving assessment:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Error saving your assessment. Please try again.\n\nDetails: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative my-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-[#0A2A5E] mb-4">Assessment Complete!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for completing the Career Direction Assessment.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                Your results have been saved and your coach will review them with you.
              </p>
              <p className="text-green-700 text-sm mt-2">
                Email: <strong>{customerInfo.email}</strong>
              </p>
            </div>
            {riaSecCode && (
              <p className="text-sm text-gray-600">
                Your RIASEC career profile code is: <strong className="text-[#667eea] text-lg">{riaSecCode}</strong>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Your coach will discuss your complete profile, including career field matches and personalized recommendations.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-[#0A2A5E] text-white px-8 py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-400 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-8 rounded-t-2xl">
          <h1 className="text-3xl font-bold mb-2">Career Direction Assessment</h1>
          <p className="text-white/90">Discover your career interests and work style preferences</p>
        </div>

        {currentSectionIndex === 0 && (
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-lg font-bold text-[#0A2A5E] mb-4">Your Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Age (optional)"
                value={customerInfo.age}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, age: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Grade (optional)"
                value={customerInfo.grade}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, grade: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#667eea]">
              {sectionTitles[currentSection]}
            </span>
            <span className="text-sm text-gray-600">
              {answeredInSection} / {sectionQuestions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-2 mt-4">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setCurrentSection(sec)}
                className={`flex-1 py-2 text-xs font-medium rounded ${
                  sec === currentSection
                    ? 'bg-[#667eea] text-white'
                    : questions.filter(q => q.section === sec).every(q => answers[q.id] !== undefined)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 py-4 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-800">
            {currentSection === "R"
              ? "For RIASEC questions: No = 0, Maybe = 1, Yes = 2"
              : "Rate each statement: 1 = Strongly disagree, 2 = Disagree, 3 = Not sure, 4 = Agree, 5 = Strongly agree"
            }
          </p>
        </div>

        <div className="p-8 max-h-[50vh] overflow-y-auto">
          <div className="space-y-6">
            {sectionQuestions.map((q) => {
              const isRiaSec = q.section === "R";
              const values = isRiaSec ? [0, 1, 2] : [1, 2, 3, 4, 5];
              const labels = isRiaSec ? ["No", "Maybe", "Yes"] : ["1", "2", "3", "4", "5"];

              return (
                <div key={q.id} className="pb-4 border-b border-gray-100">
                  <p className="text-gray-800 mb-3">
                    <span className="font-bold text-[#667eea]">{q.id}.</span> {q.text}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {values.map((value, idx) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(q.id, value)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          answers[q.id] === value
                            ? 'border-[#667eea] bg-[#667eea] text-white'
                            : 'border-gray-200 hover:border-[#667eea]/50'
                        }`}
                      >
                        {labels[idx]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-between items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-[#667eea] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          <div className="text-center text-sm text-gray-600">
            Section {currentSectionIndex + 1} of {sections.length}
          </div>

          {currentSectionIndex < sections.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={answeredInSection < sectionQuestions.length}
              className="flex items-center gap-2 px-6 py-3 bg-[#667eea] text-white rounded-lg hover:bg-[#764ba2] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting || !customerInfo.name || !customerInfo.email}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Complete Assessment
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
