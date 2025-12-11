import { useState } from 'react';
import { Ticket, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CouponRedemptionProps {
  onRedemptionSuccess: (assessmentType: string, couponId: string, franchiseOwnerId: string, userName: string, userEmail: string) => void;
  onCancel: () => void;
  initialCouponCode?: string;
}

export function CouponRedemption({ onRedemptionSuccess, onCancel, initialCouponCode }: CouponRedemptionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    code: initialCouponCode || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Validating coupon:', formData.code);

      const { data, error: rpcError } = await supabase
        .rpc('validate_and_use_coupon', {
          p_code: formData.code,
          p_user_name: formData.name,
          p_user_email: formData.email
        });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw rpcError;
      }

      console.log('Coupon validation result:', data);
      const result = data as any;

      if (!result || !result.success) {
        const errorMsg = result?.error || 'Invalid coupon response';
        console.error('Coupon validation failed:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (!result.assessment_type || !result.coupon_id || !result.created_by) {
        console.error('Missing required fields in coupon response:', result);
        setError('Invalid coupon data received. Please contact support.');
        setLoading(false);
        return;
      }

      console.log('Coupon valid, triggering success callback');
      setLoading(false);
      onRedemptionSuccess(
        result.assessment_type,
        result.coupon_id,
        result.created_by,
        formData.name,
        formData.email
      );
    } catch (err: any) {
      console.error('Coupon redemption error:', err);
      setError(err.message || 'Failed to redeem coupon. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#3DB3E3] p-3 rounded-full">
            <Ticket className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0A2A5E]">Redeem Coupon</h2>
            <p className="text-gray-600 text-sm">Enter your details and coupon code</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent font-mono uppercase"
              placeholder="XXXXXXXXXXXXX"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <X size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0A2A5E] text-white px-4 py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Validating...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Redeem Code
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
