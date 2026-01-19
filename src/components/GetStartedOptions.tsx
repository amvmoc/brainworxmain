import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Link2, RotateCcw, Briefcase, Users, Brain, Baby, UserCheck, Ticket, Shield } from 'lucide-react';
import NIP3Assessment from './NIP3Assessment';
import { NeuralImprintPatternsInfo } from './NeuralImprintPatternsInfo';
import { SelfAssessmentQuestionnaire } from './SelfAssessmentQuestionnaire';
import { CouponRedemption } from './CouponRedemption';
import { CareerAssessment } from './CareerAssessment';
import ADHD710Assessment from './ADHD710Assessment';
import ADHD1118Assessment from './ADHD1118Assessment';
import TraumaScanAssessment from './TraumaScanAssessment';
import { supabase } from '../lib/supabase';
import { selfAssessmentTypes, SelfAssessmentType } from '../data/selfAssessmentQuestions';

interface GetStartedOptionsProps {
  onClose: () => void;
  franchiseCode?: string | null;
  preselectedPaymentType?: 'tadhd' | 'tcf' | 'trauma-scan' | null;
  initialCouponCode?: string | null;
}

export function GetStartedOptions({ onClose, franchiseCode, preselectedPaymentType, initialCouponCode }: GetStartedOptionsProps) {
  const [step, setStep] = useState<'options' | 'assessment_type' | 'coach_link' | 'email' | 'resume' | 'patterns_info' | 'questionnaire' | 'self_assessment' | 'career_assessment' | 'adhd710_assessment' | 'adhd1118_assessment' | 'trauma_scan_assessment' | 'payment'>(preselectedPaymentType ? 'email' : 'options');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'nipa' | 'tadhd' | 'tcf' | 'trauma-scan' | null>(preselectedPaymentType || null);
  const [coachLink, setCoachLink] = useState(franchiseCode || '');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [previousStep, setPreviousStep] = useState<'coach_link' | 'email' | 'resume'>('coach_link');
  const [resumeEmail, setResumeEmail] = useState('');
  const [checkingProgress, setCheckingProgress] = useState(false);
  const [noProgressFound, setNoProgressFound] = useState(false);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<SelfAssessmentType | null>(null);
  const [franchiseOwnerId, setFranchiseOwnerId] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(!!initialCouponCode);
  const [customerName, setCustomerName] = useState('');
  const [couponId, setCouponId] = useState<string | null>(null);
  const [paymentCouponCode, setPaymentCouponCode] = useState('');
  const [adhdChildName, setAdhdChildName] = useState('');
  const [adhdChildAge, setAdhdChildAge] = useState<number | null>(null);
  const [adhdChildGender, setAdhdChildGender] = useState('');
  const [adhdCaregiverRelationship, setAdhdCaregiverRelationship] = useState('');
  const [adhdAssessmentId, setAdhdAssessmentId] = useState('');

  console.log('GetStartedOptions render:', {
    step,
    email,
    customerName,
    showCouponModal,
    initialCouponCode,
    paymentCouponCode,
    couponId
  });

  useEffect(() => {
    if (franchiseCode || coachLink) {
      lookupFranchiseOwner(franchiseCode || coachLink);
    }
  }, [franchiseCode]);

  const lookupFranchiseOwner = async (code: string) => {
    if (!code) return;

    const { data } = await supabase
      .from('franchise_owners')
      .select('id')
      .eq('unique_link_code', code)
      .maybeSingle();

    if (data) {
      setFranchiseOwnerId(data.id);
    }
  };

  const handleCoachLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coachLink.trim()) {
      await lookupFranchiseOwner(coachLink.trim());
      setPreviousStep('coach_link');
      setStep('patterns_info');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setPreviousStep('email');

      // All assessments must go through payment first (unless they came from a coupon)
      if (selectedPaymentType) {
        setStep('payment');
      } else {
        // Default to NIP patterns info if no payment type selected
        setStep('patterns_info');
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
      setEmail(resumeEmail);
      setPreviousStep('resume');
      setStep('questionnaire');
    } else {
      setNoProgressFound(true);
    }
  };

  const handleCouponRedemption = (
    assessmentType: string,
    redemptionCouponId: string,
    couponFranchiseOwnerId: string,
    userName: string,
    userEmail: string,
    childName?: string,
    childAge?: number,
    childGender?: string,
    caregiverRelationship?: string,
    assessmentId?: string
  ) => {
    console.log('Coupon redeemed:', { assessmentType, userName, userEmail, childName, childAge });

    setEmail(userEmail);
    setCustomerName(userName);
    setFranchiseOwnerId(couponFranchiseOwnerId);
    setCouponId(redemptionCouponId);
    setPreviousStep('email');

    // Store ADHD child info if provided
    if (childName) setAdhdChildName(childName);
    if (childAge !== undefined) setAdhdChildAge(childAge);
    if (childGender) setAdhdChildGender(childGender);
    if (caregiverRelationship) setAdhdCaregiverRelationship(caregiverRelationship);
    if (assessmentId) setAdhdAssessmentId(assessmentId);

    // Build dynamic mapping from assessment names to IDs
    const assessmentTypeMap: Record<string, string> = {
      'Full Assessment (344 Questions)': 'nip3',
      'Full ADHD Assessment (128 Questions)': 'nip3',
      'ADHD 7-10 Assessment (80 Questions)': 'adhd710',
      'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)': 'adhd710',
      'ADHD 11-18 Assessment (50 Questions)': 'adhd1118',
      'Teen Career & Future Direction': 'teen-career',
      'Trauma & Loss Impact Assessment (Adult 15+)': 'trauma-scan',
      'adhd-710-caregiver': 'adhd710',
      'nipa': 'nip3',
      'tadhd': 'adhd1118',
      'tcf': 'teen-career',
      'trauma-scan': 'trauma-scan'
    };

    // Dynamically add all self-assessments from the data file
    selfAssessmentTypes.forEach(assessment => {
      const key = `${assessment.name} (${assessment.questions.length} Questions)`;
      assessmentTypeMap[key] = assessment.id;
    });

    const mappedType = assessmentTypeMap[assessmentType] || assessmentType;
    console.log('Mapped assessment type:', mappedType);

    if (mappedType === 'nip3') {
      console.log('Navigating to Full Assessment (NIP3)');
      setShowCouponModal(false);
      setStep('questionnaire');
    } else if (mappedType === 'teen-career') {
      console.log('Navigating to Career Assessment');
      setShowCouponModal(false);
      setStep('career_assessment');
    } else if (mappedType === 'adhd710') {
      console.log('Navigating to ADHD710 Assessment');
      setShowCouponModal(false);
      setStep('adhd710_assessment');
    } else if (mappedType === 'adhd1118') {
      console.log('Navigating to ADHD 11-18 Assessment');
      setShowCouponModal(false);
      setStep('adhd1118_assessment');
    } else if (mappedType === 'trauma-scan') {
      console.log('Navigating to Trauma Scan Assessment');
      setShowCouponModal(false);
      setStep('trauma_scan_assessment');
    } else {
      const selectedAssessment = selfAssessmentTypes.find(type => type.id === mappedType);
      console.log('Found self-assessment:', selectedAssessment);

      if (selectedAssessment) {
        setSelectedAssessmentType(selectedAssessment);
        setShowCouponModal(false);
        setStep('self_assessment');
      } else {
        console.error('Unknown assessment type:', assessmentType, 'mapped to:', mappedType);
        alert(`Error: Unknown assessment type "${assessmentType}". Please contact support.`);
        setShowCouponModal(false);
        setStep('options');
      }
    }
  };

  if (step === 'patterns_info') {
    return (
      <NeuralImprintPatternsInfo
        onBack={() => setStep(previousStep)}
        onContinue={() => setStep('questionnaire')}
      />
    );
  }

  if (step === 'questionnaire') {
    console.log('GetStartedOptions: Rendering NIP3Assessment', {
      email,
      customerName,
      franchiseOwnerId,
      couponId
    });
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <NIP3Assessment
          onClose={onClose}
          email={email}
          customerName={customerName}
          franchiseOwnerId={franchiseOwnerId}
          couponId={couponId}
        />
      </div>
    );
  }

  if (step === 'self_assessment' && selectedAssessmentType) {
    return (
      <SelfAssessmentQuestionnaire
        onClose={onClose}
        assessmentType={selectedAssessmentType}
        coachLink={coachLink}
        email={email}
        franchiseOwnerId={franchiseOwnerId}
        couponId={couponId}
      />
    );
  }

  if (step === 'career_assessment') {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <CareerAssessment
          onClose={onClose}
          email={email}
          customerName={customerName}
          franchiseOwnerId={franchiseOwnerId}
          couponId={couponId}
        />
      </div>
    );
  }

  if (step === 'adhd710_assessment') {
    // Determine respondent type based on whether we have assessment ID (teacher) or not (parent)
    const respondentType = adhdAssessmentId ? 'caregiver' : 'parent';

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <ADHD710Assessment
          assessmentId={adhdAssessmentId || undefined}
          respondentType={respondentType}
          onComplete={() => {
            setStep('options');
            onClose();
          }}
        />
      </div>
    );
  }

  if (step === 'adhd1118_assessment') {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <ADHD1118Assessment
          assessmentId={adhdAssessmentId || undefined}
          respondentType="teen"
          onClose={() => {
            setStep('options');
            onClose();
          }}
        />
      </div>
    );
  }

  if (step === 'trauma_scan_assessment') {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <TraumaScanAssessment
          couponCode={couponId || undefined}
          prefillData={{
            name: customerName,
            email: email
          }}
        />
      </div>
    );
  }

  if (showCouponModal) {
    return (
      <CouponRedemption
        onRedemptionSuccess={handleCouponRedemption}
        onCancel={() => {
          setShowCouponModal(false);
          setPaymentCouponCode('');
          if (initialCouponCode) {
            onClose();
          }
        }}
        initialCouponCode={paymentCouponCode || initialCouponCode || undefined}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative my-8">
        <button
          onClick={step === 'options' ? onClose : () => setStep(step === 'coach_link' || step === 'email' ? 'options' : 'options')}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {step === 'options' && (
          <div className="pt-4">
            <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Choose the assessment type that best fits your needs
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedPaymentType('nipa');
                  setStep('email');
                }}
                className="w-full p-4 border-2 border-[#3DB3E3] rounded-lg hover:bg-[#3DB3E3]/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Brain className="text-[#3DB3E3] group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">NIP - Full Assessment</h3>
                    <p className="text-sm text-gray-600">344 questions • Comprehensive neural imprint profile</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#3DB3E3]">R5</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPaymentType('tadhd');
                  setStep('email');
                }}
                className="w-full p-4 border-2 border-indigo-500 rounded-lg hover:bg-indigo-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="text-indigo-500 group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">ADHD Assessment (Ages 7-10)</h3>
                    <p className="text-sm text-gray-600">80 questions per respondent • Parent + Teacher</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-500">R5</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPaymentType('tadhd');
                  setStep('email');
                }}
                className="w-full p-4 border-2 border-violet-500 rounded-lg hover:bg-violet-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-violet-500 group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">ADHD Assessment (Ages 11-18)</h3>
                    <p className="text-sm text-gray-600">50 questions • Teen self-assessment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-violet-500">R5</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPaymentType('tcf');
                  setStep('email');
                }}
                className="w-full p-4 border-2 border-amber-500 rounded-lg hover:bg-amber-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="text-amber-500 group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">TCF - Teen Career & Future Direction</h3>
                    <p className="text-sm text-gray-600">60 questions • Career exploration</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-500">R5</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPaymentType('trauma-scan');
                  setStep('email');
                }}
                className="w-full p-4 border-2 border-teal-500 rounded-lg hover:bg-teal-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="text-teal-500 group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">Trauma & Loss Impact Assessment</h3>
                    <p className="text-sm text-gray-600">50 questions • Adult 15+ trauma recovery support</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal-500">R5</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('resume')}
                className="w-full p-4 border-2 border-orange-500 rounded-lg hover:bg-orange-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                  <div>
                    <h3 className="font-bold text-[#0A2A5E]">Resume Assessment</h3>
                    <p className="text-sm text-gray-600">Continue from where you left off</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowCouponModal(true)}
                className="w-full p-4 border-2 border-green-500 rounded-lg hover:bg-green-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Ticket className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
                  <div>
                    <h3 className="font-bold text-[#0A2A5E]">Have a Coupon Code?</h3>
                    <p className="text-sm text-gray-600">Redeem a free access code</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center">
              All assessments provide detailed neural imprint analysis
            </p>
          </div>
        )}

        {step === 'assessment_type' && (
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Full Assessment - Choose Entry Method</h2>
            <p className="text-gray-600 mb-6">
              How would you like to proceed?
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setStep('coach_link')}
                className="w-full p-4 border-2 border-[#3DB3E3] rounded-lg hover:bg-[#3DB3E3]/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Link2 className="text-[#3DB3E3] group-hover:scale-110 transition-transform" size={24} />
                  <div>
                    <h3 className="font-bold text-[#0A2A5E]">I Have a Coach Link</h3>
                    <p className="text-sm text-gray-600">Enter your coach's referral link</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('email')}
                className="w-full p-4 border-2 border-[#1FAFA3] rounded-lg hover:bg-[#1FAFA3]/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Mail className="text-[#1FAFA3] group-hover:scale-110 transition-transform" size={24} />
                  <div>
                    <h3 className="font-bold text-[#0A2A5E]">I'm a Random Visitor</h3>
                    <p className="text-sm text-gray-600">Enter your email to receive verification link</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'coach_link' && (
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Enter Coach Link</h2>
            <form onSubmit={handleCoachLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coach Referral Link or Code
                </label>
                <input
                  type="text"
                  value={coachLink}
                  onChange={(e) => setCoachLink(e.target.value)}
                  placeholder="Enter your coach's code (e.g., COACH123ABC)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your coach provided this code to you
                </p>
              </div>

              <button
                type="submit"
                disabled={!coachLink.trim()}
                className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-colors font-medium"
              >
                Continue to Assessment
              </button>
            </form>
          </div>
        )}

        {step === 'email' && !emailSent && (
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Enter Your Details</h2>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!email.trim() || !customerName.trim()}
                className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-colors font-medium"
              >
                Start Assessment
              </button>
            </form>
          </div>
        )}

        {step === 'resume' && (
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Resume Your Assessment</h2>
            <p className="text-gray-600 mb-4">
              Enter the email address you used to start the assessment.
            </p>
            <form onSubmit={handleResumeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resumeEmail}
                  onChange={(e) => {
                    setResumeEmail(e.target.value);
                    setNoProgressFound(false);
                  }}
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
        )}

        {step === 'email' && emailSent && (
          <div className="pt-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Mail className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#0A2A5E] mb-2">Check Your Email</h3>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to verify your address and access the assessment.
            </p>
            <button
              onClick={() => onClose()}
              className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        )}

        {step === 'payment' && selectedPaymentType && (
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Complete Payment</h2>
            <div className="bg-[#E6E9EF] rounded-lg p-6 mb-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Assessment Type</p>
                <p className="text-lg font-bold text-[#0A2A5E]">
                  {selectedPaymentType === 'nipa' && 'NIP - Full Neural Imprint Assessment'}
                  {selectedPaymentType === 'tadhd' && 'ADHD Assessment'}
                  {selectedPaymentType === 'tcf' && 'TCF - Teen Career & Future Direction'}
                  {selectedPaymentType === 'trauma-scan' && 'Trauma & Loss Impact Assessment (Adult 15+)'}
                </p>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-[#0A2A5E]">
                    {selectedPaymentType === 'nipa' && 'R5'}
                    {selectedPaymentType === 'tadhd' && 'R5'}
                    {selectedPaymentType === 'tcf' && 'R5'}
                    {selectedPaymentType === 'trauma-scan' && 'R5'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentCouponCode}
                  onChange={(e) => setPaymentCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (optional)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (paymentCouponCode.trim()) {
                      setShowCouponModal(true);
                    }
                  }}
                  disabled={!paymentCouponCode.trim()}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Apply
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter your coupon code to proceed without payment
              </p>
            </div>

            <div className="text-center mb-6">
              {selectedPaymentType === 'nipa' && (
                <form
                  name="PayFastPayNowForm"
                  action="https://payment.payfast.io/eng/process"
                  method="post"
                  onSubmit={(e) => {
                    if (paymentCouponCode.trim()) {
                      e.preventDefault();
                      setShowCouponModal(true);
                    }
                  }}
                >
                  <input required type="hidden" name="cmd" value="_paynow" />
                  <input required type="hidden" name="receiver" pattern="[0-9]" value="32553329" />
                  <input required type="hidden" name="amount" value="5" />
                  <input required type="hidden" name="item_name" maxLength={255} value="NIP" />
                  <input type="hidden" name="item_description" maxLength={255} value="NIP - Full Neural Imprint Assessment" />
                  <input type="hidden" name="return_url" value={`${window.location.origin}/payment-success?type=nipa&email=${encodeURIComponent(email)}`} />
                  <input type="hidden" name="cancel_url" value={`${window.location.origin}/?payment_cancelled=true`} />
                  <input type="hidden" name="notify_url" value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-notify`} />
                  <input type="hidden" name="custom_str1" value={email} />
                  <input type="hidden" name="name_first" value={customerName.split(' ')[0] || customerName} />
                  <input type="hidden" name="name_last" value={customerName.split(' ').slice(1).join(' ') || ''} />
                  <input type="hidden" name="email_address" value={email} />
                  <button
                    type="submit"
                    onClick={() => {
                      localStorage.setItem('payment_email', email);
                      localStorage.setItem('payment_name', customerName);
                    }}
                    className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {paymentCouponCode.trim() ? 'Proceed with Coupon' : 'Proceed to Payment'}
                  </button>
                </form>
              )}

              {selectedPaymentType === 'tadhd' && (
                <form
                  name="PayFastPayNowForm"
                  action="https://payment.payfast.io/eng/process"
                  method="post"
                  onSubmit={(e) => {
                    if (paymentCouponCode.trim()) {
                      e.preventDefault();
                      setShowCouponModal(true);
                    }
                  }}
                >
                  <input required type="hidden" name="cmd" value="_paynow" />
                  <input required type="hidden" name="receiver" pattern="[0-9]" value="32553329" />
                  <input required type="hidden" name="amount" value="5" />
                  <input required type="hidden" name="item_name" maxLength={255} value="ADHD Assessment" />
                  <input type="hidden" name="item_description" maxLength={255} value="ADHD Assessment" />
                  <input type="hidden" name="return_url" value={`${window.location.origin}/payment-success?type=tadhd&email=${encodeURIComponent(email)}`} />
                  <input type="hidden" name="cancel_url" value={`${window.location.origin}/?payment_cancelled=true`} />
                  <input type="hidden" name="notify_url" value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-notify`} />
                  <input type="hidden" name="custom_str1" value={email} />
                  <input type="hidden" name="name_first" value={customerName.split(' ')[0] || customerName} />
                  <input type="hidden" name="name_last" value={customerName.split(' ').slice(1).join(' ') || ''} />
                  <input type="hidden" name="email_address" value={email} />
                  <button
                    type="submit"
                    onClick={() => {
                      localStorage.setItem('payment_email', email);
                      localStorage.setItem('payment_name', customerName);
                    }}
                    className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {paymentCouponCode.trim() ? 'Proceed with Coupon' : 'Proceed to Payment'}
                  </button>
                </form>
              )}

              {selectedPaymentType === 'tcf' && (
                <form
                  name="PayFastPayNowForm"
                  action="https://payment.payfast.io/eng/process"
                  method="post"
                  onSubmit={(e) => {
                    if (paymentCouponCode.trim()) {
                      e.preventDefault();
                      setShowCouponModal(true);
                    }
                  }}
                >
                  <input required type="hidden" name="cmd" value="_paynow" />
                  <input required type="hidden" name="receiver" pattern="[0-9]" value="32553329" />
                  <input required type="hidden" name="amount" value="5" />
                  <input required type="hidden" name="item_name" maxLength={255} value="TCF" />
                  <input type="hidden" name="item_description" maxLength={255} value="TCF - Teen Career & Future Direction" />
                  <input type="hidden" name="return_url" value={`${window.location.origin}/payment-success?type=tcf&email=${encodeURIComponent(email)}`} />
                  <input type="hidden" name="cancel_url" value={`${window.location.origin}/?payment_cancelled=true`} />
                  <input type="hidden" name="notify_url" value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-notify`} />
                  <input type="hidden" name="custom_str1" value={email} />
                  <input type="hidden" name="name_first" value={customerName.split(' ')[0] || customerName} />
                  <input type="hidden" name="name_last" value={customerName.split(' ').slice(1).join(' ') || ''} />
                  <input type="hidden" name="email_address" value={email} />
                  <button
                    type="submit"
                    onClick={() => {
                      localStorage.setItem('payment_email', email);
                      localStorage.setItem('payment_name', customerName);
                    }}
                    className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {paymentCouponCode.trim() ? 'Proceed with Coupon' : 'Proceed to Payment'}
                  </button>
                </form>
              )}

              {selectedPaymentType === 'trauma-scan' && (
                <form
                  name="PayFastPayNowForm"
                  action="https://payment.payfast.io/eng/process"
                  method="post"
                  onSubmit={(e) => {
                    if (paymentCouponCode.trim()) {
                      e.preventDefault();
                      setShowCouponModal(true);
                    }
                  }}
                >
                  <input required type="hidden" name="cmd" value="_paynow" />
                  <input required type="hidden" name="receiver" pattern="[0-9]" value="32553329" />
                  <input required type="hidden" name="amount" value="5" />
                  <input required type="hidden" name="item_name" maxLength={255} value="trauma-scan" />
                  <input type="hidden" name="item_description" maxLength={255} value="Trauma & Loss Impact Assessment (Adult 15+)" />
                  <input type="hidden" name="return_url" value={`${window.location.origin}/payment-success?type=trauma-scan&email=${encodeURIComponent(email)}`} />
                  <input type="hidden" name="cancel_url" value={`${window.location.origin}/?payment_cancelled=true`} />
                  <input type="hidden" name="notify_url" value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-notify`} />
                  <input type="hidden" name="custom_str1" value={email} />
                  <input type="hidden" name="name_first" value={customerName.split(' ')[0] || customerName} />
                  <input type="hidden" name="name_last" value={customerName.split(' ').slice(1).join(' ') || ''} />
                  <input type="hidden" name="email_address" value={email} />
                  <button
                    type="submit"
                    onClick={() => {
                      localStorage.setItem('payment_email', email);
                      localStorage.setItem('payment_name', customerName);
                    }}
                    className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {paymentCouponCode.trim() ? 'Proceed with Coupon' : 'Proceed to Payment'}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">Secure Payment</p>
              <p>You will be redirected to PayFast's secure payment gateway. After successful payment, you'll receive access to your assessment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
