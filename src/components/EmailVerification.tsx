import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Questionnaire } from './Questionnaire';

interface EmailVerificationProps {
  token: string;
}

export function EmailVerification({ token }: EmailVerificationProps) {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const decodedEmail = atob(token).split(':')[0];

      if (!decodedEmail || !decodedEmail.includes('@')) {
        setVerificationStatus('error');
        return;
      }

      const tokenTimestamp = parseInt(atob(token).split(':')[1]);
      const hoursSinceCreation = (Date.now() - tokenTimestamp) / (1000 * 60 * 60);

      if (hoursSinceCreation > 24) {
        setVerificationStatus('expired');
        return;
      }

      setCustomerEmail(decodedEmail);
      setVerificationStatus('success');
    } catch (error) {
      console.error('Token verification error:', error);
      setVerificationStatus('error');
    }
  };

  const handleStartQuestionnaire = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          questionnaire_id: '00000000-0000-0000-0000-000000000000',
          customer_name: customerName,
          customer_email: customerEmail,
          status: 'in_progress',
          entry_type: 'random_visitor',
          email_verified: true,
          access_token: token,
          verification_sent_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (data) {
        setResponseId(data.id);
        setShowQuestionnaire(true);
      } else if (error) {
        console.error('Error creating response:', error);
        alert('There was an error starting your assessment. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  if (showQuestionnaire && responseId) {
    return <Questionnaire onClose={() => window.location.href = '/'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {verificationStatus === 'verifying' && (
          <div className="text-center">
            <Loader className="mx-auto text-[#3DB3E3] animate-spin mb-4" size={48} />
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-2">Email Verified!</h2>
              <p className="text-gray-600">
                Your email <strong>{customerEmail}</strong> has been verified.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                />
              </div>

              <div className="bg-[#E6E9EF] p-4 rounded-lg">
                <h3 className="font-semibold text-[#0A2A5E] mb-2">What's Next?</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Complete 350-question assessment</li>
                  <li>• Receive comprehensive brain analysis</li>
                  <li>• Get personalized recommendations</li>
                  <li>• Booking link for consultation</li>
                </ul>
              </div>

              <button
                onClick={handleStartQuestionnaire}
                disabled={!customerName.trim()}
                className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-colors font-medium"
              >
                Start Assessment
              </button>
            </div>
          </div>
        )}

        {verificationStatus === 'expired' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <XCircle className="text-orange-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-2">Link Expired</h2>
            <p className="text-gray-600 mb-6">
              This verification link has expired. Verification links are valid for 24 hours.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium"
            >
              Return to Home
            </button>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your email. The link may be invalid or corrupted.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
