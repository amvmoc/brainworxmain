// Self-assessments with mandatory payment gateway
import { useState } from 'react';
import { Briefcase, Users, Brain, Heart, ArrowRight, X, CheckCircle, Clock, Ticket, RotateCcw } from 'lucide-react';
import { selfAssessmentTypes } from '../data/selfAssessmentQuestions';
import { SelfAssessmentQuestionnaire } from './SelfAssessmentQuestionnaire';
import { Questionnaire } from './Questionnaire';
import { CouponRedemption } from './CouponRedemption';
import { supabase } from '../lib/supabase';

interface SelfAssessmentsPageProps {
  onClose: () => void;
  onStartPayment?: (paymentType: 'nipa' | 'tcf' | 'tadhd' | 'pcadhd') => void;
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
  } | null>(null);
  const [nipaQuestionnaireData, setNipaQuestionnaireData] = useState<{
    email: string;
    franchiseOwnerId: string;
  } | null>(null);

  const handleCouponRedemption = (
    assessmentType: string,
    couponId: string,
    franchiseOwnerId: string,
    userName: string,
    userEmail: string
  ) => {
    setShowCouponModal(false);

    // Map assessment type to the correct assessment
    const assessmentTypeMap: Record<string, typeof selfAssessmentTypes[0] | 'nipa'> = {
      'tcf': selfAssessmentTypes[0], // Teen Career/Future
      'tadhd': selfAssessmentTypes[1], // Teen ADHD
      'pcadhd': selfAssessmentTypes[2], // Parent/Child ADHD
      'nipa': 'nipa'
    };

    const mappedAssessment = assessmentTypeMap[assessmentType.toLowerCase()];

    if (mappedAssessment === 'nipa') {
      // For NIPA, redirect to GetStartedOptions with the payment type
      alert('Coupon redeemed successfully! Starting NIPA assessment...');
      if (onStartPayment) {
        onStartPayment('nipa');
      }
    } else if (mappedAssessment && typeof mappedAssessment !== 'string') {
      // For self-assessments, start the questionnaire
      setQuestionnaireData({
        assessmentType: mappedAssessment,
        email: userEmail,
        franchiseOwnerId: franchiseOwnerId
      });
      setStartQuestionnaire(true);
    } else {
      alert('Coupon redeemed successfully! You can now start your assessment.');
      onClose();
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
      const assessmentTypeMap: Record<string, typeof selfAssessmentTypes[0]> = {
        'tcf': selfAssessmentTypes[0],
        'tadhd': selfAssessmentTypes[1],
        'pcadhd': selfAssessmentTypes[2]
      };

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
      } else {
        setShowResumeModal(false);
        setShowChoiceModal(false);
        setNipaQuestionnaireData({
          email: resumeEmail,
          franchiseOwnerId: existingResponse.franchise_owner_id || ''
        });
        setStartNIPAQuestionnaire(true);
      }
    } else {
      setNoProgressFound(true);
    }
  };

  const nipaCard = {
    id: 'nipa',
    name: 'NIPA - Full Neural Imprint Assessment',
    description: 'This is our comprehensive client assessment with 344 in-depth questions. Unlike the shorter self-assessments above, NIPA provides a complete analysis of your cognitive patterns, emotional responses, behavioral tendencies, and life experiences across all 20 Neural Imprint Patterns. This flagship assessment includes a professional 45-minute debrief session to help you understand and apply your results.',
    icon: Brain,
    color: 'from-[#0A2A5E] to-[#3DB3E3]',
    iconColor: 'text-[#0A2A5E]',
    borderColor: 'border-[#0A2A5E]',
    bgColor: 'bg-[#0A2A5E]/10',
    targetAudience: 'Adults & Teens 16+',
    questionCount: 344,
    price: 'R950',
    assessmentType: 'Full Client Assessment',
    features: [
      'Full 344-question comprehensive assessment',
      'Professional 45-minute debrief session',
      'Complete profile across all 20 patterns',
      'Two-round assessment process',
      'Detailed personalized recommendations',
      'In-depth cognitive & emotional insights'
    ],
    instructions: 'This is a comprehensive two-round assessment. Round 1 includes 343 questions covering all aspects of your neural imprint patterns. Round 2 focuses on deeper analysis. The full assessment typically takes 60-90 minutes. You can save your progress and return at any time. After completion, you will receive a detailed report and a 45-minute debrief session with a qualified practitioner.',
    disclaimer: 'This is a self-reflection and coaching tool, not a clinical diagnostic instrument. It is designed to support personal growth and self-awareness through professional guidance.'
  };

  const assessmentCards = [
    {
      type: 'nipa',
      ...nipaCard
    },
    {
      type: selfAssessmentTypes[0],
      icon: Briefcase,
      color: 'from-[#3DB3E3] to-[#1FAFA3]',
      iconColor: 'text-[#3DB3E3]',
      borderColor: 'border-[#3DB3E3]',
      bgColor: 'bg-[#3DB3E3]/10',
      targetAudience: 'Ages 12-18',
      features: [
        'Discover your career interests',
        'Identify ideal work environments',
        'Understand your learning style',
        'Plan your future path'
      ]
    },
    {
      type: selfAssessmentTypes[1],
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-50',
      targetAudience: 'Teens (Ages 12-18)',
      features: [
        'Understand attention patterns',
        'Identify energy management challenges',
        'Recognize emotional responses',
        'Discover helpful strategies'
      ]
    },
    {
      type: selfAssessmentTypes[2],
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      targetAudience: 'Parents/Caregivers',
      features: [
        'Observe focus and attention patterns',
        'Track energy and engagement levels',
        'Understand emotional responses',
        'Identify areas needing support'
      ]
    }
  ];

  // Show questionnaire after coupon redemption
  if (startQuestionnaire && questionnaireData) {
    return (
      <SelfAssessmentQuestionnaire
        onClose={onClose}
        assessmentType={questionnaireData.assessmentType}
        coachLink=""
        email={questionnaireData.email}
        franchiseOwnerId={questionnaireData.franchiseOwnerId}
      />
    );
  }

  // Show NIPA questionnaire when resuming
  if (startNIPAQuestionnaire && nipaQuestionnaireData) {
    return (
      <Questionnaire
        onClose={onClose}
        coachLink=""
        email={nipaQuestionnaireData.email}
        franchiseOwnerId={nipaQuestionnaireData.franchiseOwnerId}
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
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {nipaCard.description}
              </p>

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
                      <span>{feature}</span>
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
                      {selectedAssessment.questions.length} questions
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
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {selectedAssessment.description}
              </p>

              <div className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#1FAFA3]" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#1FAFA3] mt-1">•</span>
                      <span>{feature}</span>
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
                      const paymentTypeMap: Record<string, 'tcf' | 'tadhd' | 'pcadhd'> = {
                        'teen-career': 'tcf',
                        'teen-adhd': 'tadhd',
                        'parent-adhd': 'pcadhd'
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
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {assessmentCards.map((card, index) => {
              const isNIPA = card.type === 'nipa';
              const cardData = isNIPA ? card : { ...card, type: card.type as typeof selfAssessmentTypes[0] };

              return (
                <div
                  key={index}
                  className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2 ${card.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`bg-gradient-to-r ${card.color} p-8 text-white`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        <card.icon size={48} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">
                          {isNIPA ? card.name : cardData.type.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {isNIPA && (
                            <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-[#0A2A5E]">
                              Full Client Assessment
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-white/90">
                            <Clock size={16} />
                            {isNIPA ? card.questionCount : cardData.type.questions.length} questions
                          </span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                            {card.targetAudience}
                          </span>
                          {isNIPA && (
                            <span className="px-3 py-1 bg-[#1FAFA3] rounded-full text-sm font-bold">
                              {card.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="mb-6">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {isNIPA ? card.description : cardData.type.description}
                      </p>
                    </div>

                    <div className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 mb-6`}>
                      <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#1FAFA3]" />
                        What You'll Discover:
                      </h3>
                      <ul className="grid md:grid-cols-2 gap-3">
                        {card.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-[#1FAFA3] mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Important:</strong> {isNIPA ? card.disclaimer : cardData.type.disclaimer}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (isNIPA) {
                          setSelectedNIPA(true);
                        } else {
                          setSelectedAssessment(cardData.type);
                        }
                      }}
                      className={`w-full bg-gradient-to-r ${card.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
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
