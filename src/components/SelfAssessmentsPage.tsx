// Self-assessments with mandatory payment gateway
import { useState } from 'react';
import { Briefcase, Users, Brain, Heart, ArrowRight, X, CheckCircle, Clock, Ticket, RotateCcw, UserCheck, GraduationCap, UserPlus, Shield } from 'lucide-react';
import { selfAssessmentTypes } from '../data/selfAssessmentQuestions';
import { SelfAssessmentQuestionnaire } from './SelfAssessmentQuestionnaire';
import NIP3Assessment from './NIP3Assessment';
import { CouponRedemption } from './CouponRedemption';
import { CareerAssessment } from './CareerAssessment';
import ADHD710Assessment from './ADHD710Assessment';
import ADHD1118Assessment from './ADHD1118Assessment';
import TraumaScanAssessment from './TraumaScanAssessment';
import { supabase } from '../lib/supabase';

interface SelfAssessmentsPageProps {
  onClose: () => void;
  onStartPayment?: (paymentType: 'nipa' | 'tcf' | 'tadhd') => void;
}

export function SelfAssessmentsPage({ onClose, onStartPayment }: SelfAssessmentsPageProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<typeof selfAssessmentTypes[0] | null>(null);
  const [selectedNIPA, setSelectedNIPA] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeEmail, setResumeEmail] = useState('');
  const [checkingProgress, setCheckingProgress] = useState(false);
  const [noProgressFound, setNoProgressFound] = useState(false);
  const [startQuestionnaire, setStartQuestionnaire] = useState(false);
  const [startNIPAQuestionnaire, setStartNIPAQuestionnaire] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<{
    assessmentType: typeof selfAssessmentTypes[0];
    email: string;
    franchiseOwnerId: string;
    couponId?: string;
  } | null>(null);
  const [nipaQuestionnaireData, setNipaQuestionnaireData] = useState<{
    email: string;
    franchiseOwnerId: string;
    responseId: string;
  } | null>(null);
  const [startCareerAssessment, setStartCareerAssessment] = useState(false);
  const [careerAssessmentData, setCareerAssessmentData] = useState<{
    email: string;
    customerName: string;
    franchiseOwnerId: string;
    couponId?: string;
  } | null>(null);
  const [startADHD710Assessment, setStartADHD710Assessment] = useState(false);
  const [adhd710AssessmentData, setADHD710AssessmentData] = useState<{
    assessmentId?: string;
    respondentType: 'parent' | 'caregiver';
  } | null>(null);
  const [selectedADHD710, setSelectedADHD710] = useState(false);
  const [selectedADHD1118, setSelectedADHD1118] = useState(false);
  const [startADHD1118Assessment, setStartADHD1118Assessment] = useState(false);
  const [adhd1118AssessmentData, setADHD1118AssessmentData] = useState<{
    assessmentId?: string;
    respondentType: 'teen';
  } | null>(null);
  const [selectedTraumaScan, setSelectedTraumaScan] = useState(false);
  const [startTraumaScanAssessment, setStartTraumaScanAssessment] = useState(false);
  const [traumaScanAssessmentData, setTraumaScanAssessmentData] = useState<{
    email: string;
    customerName: string;
    couponId?: string;
  } | null>(null);

  const handleCouponRedemption = (
    assessmentType: string,
    couponId: string,
    franchiseOwnerId: string,
    userName: string,
    userEmail: string
  ) => {
    setShowCouponModal(false);

    // Build dynamic mapping from assessment names to IDs
    const assessmentNameMap: Record<string, string> = {
      'Full Assessment (343 Questions)': 'nipa',
      'Full ADHD Assessment (128 Questions)': 'nipa',
      'Teen Career & Future Direction': 'teen-career',
      'ADHD 7-10 Assessment (80 Questions)': 'adhd710',
      'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)': 'adhd710',
      'ADHD 11-18 Assessment (50 Questions)': 'adhd1118',
      'Trauma & Loss Impact Assessment (Adult 15+)': 'trauma-scan',
      'nipa': 'nipa',
      'tadhd': 'adhd1118',
      'tcf': 'teen-career',
      'trauma-scan': 'trauma-scan'
    };

    // Dynamically add all self-assessments from the data file
    selfAssessmentTypes.forEach(assessment => {
      const key = `${assessment.name} (${assessment.questions.length} Questions)`;
      assessmentNameMap[key] = assessment.id;
    });

    const assessmentId = assessmentNameMap[assessmentType] || assessmentType;

    if (assessmentId === 'nipa') {
      if (onStartPayment) {
        onStartPayment('nipa');
      }
    } else if (assessmentId === 'teen-career') {
      setCareerAssessmentData({
        email: userEmail,
        customerName: userName,
        franchiseOwnerId: franchiseOwnerId,
        couponId: couponId
      });
      setStartCareerAssessment(true);
    } else if (assessmentId === 'adhd710') {
      setADHD710AssessmentData({
        respondentType: 'parent'
      });
      setStartADHD710Assessment(true);
    } else if (assessmentId === 'adhd1118') {
      setADHD1118AssessmentData({
        respondentType: 'teen'
      });
      setStartADHD1118Assessment(true);
    } else if (assessmentId === 'trauma-scan') {
      setTraumaScanAssessmentData({
        email: userEmail,
        customerName: userName,
        couponId: couponId
      });
      setStartTraumaScanAssessment(true);
    } else {
      const selectedAssessment = selfAssessmentTypes.find(type => type.id === assessmentId);

      if (selectedAssessment) {
        setQuestionnaireData({
          assessmentType: selectedAssessment,
          email: userEmail,
          franchiseOwnerId: franchiseOwnerId,
          couponId: couponId
        });
        setStartQuestionnaire(true);
      }
    }
  };

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingProgress(true);
    setNoProgressFound(false);

    const { data: existingResponse, error } = await supabase
      .from('responses')
      .select('*')
      .eq('customer_email', resumeEmail)
      .eq('status', 'in_progress')
      .is('parent_response_id', null)
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setCheckingProgress(false);

    if (error) {
      console.error('Error checking for progress:', error);
      alert('Error checking for saved progress. Please try again.');
      return;
    }

    if (existingResponse) {
      // Build dynamic mapping from assessment IDs to assessment objects
      const assessmentTypeMap: Record<string, typeof selfAssessmentTypes[0]> = {};
      selfAssessmentTypes.forEach(assessment => {
        assessmentTypeMap[assessment.id] = assessment;
      });

      const mappedAssessment = assessmentTypeMap[existingResponse.assessment_type];

      if (mappedAssessment) {
        setShowResumeModal(false);
        setShowChoiceModal(false);
        setQuestionnaireData({
          assessmentType: mappedAssessment,
          email: resumeEmail,
          franchiseOwnerId: existingResponse.franchise_owner_id || ''
        });
        setStartQuestionnaire(true);
      } else if (existingResponse.assessment_type === 'career') {
        setShowResumeModal(false);
        setShowChoiceModal(false);
        setCareerAssessmentData({
          email: resumeEmail,
          customerName: existingResponse.customer_name || '',
          franchiseOwnerId: existingResponse.franchise_owner_id || '',
          couponId: existingResponse.coupon_id || undefined
        });
        setStartCareerAssessment(true);
      } else {
        setShowResumeModal(false);
        setShowChoiceModal(false);
        setNipaQuestionnaireData({
          email: resumeEmail,
          franchiseOwnerId: existingResponse.franchise_owner_id || '',
          responseId: existingResponse.id
        });
        setStartNIPAQuestionnaire(true);
      }
    } else {
      setNoProgressFound(true);
    }
  };

  const nipaCard = {
    id: 'nipa',
    name: 'NIP - Full Neural Imprint Assessment',
    description: 'This is our comprehensive client assessment with 344 in-depth questions. NIP provides a complete analysis of your cognitive patterns, emotional responses, behavioral tendencies, and life experiences across all 20 Neural Imprint Patterns. This flagship assessment includes a <strong>FREE (45-minute) On-Line debrief</strong> to help you understand and apply your results.',
    icon: Brain,
    color: 'from-[#0A2A5E] to-[#3DB3E3]',
    iconColor: 'text-[#0A2A5E]',
    borderColor: 'border-[#0A2A5E]',
    bgColor: 'bg-[#0A2A5E]/10',
    targetAudience: 'Adults & Teens 16+',
    questionCount: 344,
    price: 'R5',
    assessmentType: 'Full Client Assessment',
    features: [
      'Full 344-question comprehensive assessment',
      '<strong>FREE (45-minute) On-Line debrief</strong>',
      'Complete profile across all 20 patterns',
      'Two-round assessment process',
      'Detailed personalized recommendations',
      'In-depth cognitive & emotional insights'
    ],
    instructions: 'This is a comprehensive two-round assessment. Round 1 includes 343 questions covering all aspects of your neural imprint patterns. Round 2 focuses on deeper analysis. The full assessment typically takes 60-90 minutes. You can save your progress and return at any time. After completion, you will receive a detailed report and a FREE (45-minute) On-Line debrief with a qualified practitioner.',
    disclaimer: 'This is a self-reflection and coaching tool, not a clinical diagnostic instrument. It is designed to support personal growth and self-awareness through professional guidance.'
  };

  const adhd710Card = {
    id: 'adhd710',
    name: 'Parent/Caregiver ADHD 7-10 Assessment',
    description: 'Advanced dual-respondent ADHD assessment for children aged 7-10 using Neural Imprint Pattern (NIPP) analysis. Requires input from BOTH parent AND teacher to provide comprehensive behavioral analysis across 10 distinct patterns covering attention, hyperactivity, impulsivity, executive function, emotional regulation, social skills, academic performance, and daily functioning. Includes a <strong>FREE (30-minute) On-Line debrief</strong>.',
    icon: GraduationCap,
    color: 'from-indigo-500 to-purple-600',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-500',
    bgColor: 'bg-indigo-50',
    targetAudience: 'Children (Ages 7-10)',
    questionCount: 80,
    price: 'R5',
    assessmentType: 'NIPP ADHD Dual Assessment',
    features: [
      'Dual-respondent system (parent + teacher)',
      '80 comprehensive questions across 10 NIPP patterns',
      'Individual reports with pattern-specific analysis',
      'Comprehensive combined report with NIPP scoring',
      '<strong>FREE (30-minute) On-Line debrief</strong>',
      'Severity ratings per neural imprint pattern',
      'Pattern-based intervention recommendations',
      'Home vs. school behavior comparison charts',
      'Detailed NIPP pattern explanations'
    ],
    instructions: 'This assessment requires TWO separate completions: one by a parent/guardian and one by a teacher. Each person answers 80 questions (10 per pattern category) based on their observations. Both assessments must be completed to generate the full comprehensive report with NIPP analysis. Each assessment takes approximately 20-25 minutes. Includes a FREE (30-minute) On-Line debrief.',
    disclaimer: 'This is a screening tool using Neural Imprint Pattern analysis for identifying ADHD-related behavioral patterns. It does NOT constitute a clinical diagnosis. Only qualified healthcare professionals can diagnose ADHD through comprehensive clinical evaluation.'
  };

  const adhd1118Card = {
    id: 'adhd1118',
    name: 'ADHD 11-18 Assessment',
    description: 'A comprehensive ADHD self-assessment for teens aged 11-18 years. This evaluation uses 10 Neural Imprint Patterns to identify core ADHD symptoms (focus, organization, hyperactivity, impulsivity) and emotional impact patterns (anger, self-perception, resistance, burnout). The teen completes this assessment themselves, reflecting on their own experiences and behaviors. Includes a <strong>FREE (30-minute) On-Line debrief</strong>.',
    icon: UserPlus,
    color: 'from-violet-500 to-fuchsia-600',
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-500',
    bgColor: 'bg-violet-50',
    targetAudience: 'Teens (Ages 11-18)',
    questionCount: 50,
    price: 'R5',
    assessmentType: 'Teen ADHD Self-Assessment',
    features: [
      'Teen self-assessment (no parent input required)',
      '50 questions across 10 Neural Imprint Patterns',
      'Core ADHD patterns analysis',
      'Emotional impact patterns identified',
      'Personalized report with pattern-specific insights',
      '<strong>FREE (30-minute) On-Line debrief</strong>',
      'Age-appropriate language for teens',
      'Severity ratings per neural imprint pattern',
      'Actionable recommendations for support'
    ],
    instructions: 'This is a self-assessment designed for teens aged 11-18 to complete independently. You will answer 50 questions about your own experiences, behaviors, and feelings. The assessment covers 10 different pattern areas and takes approximately 15-20 minutes. Be honest in your responses for the most accurate results. You will receive a detailed report and a FREE (30-minute) On-Line debrief upon completion.',
    disclaimer: 'This is a screening tool using Neural Imprint Pattern analysis for identifying ADHD-related behavioral patterns in teens. It does NOT constitute a clinical diagnosis. Only qualified healthcare professionals can diagnose ADHD through comprehensive clinical evaluation.'
  };

  const traumaScanCard = {
    id: 'trauma-scan',
    name: 'Trauma & Loss Impact Assessment',
    description: 'A comprehensive self-assessment for adults (15+) experiencing the impact of trauma or significant loss. This evaluation uses 20 specialized patterns to identify stress responses, emotional regulation challenges, and coping mechanisms. Designed for coaching and support planning after difficult life events. Includes detailed client and coach reports with actionable next steps, plus a FREE 30-minute online debrief session.',
    icon: Shield,
    color: 'from-teal-500 to-cyan-600',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-500',
    bgColor: 'bg-teal-50',
    targetAudience: 'Adults (Ages 15+)',
    questionCount: 50,
    price: 'R5',
    assessmentType: 'Trauma & Loss Impact',
    features: [
      'Self-assessment for post-trauma support',
      '50 questions across 20 trauma/loss response patterns',
      'Safety flag system for high distress detection',
      'Zone-based scoring (Green/Amber/Red)',
      'Comprehensive client report with top 5 patterns',
      'Detailed coach report with intervention guidance',
      'FREE 30-minute online debrief session included',
      'Non-diagnostic coaching tool',
      'Pattern-specific next steps and recommendations',
      'Suitable after loss, crisis, or difficult life events'
    ],
    instructions: 'This assessment helps identify patterns that may be affecting you after a traumatic event or significant loss. You will answer 50 questions about your experiences based on the past 2 weeks or since the incident. The assessment takes approximately 15-20 minutes. Be honest in your responses for accurate results. You will receive a client report immediately, a comprehensive coach report will be sent to your support team, and a FREE 30-minute online debrief session.',
    disclaimer: 'This is a self-reflection tool for coaching and support planning, NOT a clinical diagnostic instrument. It does not replace professional mental health care. If you are experiencing severe distress, please seek immediate professional help.'
  };

  const assessmentCards = [
    {
      type: 'nipa',
      ...nipaCard
    },
    {
      type: selfAssessmentTypes[0],
      icon: Briefcase,
      color: 'from-amber-500 to-orange-500',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50',
      targetAudience: 'Teens & Young Adults (Ages 15-25)',
      price: 'R5',
      features: [
        'Neural Imprint Patterns + RIASEC interests',
        'Real workplace scenario questions',
        '360° view of career fit',
        'Detailed client & coach reports',
        '<strong>FREE (30-minute) On-Line debrief</strong>',
        'Study & career path guidance'
      ]
    },
    {
      type: 'adhd710',
      ...adhd710Card
    },
    {
      type: 'adhd1118',
      ...adhd1118Card
    },
    {
      type: 'trauma-scan',
      ...traumaScanCard
    }
  ];

  // Show ADHD710 assessment
  if (startADHD710Assessment && adhd710AssessmentData) {
    return (
      <ADHD710Assessment
        assessmentId={adhd710AssessmentData.assessmentId}
        respondentType={adhd710AssessmentData.respondentType}
        onComplete={() => {
          setStartADHD710Assessment(false);
          setADHD710AssessmentData(null);
        }}
      />
    );
  }

  // Show ADHD1118 assessment
  if (startADHD1118Assessment && adhd1118AssessmentData) {
    return (
      <ADHD1118Assessment
        assessmentId={adhd1118AssessmentData.assessmentId}
        respondentType={adhd1118AssessmentData.respondentType}
        onComplete={() => {
          setStartADHD1118Assessment(false);
          setADHD1118AssessmentData(null);
        }}
      />
    );
  }

  // Show Trauma Scan assessment
  if (startTraumaScanAssessment && traumaScanAssessmentData) {
    return (
      <TraumaScanAssessment
        couponCode={traumaScanAssessmentData.couponId}
        prefillData={{
          name: traumaScanAssessmentData.customerName,
          email: traumaScanAssessmentData.email
        }}
      />
    );
  }

  // Show questionnaire after coupon redemption
  if (startQuestionnaire && questionnaireData) {
    return (
      <SelfAssessmentQuestionnaire
        onClose={onClose}
        assessmentType={questionnaireData.assessmentType}
        coachLink=""
        email={questionnaireData.email}
        franchiseOwnerId={questionnaireData.franchiseOwnerId}
        couponId={questionnaireData.couponId || null}
      />
    );
  }

  // Show career assessment after coupon redemption or resume
  if (startCareerAssessment && careerAssessmentData) {
    return (
      <CareerAssessment
        onClose={onClose}
        email={careerAssessmentData.email}
        customerName={careerAssessmentData.customerName}
        franchiseOwnerId={careerAssessmentData.franchiseOwnerId}
        couponId={careerAssessmentData.couponId || null}
      />
    );
  }

  // Show NIPA questionnaire when resuming
  if (startNIPAQuestionnaire && nipaQuestionnaireData) {
    return (
      <NIP3Assessment
        onClose={onClose}
      />
    );
  }

  // Show detailed NIPA assessment info page
  if (selectedNIPA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
        <div className="container mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedNIPA(false)}
            className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${nipaCard.color} rounded-3xl p-8 text-white mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <nipaCard.icon size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{nipaCard.name}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-[#0A2A5E]">
                      Full Client Assessment
                    </span>
                    <span className="flex items-center gap-1 text-white/90">
                      <Clock size={16} />
                      {nipaCard.questionCount} questions
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {nipaCard.targetAudience}
                    </span>
                    <span className="px-3 py-1 bg-[#1FAFA3] rounded-full text-sm font-bold">
                      {nipaCard.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">About This Assessment</h2>
              <p
                className="text-gray-700 text-lg leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: nipaCard.description }}
              />

              <div className="bg-gradient-to-r from-[#0A2A5E]/10 to-[#3DB3E3]/10 border-2 border-[#0A2A5E]/30 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-2 flex items-center gap-2">
                  <Heart size={20} className="text-[#0A2A5E]" />
                  What Makes NIPA Different?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>NIPA is our flagship client assessment</strong> — not a brief self-assessment. While the coach assessments above (48-60 questions) provide focused insights for specific areas, NIPA offers a comprehensive two-round evaluation covering all 20 Neural Imprint Patterns. You'll receive a detailed professional report and a 45-minute one-on-one debrief session to help you understand and apply your results to your life.
                </p>
              </div>

              <div className={`${nipaCard.bgColor} border ${nipaCard.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#1FAFA3]" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {nipaCard.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#1FAFA3] mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: feature }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">How to Answer</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {nipaCard.instructions}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">Important Disclaimer</h3>
                <p className="text-gray-700">
                  {nipaCard.disclaimer}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedNIPA(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg"
                  >
                    Back to Assessments
                  </button>
                  <button
                    onClick={() => {
                      if (onStartPayment) {
                        onStartPayment('nipa');
                      }
                    }}
                    className={`flex-1 bg-gradient-to-r ${nipaCard.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
                  >
                    Proceed to Payment
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <button
                  onClick={() => setShowChoiceModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group"
                >
                  <Ticket size={20} />
                  Have a Coupon Code? / Resume My Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {showChoiceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowChoiceModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Choose an Option</h2>
                <p className="text-gray-600 mb-6">
                  Select what you'd like to do
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowCouponModal(true);
                    }}
                    className="w-full p-4 border-2 border-green-500 rounded-lg hover:bg-green-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Ticket className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-[#0A2A5E]">Redeem Coupon Code</h3>
                        <p className="text-sm text-gray-600">Enter your free access code</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowResumeModal(true);
                    }}
                    className="w-full p-4 border-2 border-orange-500 rounded-lg hover:bg-orange-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-[#0A2A5E]">Resume My Test</h3>
                        <p className="text-sm text-gray-600">Continue from where you left off</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResumeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setNoProgressFound(false);
                  setResumeEmail('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Resume Assessment</h2>
                <p className="text-gray-600 mb-6">
                  Enter your email to find your saved progress
                </p>

                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resumeEmail}
                      onChange={(e) => setResumeEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                      required
                    />
                  </div>

                  {noProgressFound && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-sm">
                      No in-progress assessment found for this email. Please start a new assessment.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!resumeEmail.trim() || checkingProgress}
                    className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-colors font-medium"
                  >
                    {checkingProgress ? 'Checking...' : 'Find My Assessment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {showCouponModal && (
          <CouponRedemption
            onRedemptionSuccess={handleCouponRedemption}
            onCancel={() => setShowCouponModal(false)}
          />
        )}
      </div>
    );
  }

  // Show detailed assessment info page
  if (selectedAssessment) {
    const card = assessmentCards.find(c => typeof c.type !== 'string' && c.type.id === selectedAssessment.id)!;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
        <div className="container mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedAssessment(null)}
            className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${card.color} rounded-3xl p-8 text-white mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <card.icon size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{selectedAssessment.name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-white/90">
                      <Clock size={16} />
                      {selectedAssessment.questionCount || selectedAssessment.questions.length} questions
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {card.targetAudience}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">About This Assessment</h2>
              <p
                className="text-gray-700 text-lg leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: selectedAssessment.description }}
              />

              <div className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#1FAFA3]" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#1FAFA3] mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: feature }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">How to Answer</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {selectedAssessment.instructions}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">Important Disclaimer</h3>
                <p className="text-gray-700">
                  {selectedAssessment.disclaimer}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedAssessment(null)}
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg"
                  >
                    Back to Assessments
                  </button>
                  <button
                    onClick={() => {
                      const paymentTypeMap: Record<string, 'tadhd' | 'tcf'> = {
                        'teen-adhd': 'tadhd',
                        'teen-career': 'tcf'
                      };
                      const paymentType = paymentTypeMap[selectedAssessment.id];
                      if (onStartPayment) {
                        onStartPayment(paymentType);
                      }
                    }}
                    className={`flex-1 bg-gradient-to-r ${card.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
                  >
                    Proceed to Payment
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <button
                  onClick={() => setShowChoiceModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group"
                >
                  <Ticket size={20} />
                  Have a Coupon Code? / Resume My Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {showChoiceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowChoiceModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Choose an Option</h2>
                <p className="text-gray-600 mb-6">
                  Select what you'd like to do
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowCouponModal(true);
                    }}
                    className="w-full p-4 border-2 border-green-500 rounded-lg hover:bg-green-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Ticket className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-[#0A2A5E]">Redeem Coupon Code</h3>
                        <p className="text-sm text-gray-600">Enter your free access code</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowResumeModal(true);
                    }}
                    className="w-full p-4 border-2 border-orange-500 rounded-lg hover:bg-orange-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-[#0A2A5E]">Resume My Test</h3>
                        <p className="text-sm text-gray-600">Continue from where you left off</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResumeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setNoProgressFound(false);
                  setResumeEmail('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Resume Assessment</h2>
                <p className="text-gray-600 mb-6">
                  Enter your email to find your saved progress
                </p>

                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resumeEmail}
                      onChange={(e) => setResumeEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                      required
                    />
                  </div>

                  {noProgressFound && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-sm">
                      No in-progress assessment found for this email. Please start a new assessment.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!resumeEmail.trim() || checkingProgress}
                    className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-colors font-medium"
                  >
                    {checkingProgress ? 'Checking...' : 'Find My Assessment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {showCouponModal && (
          <CouponRedemption
            onRedemptionSuccess={handleCouponRedemption}
            onCancel={() => setShowCouponModal(false)}
          />
        )}
      </div>
    );
  }

  // Show detailed ADHD710 assessment info page
  if (selectedADHD710) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
        <div className="container mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedADHD710(false)}
            className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${adhd710Card.color} rounded-3xl p-8 text-white mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <adhd710Card.icon size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{adhd710Card.name}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-indigo-700">
                      NIPP Analysis
                    </span>
                    <span className="flex items-center gap-1 text-white/90">
                      <Clock size={16} />
                      {adhd710Card.questionCount} questions per respondent
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {adhd710Card.targetAudience}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">About This Assessment</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {adhd710Card.description}
              </p>

              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                  <Heart size={20} className="text-indigo-700" />
                  What Makes This Assessment Different?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Advanced NIPP Analysis</strong> — This assessment uses Neural Imprint Pattern methodology to analyze behaviors across 10 distinct patterns, providing deeper insights than traditional ADHD screening tools. The dual-respondent approach captures behavioral variations across different environments (home vs. school), essential for comprehensive ADHD evaluation in school-age children.
                </p>
              </div>

              <div className={`${adhd710Card.bgColor} border ${adhd710Card.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-indigo-600" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-1 gap-3">
                  {adhd710Card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-indigo-600 mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: feature }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-indigo-700 mb-3">How It Works</h3>
                <div className="text-gray-700 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <strong>Parent completes:</strong> Answer 80 questions based on observations at home across 10 NIPP categories
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <strong>Invite teacher:</strong> Provide teacher contact info and we'll send them a unique access code
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <strong>Teacher completes:</strong> Teacher answers the same 80 questions from school perspective
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <strong>Get comprehensive report:</strong> View individual reports plus combined NIPP analysis comparing both perspectives
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic mt-4">
                    {adhd710Card.instructions}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-indigo-700 mb-3">Important Disclaimer</h3>
                <p className="text-gray-700">
                  {adhd710Card.disclaimer}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedADHD710(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg"
                  >
                    Back to Assessments
                  </button>
                  <button
                    onClick={() => {
                      if (onStartPayment) {
                        onStartPayment('tadhd');
                      }
                    }}
                    className={`flex-1 bg-gradient-to-r ${adhd710Card.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
                  >
                    Proceed to Payment
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <button
                  onClick={() => setShowChoiceModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group"
                >
                  <Ticket size={20} />
                  Have a Coupon Code? / Resume My Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {showChoiceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowChoiceModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-indigo-700 mb-2">Choose an Option</h2>
                <p className="text-gray-600 mb-6">
                  Select what you'd like to do
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowCouponModal(true);
                    }}
                    className="w-full p-4 border-2 border-green-500 rounded-lg hover:bg-green-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Ticket className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-indigo-700">Redeem Coupon Code</h3>
                        <p className="text-sm text-gray-600">Enter your free access code</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowResumeModal(true);
                    }}
                    className="w-full p-4 border-2 border-orange-500 rounded-lg hover:bg-orange-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-indigo-700">Resume My Test</h3>
                        <p className="text-sm text-gray-600">Continue from where you left off</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResumeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setNoProgressFound(false);
                  setResumeEmail('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-indigo-700 mb-2">Resume ADHD710 Assessment</h2>
                <p className="text-gray-600 mb-6">
                  Enter your email to find your saved assessment
                </p>

                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resumeEmail}
                      onChange={(e) => setResumeEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {noProgressFound && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-sm">
                      No in-progress ADHD710 assessment found for this email. Please start a new assessment.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!resumeEmail.trim() || checkingProgress}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {checkingProgress ? 'Checking...' : 'Find My Assessment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {showCouponModal && (
          <CouponRedemption
            onRedemptionSuccess={handleCouponRedemption}
            onCancel={() => setShowCouponModal(false)}
          />
        )}
      </div>
    );
  }

  // Show detailed ADHD1118 assessment info page
  if (selectedADHD1118) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
        <div className="container mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedADHD1118(false)}
            className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${adhd1118Card.color} rounded-3xl p-8 text-white mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <adhd1118Card.icon size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{adhd1118Card.name}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-violet-700">
                      Teen Self-Assessment
                    </span>
                    <span className="flex items-center gap-1 text-white/90">
                      <Clock size={16} />
                      {adhd1118Card.questionCount} questions
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {adhd1118Card.targetAudience}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-violet-700 mb-4">About This Assessment</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {adhd1118Card.description}
              </p>

              <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-2 border-violet-500/30 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-violet-700 mb-2 flex items-center gap-2">
                  <Heart size={20} className="text-violet-700" />
                  What Makes This Assessment Different?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Teen-Focused NIPP Analysis</strong> — This assessment is specifically designed for teens to complete themselves, using Neural Imprint Pattern methodology to analyze ADHD-related behaviors across 10 distinct patterns. Unlike parent-only assessments, this captures the teen's own perspective on their experiences with focus, organization, impulse control, and emotional regulation.
                </p>
              </div>

              <div className={`${adhd1118Card.bgColor} border ${adhd1118Card.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-violet-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-violet-600" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-1 gap-3">
                  {adhd1118Card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-violet-600 mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: feature }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-violet-700 mb-3">How It Works</h3>
                <div className="text-gray-700 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <strong>Teen completes the assessment:</strong> Answer 50 questions honestly about your own experiences and behaviors
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <strong>Covers 10 NIPP patterns:</strong> Questions assess focus, organization, hyperactivity, impulsivity, anger management, self-perception, resistance, and burnout
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <strong>Get your personal report:</strong> Receive detailed analysis with severity ratings and recommendations
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic mt-4">
                    {adhd1118Card.instructions}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-violet-700 mb-3">Important Disclaimer</h3>
                <p className="text-gray-700">
                  {adhd1118Card.disclaimer}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedADHD1118(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg"
                  >
                    Back to Assessments
                  </button>
                  <button
                    onClick={() => {
                      if (onStartPayment) {
                        onStartPayment('tadhd');
                      }
                    }}
                    className={`flex-1 bg-gradient-to-r ${adhd1118Card.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
                  >
                    Proceed to Payment
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <button
                  onClick={() => setShowChoiceModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group"
                >
                  <Ticket size={20} />
                  Have a Coupon Code? / Resume My Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {showChoiceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowChoiceModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-violet-700 mb-2">Choose an Option</h2>
                <p className="text-gray-600 mb-6">
                  Select what you'd like to do
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowCouponModal(true);
                    }}
                    className="w-full p-4 border-2 border-green-500 rounded-lg hover:bg-green-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Ticket className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-violet-700">Redeem Coupon Code</h3>
                        <p className="text-sm text-gray-600">Enter your free access code</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowChoiceModal(false);
                      setShowResumeModal(true);
                    }}
                    className="w-full p-4 border-2 border-orange-500 rounded-lg hover:bg-orange-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                      <div>
                        <h3 className="font-bold text-violet-700">Resume My Test</h3>
                        <p className="text-sm text-gray-600">Continue from where you left off</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResumeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setNoProgressFound(false);
                  setResumeEmail('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="pt-4">
                <h2 className="text-3xl font-bold text-violet-700 mb-2">Resume ADHD 11-18 Assessment</h2>
                <p className="text-gray-600 mb-6">
                  Enter your email to find your saved assessment
                </p>

                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resumeEmail}
                      onChange={(e) => setResumeEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {noProgressFound && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-sm">
                      No in-progress ADHD 11-18 assessment found for this email. Please start a new assessment.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!resumeEmail.trim() || checkingProgress}
                    className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {checkingProgress ? 'Checking...' : 'Find My Assessment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {showCouponModal && (
          <CouponRedemption
            onRedemptionSuccess={handleCouponRedemption}
            onCancel={() => setShowCouponModal(false)}
          />
        )}
      </div>
    );
  }

  // Show detailed Trauma Scan assessment info page
  if (selectedTraumaScan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
        <div className="container mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedTraumaScan(false)}
            className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${traumaScanCard.color} rounded-3xl p-8 text-white mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <traumaScanCard.icon size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{traumaScanCard.name}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-teal-700">
                      {traumaScanCard.assessmentType}
                    </span>
                    <span className="flex items-center gap-1 text-white/90">
                      <Clock size={16} />
                      {traumaScanCard.questionCount} questions
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {traumaScanCard.targetAudience}
                    </span>
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-teal-700">
                      {traumaScanCard.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">About This Assessment</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {traumaScanCard.description}
              </p>

              <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/30 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-teal-700 mb-2 flex items-center gap-2">
                  <Heart size={20} className="text-teal-700" />
                  When to Use This Assessment
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>For Post-Trauma Support & Recovery</strong> — This assessment is designed for individuals who have experienced a traumatic event, significant loss, or major life crisis. It uses 20 specialized patterns to identify how stress, grief, and trauma may be affecting your daily functioning, emotional regulation, and overall well-being. This is a coaching tool to support your recovery journey, not a clinical diagnostic instrument.
                </p>
              </div>

              <div className={`${traumaScanCard.bgColor} border ${traumaScanCard.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-teal-600" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-1 gap-3">
                  {traumaScanCard.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-teal-600 mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: feature }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-teal-700 mb-3">How It Works</h3>
                <div className="text-gray-700 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <strong>Complete the 50-question assessment:</strong> Answer questions about your experiences over the past 2 weeks or since the traumatic event
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <strong>Covers 20 trauma/loss patterns:</strong> Questions assess stress response, emotional regulation, sleep, relationships, coping mechanisms, and daily functioning
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <strong>Safety flag system:</strong> High distress indicators are automatically flagged for immediate attention
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <strong>Receive comprehensive reports:</strong> Client report shows your top 5 patterns; coach report includes detailed intervention guidance
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic mt-4">
                    {traumaScanCard.instructions}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                  <Shield size={20} className="text-red-600" />
                  Important Disclaimer
                </h3>
                <p className="text-gray-700 mb-3">
                  {traumaScanCard.disclaimer}
                </p>
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-3">
                  <p className="text-red-900 font-semibold">
                    Crisis Support: If you are experiencing severe distress, thoughts of self-harm, or a mental health emergency, please contact a crisis helpline or emergency services immediately. This assessment is not a substitute for emergency care.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedTraumaScan(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg"
                  >
                    Back to Assessments
                  </button>
                  <button
                    onClick={() => {
                      if (onStartPayment) {
                        onStartPayment('trauma-scan' as any);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group"
                  >
                    Proceed to Payment
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <button
                  onClick={() => setShowChoiceModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group"
                >
                  <Ticket size={20} />
                  Have a Coupon Code? / Resume My Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
      <div className="container mx-auto px-6 py-12">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
        >
          <X size={24} />
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-[#0A2A5E] mb-4">
              Self-Assessments
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our specialized assessments designed to help you understand your neural imprint patterns,
              career preferences, and personal development opportunities.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Showing {assessmentCards.length} assessments
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {assessmentCards.map((card, index) => {
              const isNIPA = card.type === 'nipa';
              const isADHD710 = card.type === 'adhd710';
              const isADHD1118 = card.type === 'adhd1118';
              const isTraumaScan = card.type === 'trauma-scan';
              const isSpecialType = isNIPA || isADHD710 || isADHD1118 || isTraumaScan;
              const cardData = isSpecialType ? card : { ...card, type: card.type as typeof selfAssessmentTypes[0] };

              return (
                <div
                  key={index}
                  className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2 ${card.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full`}
                >
                  <div className={`bg-gradient-to-r ${card.color} p-8 text-white min-h-[200px] flex items-center`}>
                    <div className="flex items-start gap-4 w-full">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex-shrink-0">
                        <card.icon size={48} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold mb-3">
                          {isSpecialType ? card.name : (typeof card.type === 'object' ? card.type.name : '')}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          {isNIPA && (
                            <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-[#0A2A5E] whitespace-nowrap">
                              Full Client Assessment
                            </span>
                          )}
                          {isADHD710 && (
                            <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-indigo-700 whitespace-nowrap">
                              Parent & Teacher
                            </span>
                          )}
                          {isADHD1118 && (
                            <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-violet-700 whitespace-nowrap">
                              Teen Self-Assessment
                            </span>
                          )}
                          {isTraumaScan && (
                            <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-teal-700 whitespace-nowrap">
                              Trauma & Loss Impact
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-white/90 whitespace-nowrap">
                            <Clock size={16} />
                            {isSpecialType ? card.questionCount : (typeof card.type === 'object' ? (card.type.questionCount || card.type.questions.length) : 0)} questions
                          </span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium whitespace-nowrap">
                            {card.targetAudience}
                          </span>
                          {(card.price || (typeof card.type === 'object' && card.type.price)) && (
                            <span className="px-3 py-1 bg-[#1FAFA3] rounded-full text-sm font-bold whitespace-nowrap">
                              {card.price || (typeof card.type === 'object' ? card.type.price : '')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <p
                        className="text-gray-700 text-lg leading-relaxed min-h-[120px]"
                        dangerouslySetInnerHTML={{
                          __html: isSpecialType ? card.description : (typeof card.type === 'object' ? card.type.description : '')
                        }}
                      />
                    </div>

                    <div className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 mb-6 flex-1`}>
                      <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#1FAFA3]" />
                        What You'll Discover:
                      </h3>
                      <ul className="grid grid-cols-1 gap-3">
                        {card.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-[#1FAFA3] mt-1">•</span>
                            <span dangerouslySetInnerHTML={{ __html: feature }} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Important:</strong> {isSpecialType ? card.disclaimer : (typeof card.type === 'object' ? card.type.disclaimer : '')}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (isNIPA) {
                          setSelectedNIPA(true);
                        } else if (card.type === 'adhd710') {
                          setSelectedADHD710(true);
                        } else if (card.type === 'adhd1118') {
                          setSelectedADHD1118(true);
                        } else if (card.type === 'trauma-scan') {
                          setSelectedTraumaScan(true);
                        } else if (typeof card.type === 'object') {
                          setSelectedAssessment(card.type);
                        }
                      }}
                      className={`w-full bg-gradient-to-r ${card.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group mt-auto`}
                    >
                      Learn More
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3] rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Need Help Choosing?</h3>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Each assessment provides unique insights into your neural imprint patterns. You can take multiple
              assessments to get a comprehensive understanding of your strengths and areas for growth.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-2">🎯</div>
                <h4 className="font-bold mb-2">Personalized</h4>
                <p className="text-sm text-white/80">Tailored insights based on your unique responses</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-2">📊</div>
                <h4 className="font-bold mb-2">Detailed Reports</h4>
                <p className="text-sm text-white/80">Comprehensive analysis with actionable recommendations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-2">💾</div>
                <h4 className="font-bold mb-2">Save & Resume</h4>
                <p className="text-sm text-white/80">Complete at your own pace, anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
