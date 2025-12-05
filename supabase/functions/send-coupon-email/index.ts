import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createTransport } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CouponEmailRequest {
  recipientName: string;
  recipientEmail: string;
  couponCode: string;
  assessmentType: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recipientName, recipientEmail, couponCode, assessmentType }: CouponEmailRequest = await req.json();

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!couponCode || !assessmentType) {
      return new Response(
        JSON.stringify({ error: 'Coupon code and assessment type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GMAIL_USER = "payments@brainworx.co.za";
    const GMAIL_PASSWORD = "iuhzjjhughbnwsvf";

    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASSWORD,
      },
    });

    const baseUrl = 'https://www.brainworx.co.za';
    const redemptionLink = `${baseUrl}?coupon=${couponCode}`;

    console.log('Sending coupon email to:', recipientEmail);
    console.log('Coupon code:', couponCode);

    const emailBody = `
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
          .content p {
            margin: 0 0 20px 0;
            font-size: 16px;
            color: #333;
          }
          .coupon-box {
            background: #FFF5E6;
            border: 2px dashed #FFB84D;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .coupon-box h2 {
            color: #0A2A5E;
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          .coupon-code {
            background: white;
            color: #0A2A5E;
            padding: 20px 30px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
            border-radius: 8px;
            margin: 15px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background: #0A2A5E;
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background 0.3s;
          }
          .button:hover {
            background: #3DB3E3;
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
            <p>Hello ${recipientName || 'there'},</p>
            <p>You have received a <strong>complimentary access code</strong> for the BrainWorx ${assessmentType}!</p>
            
            <div class="coupon-box">
              <h2>Your Exclusive Coupon Code</h2>
              <div class="coupon-code">${couponCode}</div>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">Use this code when starting your assessment</p>
            </div>

            <p>This assessment will help you understand your cognitive strengths, identify areas for growth, and receive personalized recommendations.</p>

            <div class="button-container">
              <a href="${redemptionLink}" class="button">Start Assessment Now</a>
            </div>

            <div class="info-box">
              <strong>How to Use Your Coupon:</strong>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Click the button above or visit BrainWorx</li>
                <li>Select "Get Started"</li>
                <li>Choose "Have a Coupon Code?"</li>
                <li>Enter your code: <strong>${couponCode}</strong></li>
                <li>Complete your assessment</li>
              </ol>
            </div>

            <p style="margin-top: 30px; padding: 20px; background: #FFF5E6; border-radius: 8px; border-left: 4px solid #FFB84D;">
              <strong>Note:</strong> This is a complimentary assessment. No payment is required. Simply use your coupon code to get started.
            </p>
          </div>

          <div class="footer">
            <p>&copy; 2024 BrainWorx. All rights reserved.</p>
            <p class="tagline">Transform Your Mind, Reach The World</p>
            <p style="margin-top: 15px; font-size: 12px;">
              Questions? Contact us at <a href="mailto:support@brainworx.com" style="color: #3DB3E3;">support@brainworx.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `BrainWorx <${GMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your BrainWorx Complimentary Assessment Code - ${couponCode}`,
      html: emailBody,
    });

    console.log('✅ Coupon email sent successfully to:', recipientEmail);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Coupon email sent successfully',
        recipientEmail,
        couponCode,
        redemptionLink
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-coupon-email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});