#!/usr/bin/env node

/**
 * Script to resend coupon emails for payments that were received but emails failed to send
 *
 * Usage: node resend-missing-coupon-emails.js
 */

const SUPABASE_URL = 'https://zclsxlillnlxdwnrkwia.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbHN4bGlsbG5seGR3bnJrd2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODkxNDQsImV4cCI6MjA3NzM2NTE0NH0.yg2eMEBy7XjFlCEUBcFAH8C6KtFRGiHlD0InPXCfJeM';

// Map assessment type codes to display names
const assessmentDisplayNames = {
  'adhd1118': 'ADHD 11-18 Assessment (50 Questions)',
  'adhd710': 'ADHD 7-10 Assessment (80 Questions)',
  'nipa': 'Full Assessment (343 Questions)',
  'tcf': 'Teen Career & Future Direction'
};

async function resendCouponEmails() {
  console.log('Fetching coupons with missing emails...\n');

  // Fetch all coupons where email_sent is true but they need resending
  // (The flag was incorrectly set to true even when emails weren't sent)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/coupon_codes?select=*&order=created_at.desc&limit=10`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const coupons = await response.json();

  console.log(`Found ${coupons.length} recent coupons\n`);

  let sentCount = 0;
  let errorCount = 0;

  for (const coupon of coupons) {
    console.log(`Processing coupon ${coupon.code} for ${coupon.recipient_email}...`);

    try {
      const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-coupon-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientName: coupon.recipient_name,
          recipientEmail: coupon.recipient_email,
          couponCode: coupon.code,
          assessmentType: assessmentDisplayNames[coupon.assessment_type] || coupon.assessment_type
        })
      });

      const result = await emailResponse.json();

      if (result.success) {
        console.log(`✅ Email sent successfully to ${coupon.recipient_email}`);
        sentCount++;
      } else {
        console.log(`❌ Failed to send email: ${result.error}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Error sending email: ${error.message}`);
      errorCount++;
    }

    console.log('');
  }

  console.log('\n=== Summary ===');
  console.log(`Total coupons processed: ${coupons.length}`);
  console.log(`Emails sent successfully: ${sentCount}`);
  console.log(`Errors: ${errorCount}`);
}

resendCouponEmails().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});
