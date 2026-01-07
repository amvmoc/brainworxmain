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
  const [manualCouponCode, setManualCouponCode] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const assessmentNames = {
    nipa: 'NIP - Full Neural Imprint Assessment',
    tadhd: 'ADHD Assessment (Ages 7-10 or 11-18)',
    tcf: 'Teen Career & Future Direction'
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('payment_email') || '';
    setUserEmail(email);

    // Poll for coupon with automatic redirect
    pollForCoupon(email);
  }, []);

  const fetchLatestCoupon = async (email: string) => {
    if (!email) {
      setLoading(false);
      return null;
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
        return data.code;
      }
    } catch (err) {
      console.error('Error fetching coupon:', err);
    }
    return null;
  };

  const pollForCoupon = async (email: string) => {
    if (!email) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // 30 attempts = 30 seconds (increased for PayFast webhook)
    const pollInterval = 1000; // 1 second

    const poll = async () => {
      const code = await fetchLatestCoupon(email);

      if (code) {
        setCouponCode(code);
        setLoading(false);

        // Auto-redirect after 2 seconds
        setTimeout(() => {
          localStorage.setItem('coupon_prefill', JSON.stringify({
            code: code,
            email: email,
            name: localStorage.getItem('payment_name') || ''
          }));
          window.location.href = `/?coupon=${code}&auto=true`;
        }, 2000);

        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      } else {
        // After 10 seconds, stop loading and show message
        setLoading(false);
      }
    };

    poll();
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

  const handleCheckAgain = async () => {
    setCheckingCoupon(true);
    const code = await fetchLatestCoupon(userEmail);
    if (code) {
      setCouponCode(code);
      // Auto-redirect after finding coupon
      setTimeout(() => {
        localStorage.setItem('coupon_prefill', JSON.stringify({
          code: code,
          email: userEmail,
          name: localStorage.getItem('payment_name') || ''
        }));
        window.location.href = `/?coupon=${code}&auto=true`;
      }, 1000);
    }
    setCheckingCoupon(false);
  };

  const handleManualCouponSubmit = () => {
    if (manualCouponCode.trim()) {
      localStorage.setItem('coupon_prefill', JSON.stringify({
        code: manualCouponCode.trim(),
        email: userEmail,
        name: localStorage.getItem('payment_name') || ''
      }));
      window.location.href = `/?coupon=${manualCouponCode.trim()}&auto=true`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#3DB3E3] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Processing Your Payment...</h2>
            <p className="text-lg text-gray-600 mb-4">
              Your payment was successful! We're setting up your assessment access.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <p className="text-sm text-gray-700">
                This usually takes just a few seconds. You'll be redirected automatically.
              </p>
            </div>
          </div>
        ) : couponCode ? (
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

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
                <p className="text-white text-2xl font-bold">You're all set!</p>
              </div>
              <p className="text-white text-lg text-center mb-3">
                Your payment has been confirmed and your assessment is ready to begin.
              </p>
              <p className="text-white text-sm text-center opacity-90">
                Redirecting you automatically...
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
              <p className="text-center text-gray-700 mb-3">
                <strong>Can't wait?</strong> Click the button below to start immediately:
              </p>
              <button
                onClick={handleStartAssessment}
                className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-5 px-6 rounded-xl font-bold text-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 group"
              >
                Start Your Assessment Now
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

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
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-block bg-orange-100 rounded-full p-6 mb-6">
              <CheckCircle className="w-16 h-16 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">Payment Received!</h2>
            <p className="text-gray-700 mb-4">
              Your payment was successful and your assessment is being prepared.
            </p>

            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-green-800 mb-3 text-lg">Check Your Email</h3>
              <p className="text-green-700 mb-2">
                An email with your access code and direct link has been sent to:
              </p>
              <p className="text-lg font-bold text-green-900 mb-3">{userEmail}</p>
              <p className="text-sm text-green-600">
                The email includes a "Start Your Assessment" button - click it to begin immediately.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Don't see the email?</strong>
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Wait 1-2 minutes for delivery</li>
                <li>• Make sure you entered the correct email</li>
              </ul>
            </div>

            <div className="space-y-4 mb-6">
              <button
                onClick={handleCheckAgain}
                disabled={checkingCoupon}
                className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkingCoupon ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Checking...
                  </>
                ) : (
                  <>
                    <ArrowRight size={20} />
                    Check for Access Code & Start Assessment
                  </>
                )}
              </button>

              <div className="text-center text-gray-500 text-sm">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have your access code from email? Enter it here:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCouponCode}
                    onChange={(e) => setManualCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter your access code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent uppercase"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualCouponSubmit()}
                  />
                  <button
                    onClick={handleManualCouponSubmit}
                    disabled={!manualCouponCode.trim()}
                    className="bg-[#0A2A5E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3DB3E3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
