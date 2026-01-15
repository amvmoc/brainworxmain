// Test script to send email via Resend API
// This sends a test email to verify the Resend integration

const RESEND_API_KEY = 're_NY61cKgL_DVkphRkY3zaG9begRdfZrGsE';
const FROM_EMAIL = 'payments@brainworx.co.za';
const TO_EMAIL = 'andrimocke@gmail.com';

async function sendTestEmail() {
  console.log('🚀 Sending test email via Resend...\n');
  console.log('From:', FROM_EMAIL);
  console.log('To:', TO_EMAIL);
  console.log('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `BrainWorx <${FROM_EMAIL}>`,
        to: TO_EMAIL,
        subject: '✅ BrainWorx Email System Test - Success!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
              }
              .header {
                background: linear-gradient(135deg, #0A2A5E 0%, #3DB3E3 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 32px;
                font-weight: bold;
              }
              .header p {
                margin: 0;
                font-size: 16px;
                opacity: 0.9;
              }
              .content {
                padding: 40px 30px;
                background: white;
              }
              .success-badge {
                background: #4CAF50;
                color: white;
                padding: 20px 30px;
                border-radius: 10px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 30px 0;
              }
              .info-box {
                margin: 30px 0;
                padding: 20px;
                background: #E6F7FF;
                border-left: 4px solid #3DB3E3;
                border-radius: 4px;
              }
              .info-box strong {
                color: #0A2A5E;
              }
              .details-table {
                width: 100%;
                margin: 20px 0;
                border-collapse: collapse;
              }
              .details-table td {
                padding: 12px;
                border-bottom: 1px solid #eee;
              }
              .details-table td:first-child {
                font-weight: bold;
                color: #0A2A5E;
                width: 40%;
              }
              .footer {
                text-align: center;
                padding: 30px;
                background: #E6E9EF;
                color: #666;
              }
              .footer p {
                margin: 5px 0;
                font-size: 14px;
              }
              .footer .tagline {
                color: #3DB3E3;
                font-weight: 600;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🧠 BrainWorx</h1>
                <p>Transform Your Mind, Reach The World</p>
              </div>

              <div class="content">
                <div class="success-badge">
                  ✅ Email System Test Successful!
                </div>

                <p>Hello Andri,</p>
                <p>This is a test email to confirm that the BrainWorx email system is now fully operational using Resend with your ZOHO domain.</p>

                <div class="info-box">
                  <strong>🎉 What's Working:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>✓ Resend API integration configured</li>
                    <li>✓ ZOHO domain (brainworx.co.za) verified</li>
                    <li>✓ Sender address: payments@brainworx.co.za</li>
                    <li>✓ All edge functions updated</li>
                    <li>✓ Email templates are beautiful and professional</li>
                  </ul>
                </div>

                <table class="details-table">
                  <tr>
                    <td>Sender Email:</td>
                    <td>${FROM_EMAIL}</td>
                  </tr>
                  <tr>
                    <td>Test Date:</td>
                    <td>${new Date().toLocaleString('en-ZA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                  </tr>
                  <tr>
                    <td>Email Service:</td>
                    <td>Resend (via ZOHO Mail)</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td style="color: #4CAF50; font-weight: bold;">✓ OPERATIONAL</td>
                  </tr>
                </table>

                <div style="background: #FFF5E6; border: 2px solid #FFB84D; border-radius: 12px; padding: 20px; margin: 30px 0;">
                  <h3 style="color: #0A2A5E; margin-top: 0;">📧 All Email Functions Updated</h3>
                  <p style="margin: 10px 0; font-size: 14px; color: #666;">
                    The following email functions are now configured to use <strong>payments@brainworx.co.za</strong>:
                  </p>
                  <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px; color: #666;">
                    <li>Coupon/Assessment emails</li>
                    <li>Invoice confirmations</li>
                    <li>Booking reminders</li>
                    <li>ADHD assessment reports</li>
                    <li>NIP3 results</li>
                    <li>Trauma scan reports</li>
                    <li>All other system emails</li>
                  </ul>
                </div>

                <p style="margin-top: 30px; padding: 20px; background: #E6F7FF; border-radius: 8px; border-left: 4px solid #3DB3E3; text-align: center;">
                  <strong>Everything is ready to go!</strong> All emails will now be sent from payments@brainworx.co.za using your ZOHO mail configuration.
                </p>
              </div>

              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} BrainWorx. All rights reserved.</p>
                <p class="tagline">Transform Your Mind, Reach The World</p>
                <p style="margin-top: 15px; font-size: 12px;">
                  Email System Powered by Resend & ZOHO Mail
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API Error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    console.log('✅ SUCCESS! Email sent successfully!\n');
    console.log('Email ID:', result.id);
    console.log('\n📧 Check your inbox at:', TO_EMAIL);
    console.log('\nNote: If you don\'t see it in a few minutes, check your spam folder.');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify DNS records are properly configured in Resend dashboard');
    console.error('2. Check that domain verification is complete (green checkmark)');
    console.error('3. Ensure API key is valid and has sending permissions');
    console.error('4. DNS propagation can take up to 24-48 hours');
  }
}

sendTestEmail();
