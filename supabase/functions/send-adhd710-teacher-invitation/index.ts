import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  assessmentId: string;
  teacherName: string;
  teacherEmail: string;
  childName: string;
  childAge: number;
  parentName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const body: RequestBody = await req.json();
    const { assessmentId, teacherName, teacherEmail, childName, childAge, parentName } = body;

    if (!assessmentId || !teacherEmail || !childName || !parentName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the base URL from the request
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const assessmentLink = `${baseUrl}/#/adhd710/${assessmentId}/teacher`;

    // Create HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      padding: 30px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .info-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .highlight {
      background: #fef3c7;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">BrainWorx NIPP</div>
    <div style="font-size: 14px; opacity: 0.9;">Neural Imprint Patterns Assessment</div>
  </div>

  <div class="content">
    <h2>Teacher Assessment Request</h2>

    <p>Dear ${teacherName || 'Teacher'},</p>

    <p>
      ${parentName} has requested your assistance in completing an ADHD assessment for
      <strong>${childName}</strong> (age ${childAge}). This assessment is part of the BrainWorx
      Neural Imprint Patterns (NIPP) screening system for children aged 7-10 years.
    </p>

    <div class="info-box">
      <strong>Assessment Details:</strong><br>
      <strong>Student:</strong> ${childName}<br>
      <strong>Age:</strong> ${childAge} years<br>
      <strong>Parent/Guardian:</strong> ${parentName}<br>
      <strong>Assessment Type:</strong> ADHD Focus & Behaviour Screen (Ages 7-10)
    </div>

    <p>
      <strong>What is required:</strong><br>
      This questionnaire contains 80 questions about the child's behavior, attention, and emotional
      regulation in the school setting. It typically takes 15-20 minutes to complete.
    </p>

    <p>
      The assessment uses a 1-4 rating scale (Not at all true → Completely true) to evaluate patterns
      across multiple domains including attention, hyperactivity, impulse control, organization, and
      emotional/social functioning.
    </p>

    <p><strong>Your input is crucial</strong> as it provides the school perspective that will be combined
    with the parent's observations to create a comprehensive picture of the child's functioning across settings.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${assessmentLink}" class="button">
        Complete Teacher Assessment
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      Or copy and paste this link into your browser:<br>
      <a href="${assessmentLink}" style="color: #3b82f6; word-break: break-all;">${assessmentLink}</a>
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <strong>⏰ Time Sensitive:</strong> Please complete this assessment within 5 days if possible.
      Your responses help ensure the child receives appropriate support.
    </div>

    <p>
      <strong>Confidentiality:</strong><br>
      Your responses will be kept confidential and will only be shared with the child's parents/guardians
      and their assigned BrainWorx coach as part of the comprehensive assessment report.
    </p>

    <p>
      <strong>Questions or concerns?</strong><br>
      If you have any questions about this assessment, please contact ${parentName} or reply to this email.
    </p>

    <p>Thank you for taking the time to support ${childName}'s development and well-being.</p>

    <p>
      Warm regards,<br>
      <strong>BrainWorx Team</strong>
    </p>
  </div>

  <div class="footer">
    <p>
      This assessment is a screening tool and does not constitute a formal diagnosis.<br>
      It is designed to help identify areas where support may be beneficial.
    </p>
    <p>© ${new Date().getFullYear()} BrainWorx. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BrainWorx NIPP <noreply@brainworx.co.za>",
        to: [teacherEmail],
        subject: `Teacher Assessment Request for ${childName} - BrainWorx ADHD Screen`,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Teacher invitation sent successfully",
        emailId: resendData.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending teacher invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send teacher invitation" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
