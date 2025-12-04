import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerificationRequest {
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email }: VerificationRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = btoa(email + ':' + Date.now());
    const baseUrl = Deno.env.get('VITE_APP_URL') || 'http://localhost:5173';
    const verificationLink = `${baseUrl}?verify_token=${accessToken}`;

    console.log('Verification email prepared for:', email);
    console.log('Verification link:', verificationLink);

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
            background: #FFF5E6;
            border-left: 4px solid #FFB84D;
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
            <p>Hello,</p>
            <p>Thank you for your interest in the <strong>BrainWorx Comprehensive Brain Assessment</strong>.</p>
            <p>This assessment will help you understand your cognitive strengths, identify areas for growth, and receive personalized recommendations for optimization.</p>

            <div class="button-container">
              <a href="${verificationLink}" class="button">Verify Email & Start Assessment</a>
            </div>

            <div class="info-box">
              <strong>What to Expect:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>350 comprehensive questions</li>
                <li>20-30 minutes to complete</li>
                <li>Detailed analysis report</li>
                <li>Personalized recommendations</li>
                <li>Optional consultation booking</li>
              </ul>
            </div>

            <p style="margin-top: 30px; padding: 20px; background: #E6F7FF; border-radius: 8px; border-left: 4px solid #3DB3E3;">
              <strong>Note:</strong> This verification link will expire in 24 hours. If you did not request this assessment, please ignore this email.
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

    console.log('Email body prepared (HTML length:', emailBody.length, 'bytes)');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email prepared successfully',
        email,
        accessToken,
        verificationLink,
        emailPreview: emailBody.substring(0, 200) + '...'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-verification-email:', error);
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
