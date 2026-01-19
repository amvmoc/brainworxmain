import { useState, useEffect } from 'react';
import { Plus, Eye, Copy, Check, X, Mail, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Coupon {
  id: string;
  code: string;
  assessment_type: string;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  recipient_name: string | null;
  recipient_email: string | null;
  email_sent: boolean;
}

interface Redemption {
  id: string;
  user_name: string;
  user_email: string;
  redeemed_at: string;
}

// Convert human-readable assessment names to database identifiers
const getAssessmentDatabaseId = (displayName: string): string => {
  const mapping: Record<string, string> = {
    'Full Assessment (344 Questions)': 'nipa',
    'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)': 'adhd710',
    'ADHD 11-18 Assessment (50 Questions)': 'adhd1118',
    'Teen Career & Future Direction': 'teen-career',
    'Trauma & Loss Impact Assessment (Adult 15+)': 'trauma-scan'
  };

  return mapping[displayName] || displayName;
};

// Assessment options matching the dashboard assessments tabs order
const getAssessmentOptions = () => {
  const options = [
    { value: 'Full Assessment (344 Questions)', label: 'Full Assessment (344 Questions)' },
    { value: 'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)', label: 'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)' },
    { value: 'ADHD 11-18 Assessment (50 Questions)', label: 'ADHD 11-18 Assessment (50 Questions)' },
    { value: 'Teen Career & Future Direction', label: 'Teen Career & Future Direction' },
    { value: 'Trauma & Loss Impact Assessment (Adult 15+)', label: 'Trauma & Loss Impact Assessment (Adult 15+)' },
  ];

  return options;
};

export function CouponManagement() {
  const assessmentOptions = getAssessmentOptions();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    email: '',
    assessmentType: assessmentOptions[0].value,
    maxUses: 1
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRedemptions = async (couponId: string) => {
    try {
      const { data, error } = await supabase
        .from('coupon_redemptions')
        .select('*')
        .eq('coupon_id', couponId)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      setRedemptions(data || []);
    } catch (error) {
      console.error('Error loading redemptions:', error);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        const codeToUse = attempts === 0 ? newCoupon.code : generateCode();

        // Convert display name to database ID
        const dbAssessmentType = getAssessmentDatabaseId(newCoupon.assessmentType);

        const { data: couponData, error } = await supabase
          .from('coupon_codes')
          .insert({
            code: codeToUse,
            assessment_type: dbAssessmentType,
            max_uses: newCoupon.maxUses,
            created_by: userId,
            recipient_name: newCoupon.name,
            recipient_email: newCoupon.email,
            email_sent: false
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505' && attempts < maxAttempts - 1) {
            attempts++;
            continue;
          }
          throw error;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        try {
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-coupon-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              recipientName: newCoupon.name,
              recipientEmail: newCoupon.email,
              couponCode: codeToUse,
              assessmentType: newCoupon.assessmentType
            })
          });

          if (emailResponse.ok) {
            await supabase
              .from('coupon_codes')
              .update({ email_sent: true })
              .eq('id', couponData.id);

            alert('Coupon created and email sent successfully!');
          } else {
            console.error('Failed to send email');
            alert('Coupon created but email failed to send. You can resend it later.');
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          alert('Coupon created but email failed to send. You can resend it later.');
        }

        setShowCreateModal(false);
        setNewCoupon({
          code: '',
          name: '',
          email: '',
          assessmentType: 'Full Assessment (344 Questions)',
          maxUses: 1
        });
        loadCoupons();
        break;
      } catch (error: any) {
        if (error.code !== '23505' || attempts >= maxAttempts - 1) {
          alert(`Error: ${error.message}`);
          break;
        }
        attempts++;
      }
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupon_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadCoupons();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResendEmail = async (coupon: Coupon) => {
    if (!coupon.recipient_email || !coupon.recipient_name) {
      alert('This coupon does not have recipient information');
      return;
    }

    setResendingEmail(coupon.id);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-coupon-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          recipientName: coupon.recipient_name,
          recipientEmail: coupon.recipient_email,
          couponCode: coupon.code,
          assessmentType: coupon.assessment_type
        })
      });

      if (emailResponse.ok) {
        await supabase
          .from('coupon_codes')
          .update({ email_sent: true })
          .eq('id', coupon.id);

        alert('Email resent successfully!');
        loadCoupons();
      } else {
        const result = await emailResponse.json();
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error resending email:', error);
      alert(`Failed to resend email: ${error.message}`);
    } finally {
      setResendingEmail(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0A2A5E]">Coupon Codes</h2>
            <p className="text-gray-600 mt-1">Generate free access codes for assessments</p>
          </div>
          <button
            onClick={() => {
              setNewCoupon({
                code: generateCode(),
                name: '',
                email: '',
                assessmentType: assessmentOptions[0].value,
                maxUses: 1
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-[#0A2A5E] text-white px-4 py-2 rounded-lg hover:bg-[#3DB3E3] transition-all"
          >
            <Plus size={20} />
            Create Coupon
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Code</th>
                <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Recipient</th>
                <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Assessment</th>
                <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Uses</th>
                <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-gray-400 hover:text-[#3DB3E3] transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{coupon.recipient_name || '-'}</div>
                      <div className="text-gray-500">{coupon.recipient_email || '-'}</div>
                      {coupon.email_sent && (
                        <div className="text-green-600 text-xs mt-1">✓ Email sent</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{coupon.assessment_type}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-800 font-semibold">
                      {coupon.current_uses} / {coupon.max_uses}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        coupon.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedCoupon(coupon.id);
                          loadRedemptions(coupon.id);
                        }}
                        className="flex items-center gap-1 text-[#3DB3E3] hover:text-[#0A2A5E] transition-colors"
                      >
                        <Eye size={16} />
                        View Uses
                      </button>

                      {coupon.recipient_email && (
                        <button
                          onClick={() => handleResendEmail(coupon)}
                          disabled={resendingEmail === coupon.id}
                          className="flex items-center gap-1 text-[#1FAFA3] hover:text-[#0A2A5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resend email to recipient"
                        >
                          {resendingEmail === coupon.id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Mail size={16} />
                          )}
                          Resend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {coupons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No coupon codes yet. Create one to get started!
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Create Coupon Code</h2>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={newCoupon.name}
                  onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={newCoupon.email}
                  onChange={(e) => setNewCoupon({ ...newCoupon, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent font-mono"
                  placeholder="AUTO-GENERATED"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Type
                </label>
                <select
                  value={newCoupon.assessmentType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, assessmentType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  required
                >
                  {assessmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0A2A5E] text-white px-4 py-3 rounded-lg hover:bg-[#3DB3E3] transition-all font-medium"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0A2A5E]">Coupon Redemptions</h2>
              <button
                onClick={() => {
                  setSelectedCoupon(null);
                  setRedemptions([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Redeemed</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((redemption) => (
                    <tr key={redemption.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">{redemption.user_name}</td>
                      <td className="px-6 py-4 text-gray-600">{redemption.user_email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(redemption.redeemed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {redemptions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No redemptions yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
