import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Link2, RotateCcw, Briefcase, Users, Brain, Baby, UserCheck, Ticket } from 'lucide-react';
import NIP3Assessment from './NIP3Assessment';
import { NeuralImprintPatternsInfo } from './NeuralImprintPatternsInfo';
import { SelfAssessmentQuestionnaire } from './SelfAssessmentQuestionnaire';
import { CareerAssessment } from './CareerAssessment';
import { CouponRedemption } from './CouponRedemption';
import { supabase } from '../lib/supabase';
import { selfAssessmentTypes, SelfAssessmentType } from '../data/selfAssessmentQuestions';

interface GetStartedOptionsProps {
  onClose: () => void;
  franchiseCode?: string | null;
  preselectedPaymentType?: 'tcf' | 'tadhd' | 'pcadhd' | null;
  initialCouponCode?: string | null;
}

export function GetStartedOptions({ onClose, franchiseCode, preselectedPaymentType, initialCouponCode }: GetStartedOptionsProps) {
  const [step, setStep] = useState<'options' | 'assessment_type' | 'coach_link' | 'email' | 'resume' | 'patterns_info' | 'questionnaire' | 'self_assessment' | 'career_assessment' | 'payment'>(preselectedPaymentType ? 'payment' : 'options');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'nipa' | 'tcf' | 'tadhd' | 'pcadhd' | null>(preselectedPaymentType || null);
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
      setStep('patterns_info');
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
    userEmail: string
  ) => {
    setEmail(userEmail);
    setCustomerName(userName);
    setFranchiseOwnerId(couponFranchiseOwnerId);
    setCouponId(redemptionCouponId);
    setShowCouponModal(false);
    setPreviousStep('email');

    const assessmentTypeMap: Record<string, string> = {
      'Full Assessment (343 Questions)': 'nip3',
      'Full ADHD Assessment (128 Questions)': 'nip3',
      'Teen Career & Future Direction': 'teen-career',
      'Teen ADHD Screener (48 Questions)': 'teen-adhd',
      'Parent ADHD Screener (48 Questions)': 'parent-adhd'
    };

    const mappedType = assessmentTypeMap[assessmentType] || assessmentType;

    if (mappedType === 'nip3') {
      setStep('questionnaire');
    } else if (mappedType === 'teen-career') {
      setStep('career_assessment');
    } else {
      const selectedAssessment = selfAssessmentTypes.find(type => type.id === mappedType);
      if (selectedAssessment) {
        setSelectedAssessmentType(selectedAssessment);
        setStep('self_assessment');
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
    return (
      <NIP3Assessment
        onClose={onClose}
        email={email}
        customerName={customerName}
        franchiseOwnerId={franchiseOwnerId}
        couponId={couponId}
      />
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
      <CareerAssessment
        onClose={onClose}
        email={email}
        customerName={customerName}
        franchiseOwnerId={franchiseOwnerId}
        couponId={couponId}
      />
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
                  setStep('payment');
                }}
                className="w-full p-4 border-2 border-[#3DB3E3] rounded-lg hover:bg-[#3DB3E3]/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Brain className="text-[#3DB3E3] group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">NIPA - Full Assessment</h3>
                    <p className="text-sm text-gray-600">343 questions • Comprehensive neural imprint profile</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#3DB3E3]">R950</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPaymentType('tcf');
                  setStep('payment');
                }}
                className="w-full p-4 border-2 border-[#1FAFA3] rounded-lg hover:bg-[#1FAFA3]/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="text-[#1FAFA3] group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">TCF - Teen Career & Future</h3>
                    <p className="text-sm text-gray-600">60 questions • For teens planning work/study path</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#1FAFA3]">R850</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPaymentType('tadhd');
                  setStep('payment');
                }}
                className="w-full p-4 border-2 border-purple-500 rounded-lg hover:bg-purple-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Baby className="text-purple-500 group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">TADHD - Teen ADHD Screener</h3>
                    <p className="text-sm text-gray-600">48 questions • Self-report</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-500">R850</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPaymentType('pcadhd');
                  setStep('payment');
                }}
                className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A2A5E]">PCADHD - Parent/Caregiver ADHD</h3>
                    <p className="text-sm text-gray-600">48 questions • For parents</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-500">R850</p>
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
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Verify Your Email</h2>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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

              <p className="text-sm text-gray-600 bg-[#E6E9EF] p-3 rounded-lg">
                We'll send you a verification link to confirm your email and access the assessment.
              </p>

              <button
                type="submit"
                disabled={!email.trim()}
                className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-colors font-medium"
              >
                Send Verification Link
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
                  {selectedPaymentType === 'nipa' && 'NIPA - Full Neural Imprint Assessment'}
                  {selectedPaymentType === 'tcf' && 'TCF - Teen Career & Future Work/Study'}
                  {selectedPaymentType === 'tadhd' && 'TADHD - Teen ADHD-Linked Screener'}
                  {selectedPaymentType === 'pcadhd' && 'PCADHD - Parent/Caregiver ADHD Screener'}
                </p>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-[#0A2A5E]">
                    {selectedPaymentType === 'nipa' && 'R950.00'}
                    {selectedPaymentType === 'tcf' && 'R850.00'}
                    {selectedPaymentType === 'tadhd' && 'R850.00'}
                    {selectedPaymentType === 'pcadhd' && 'R850.00'}
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
                  <input required type="hidden" name="amount" value="950" />
                  <input required type="hidden" name="item_name" maxLength={255} value="NIPA" />
                  <input type="hidden" name="item_description" maxLength={255} value="NIPA - Full Neural Imprint Assessment" />
                  <button
                    type="submit"
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
                  <input required type="hidden" name="amount" value="850" />
                  <input required type="hidden" name="item_name" maxLength={255} value="TCF" />
                  <input type="hidden" name="item_description" maxLength={255} value=" TCF" />
                  <button
                    type="submit"
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
                  <input required type="hidden" name="amount" value="850" />
                  <input required type="hidden" name="item_name" maxLength={255} value="TADHD" />
                  <input type="hidden" name="item_description" maxLength={255} value="TADHD" />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {paymentCouponCode.trim() ? 'Proceed with Coupon' : 'Proceed to Payment'}
                  </button>
                </form>
              )}

              {selectedPaymentType === 'pcadhd' && (
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
                  <input required type="hidden" name="amount" value="850" />
                  <input required type="hidden" name="item_name" maxLength={255} value="PCADHD" />
                  <input type="hidden" name="item_description" maxLength={255} value="PCADHD" />
                  <button
                    type="submit"
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
