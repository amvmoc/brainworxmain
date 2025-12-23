import { useEffect, useState } from 'react';
import { CheckCircle, Copy, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentSuccessProps {
  assessmentType: 'nipa' | 'tadhd' | 'tcf';
}

export function PaymentSuccess({ assessmentType }: PaymentSuccessProps) {
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const assessmentNames = {
    nipa: 'NIP - Full Neural Imprint Assessment',
    tadhd: 'ADHD Assessment (Ages 7-10 or 11-18)',
    tcf: 'Teen Career & Future Direction'
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('payment_email') || '';
    setUserEmail(email);

    fetchLatestCoupon(email);
  }, []);

  const fetchLatestCoupon = async (email: string) => {
    if (!email) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('code')
        .eq('recipient_email', email)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setCouponCode(data.code);
      }
    } catch (err) {
      console.error('Error fetching coupon:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartAssessment = () => {
    if (couponCode) {
      // Auto-fill name and email to bypass manual entry
      localStorage.setItem('coupon_prefill', JSON.stringify({
        code: couponCode,
        email: userEmail,
        name: localStorage.getItem('payment_name') || ''
      }));
      window.location.href = `/?coupon=${couponCode}&auto=true`;
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#3DB3E3] animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Processing your payment...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-block bg-green-100 rounded-full p-6 mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-[#0A2A5E] mb-4">Payment Successful!</h1>

            <p className="text-xl text-gray-600 mb-2">
              Thank you for your purchase of
            </p>
            <p className="text-2xl font-bold text-[#3DB3E3] mb-8">
              {assessmentNames[assessmentType]}
            </p>

            {couponCode ? (
              <>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                    <p className="text-white text-2xl font-bold">You're all set!</p>
                  </div>
                  <p className="text-white text-lg text-center">
                    Your payment has been confirmed and your assessment is ready to begin.
                  </p>
                </div>

                <button
                  onClick={handleStartAssessment}
                  className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-5 px-6 rounded-xl font-bold text-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 group mb-8"
                >
                  Start Your Assessment Now
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] rounded-2xl p-8 mb-6">
                  <p className="text-white text-sm mb-3 text-center">Your Access Code (for reference):</p>
                  <div className="bg-white rounded-xl p-6 mb-4">
                    <p className="text-3xl font-bold text-[#0A2A5E] tracking-wider font-mono text-center">
                      {couponCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#0A2A5E] px-6 py-3 rounded-lg hover:bg-gray-100 transition-all font-medium"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={20} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={20} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-bold text-[#0A2A5E] mb-3">What happens next:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Click the button above to start immediately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Complete your assessment at your own pace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Check your email for a direct link to resume anytime</span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  A confirmation email with your direct access link has been sent to<br />
                  <strong className="text-[#0A2A5E]">{userEmail}</strong>
                </p>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                <p className="text-gray-700 mb-4">
                  Your payment has been received. Your access code will be generated shortly and sent to your email.
                </p>
                <p className="text-sm text-gray-600">
                  If you don't receive it within 5 minutes, please check your spam folder or contact support.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
