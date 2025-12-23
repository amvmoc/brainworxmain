import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PayFastITN {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  signature: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const itnData: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      itnData[key] = value.toString();
    }

    console.log('PayFast ITN received:', itnData);

    if (itnData.payment_status !== 'COMPLETE') {
      console.log('Payment not complete:', itnData.payment_status);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const email = itnData.email_address || itnData.custom_str1;
    const itemName = itnData.item_name;
    const userName = `${itnData.name_first || ''} ${itnData.name_last || ''}`.trim() || 'Customer';

    if (!email) {
      console.error('No email found in ITN data');
      return new Response('Missing email', { status: 400, headers: corsHeaders });
    }

    // Map item names to assessment type codes (used by the frontend)
    let assessmentType = '';
    let assessmentDisplayName = '';

    if (itemName === 'NIP') {
      assessmentType = 'nipa';
      assessmentDisplayName = 'Full Assessment (343 Questions)';
    } else if (itemName === 'ADHD Assessment') {
      assessmentType = 'adhd1118';
      assessmentDisplayName = 'ADHD 11-18 Assessment (50 Questions)';
    } else if (itemName === 'TCF') {
      assessmentType = 'tcf';
      assessmentDisplayName = 'Teen Career & Future Direction';
    } else {
      // Try to extract type code from item name or use as-is
      assessmentType = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
      assessmentDisplayName = itemName;
    }

    const couponCode = Array.from({ length: 10 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');

    const { data: coupon, error: couponError } = await supabase
      .from('coupon_codes')
      .insert({
        code: couponCode,
        assessment_type: assessmentType,
        max_uses: 1,
        current_uses: 0,
        is_active: true,
        recipient_name: userName,
        recipient_email: email,
        email_sent: false,
      })
      .select()
      .single();

    if (couponError) {
      console.error('Error creating coupon:', couponError);
      return new Response('Error creating coupon', { status: 500, headers: corsHeaders });
    }

    console.log('Coupon created:', couponCode, 'for', email);

    // Send coupon email with error handling
    try {
      const emailResult = await supabase.functions.invoke('send-coupon-email', {
        body: {
          recipientEmail: email,
          recipientName: userName,
          couponCode: couponCode,
          assessmentType: assessmentDisplayName,
        },
      });

      if (emailResult.error) {
        console.error('Error sending coupon email:', emailResult.error);
        // Update email_sent flag to false since it failed
        await supabase
          .from('coupon_codes')
          .update({ email_sent: false })
          .eq('code', couponCode);
      } else {
        console.log('✅ Coupon email sent successfully to:', email);
        // Update email_sent flag to true
        await supabase
          .from('coupon_codes')
          .update({ email_sent: true })
          .eq('code', couponCode);
      }
    } catch (emailError) {
      console.error('Exception sending coupon email:', emailError);
      // Update email_sent flag to false since it failed
      await supabase
        .from('coupon_codes')
        .update({ email_sent: false })
        .eq('code', couponCode);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error processing PayFast ITN:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});