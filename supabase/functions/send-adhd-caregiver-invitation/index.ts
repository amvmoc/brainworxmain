import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvitationRequest {
  caregiverName: string;
  caregiverEmail: string;
  caregiverRelationship: string;
  parentName: string;
  childName: string;
  childAge: number;
  couponCode: string;
  assessmentUrl: string;
  assessmentId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const requestData: InvitationRequest = await req.json();
    const {
      caregiverName,
      caregiverEmail,
      caregiverRelationship,
      parentName,
      childName,
      childAge,
      couponCode,
      assessmentUrl
    } = requestData;

    const relationshipLabel = caregiverRelationship.replace('_', ' ');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .coupon-box {
      background: white;
      border: 2px dashed #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .coupon-code {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .info-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background: #1f2937;
      color: #9ca3af;
      padding: 20px;
      border-radius: 0 0 12px 12px;
      text-align: center;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🧠 BrainWorX Assessment</h1>
    <p style="margin: 10px 0 0 0;">ADHD Caregiver Assessment Invitation</p>
  </div>

  <div class="content">
    <p>Dear ${caregiverName},</p>

    <p>
      You've been invited by <strong>${parentName}</strong> to complete a caregiver assessment
      for <strong>${childName}</strong> (age ${childAge}).
    </p>

    <div class="info-box">
      <p style="margin: 0; font-size: 14px;">
        <strong>Why Your Input Matters:</strong><br>
        As a ${relationshipLabel}, your observations of ${childName}'s behavior in your setting provide crucial
        insights. This assessment compares perspectives from home and school/care environments to create
        a comprehensive understanding of the child's behaviors.
      </p>
    </div>

    <p><strong>Your unique access code:</strong></p>

    <div class="coupon-box">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">Coupon Code</p>
      <div class="coupon-code">${couponCode}</div>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">Valid for 30 days</p>
    </div>

    <div style="text-align: center;">
      <a href="${assessmentUrl}" class="button">
        Complete Assessment Now
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      Or copy and paste this link into your browser:<br>
      <span style="word-break: break-all; color: #3b82f6;">${assessmentUrl}</span>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p><strong>What to Expect:</strong></p>
    <ul style="font-size: 14px; color: #4b5563;">
      <li>50 questions about ${childName}'s behaviors</li>
      <li>Takes approximately 15-20 minutes</li>
      <li>All responses are confidential</li>
      <li>Your perspective will be combined with the parent's assessment</li>
    </ul>

    <p style="font-size: 14px; color: #6b7280;">
      <strong>Note:</strong> This assessment is most effective when completed thoughtfully
      based on your regular observations of the child.
    </p>
  </div>

  <div class="footer">
    <p style="margin: 0;">
      <strong>BrainWorX - Neural Imprint Pattern Profiling</strong><br>
      Helping understand behaviors through comprehensive assessment
    </p>
    <p style="margin: 10px 0 0 0; font-size: 11px;">
      If you have questions, please contact ${parentName}
    </p>
  </div>
</body>
</html>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'BrainWorX Assessments <noreply@brainworx-app.com>',
        to: [caregiverEmail],
        subject: `ADHD Assessment Invitation for ${childName} - Your Input Needed`,
        html: htmlContent
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation email sent successfully',
        emailId: emailData.id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error sending invitation:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      resendKeyExists: !!RESEND_API_KEY
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send invitation email',
        details: `RESEND_API_KEY present: ${!!RESEND_API_KEY}`
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500
      }
    );
  }
});