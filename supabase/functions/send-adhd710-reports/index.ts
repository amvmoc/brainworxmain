import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: RequestBody = await req.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return new Response(
        JSON.stringify({ error: "Assessment ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from("adhd_assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error("Assessment not found");
    }

    // Check if both responses are completed
    if (assessment.status !== "both_completed") {
      return new Response(
        JSON.stringify({ error: "Both parent and teacher assessments must be completed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get responses
    const { data: responses, error: responsesError } = await supabase
      .from("adhd_assessment_responses")
      .select("*")
      .eq("assessment_id", assessmentId);

    if (responsesError || !responses || responses.length !== 2) {
      throw new Error("Could not retrieve assessment responses");
    }

    const parentResponse = responses.find(r => r.respondent_type === "parent");
    const teacherResponse = responses.find(r => r.respondent_type === "caregiver");

    if (!parentResponse || !teacherResponse) {
      throw new Error("Missing parent or teacher response");
    }

    // Get franchise owner details if available
    let franchiseOwnerEmail = null;
    if (assessment.franchise_owner_id) {
      const { data: franchiseOwner } = await supabase
        .from("franchise_owners")
        .select("email, full_name")
        .eq("id", assessment.franchise_owner_id")
        .single();

      if (franchiseOwner) {
        franchiseOwnerEmail = franchiseOwner.email;
      }
    }

    // Get the base URL from the request
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const resultsLink = `${baseUrl}/#/adhd710/${assessment.share_token}/results`;

    // Calculate pattern scores for email summary
    const parentScores = parentResponse.scores?.nippScores || {};
    const teacherScores = teacherResponse.scores?.nippScores || {};

    const patterns = Object.keys(parentScores).map(code => {
      const parentScore = parentScores[code];
      const teacherScore = teacherScores[code];
      const combinedScore = (parentScore + teacherScore) / 2;

      return {
        code,
        parentScore,
        teacherScore,
        combinedScore,
      };
    });

    // Sort patterns by combined score
    patterns.sort((a, b) => b.combinedScore - a.combinedScore);
    const topPatterns = patterns.slice(0, 3);

    // Create parent email
    const parentEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .pattern-item {
      margin: 10px 0;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">BrainWorx NIPP</div>
    <div style="font-size: 14px; opacity: 0.9;">Assessment Complete</div>
  </div>

  <div class="content">
    <h2>Your Child's ADHD Assessment Results Are Ready</h2>

    <p>Dear ${parentResponse.respondent_name},</p>

    <p>
      The ADHD assessment for <strong>${assessment.child_name}</strong> has been completed by both
      you and ${teacherResponse.respondent_name}. The comprehensive report is now available.
    </p>

    <div class="info-box">
      <strong>Top 3 Patterns Identified:</strong><br><br>
      ${topPatterns.map(p => `
        <div class="pattern-item">
          <strong>${p.code}</strong> - Combined Score: ${p.combinedScore.toFixed(2)}/4.0
        </div>
      `).join('')}
    </div>

    <p>
      <strong>What's included in your report:</strong>
    </p>
    <ul>
      <li>Detailed analysis of 10 ADHD-related patterns</li>
      <li>Comparison of observations from home and school</li>
      <li>Visual charts showing pattern strengths</li>
      <li>Practical guidance for supporting your child</li>
      <li>Recommendations for next steps</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resultsLink}" class="button">
        View Complete Report
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      Or copy and paste this link into your browser:<br>
      <a href="${resultsLink}" style="color: #3b82f6; word-break: break-all;">${resultsLink}</a>
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <strong>Important:</strong> This assessment is a screening tool, not a diagnosis.
      We recommend discussing these results with your BrainWorx coach or a qualified healthcare professional.
    </div>

    <p>
      Your BrainWorx coach will receive the detailed professional report and will be in touch to
      discuss the findings and next steps.
    </p>

    <p>
      Best regards,<br>
      <strong>The BrainWorx Team</strong>
    </p>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p>© ${new Date().getFullYear()} BrainWorx. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    // Create teacher email
    const teacherEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">BrainWorx NIPP</div>
    <div style="font-size: 14px; opacity: 0.9;">Assessment Complete - Thank You</div>
  </div>

  <div class="content">
    <h2>Assessment Completed</h2>

    <p>Dear ${teacherResponse.respondent_name},</p>

    <p>
      Thank you for completing the ADHD assessment for <strong>${assessment.child_name}</strong>.
      Your input as ${assessment.child_name}'s teacher has been invaluable in creating a comprehensive
      picture of their functioning across different settings.
    </p>

    <p>
      The assessment results have been compiled and shared with ${parentResponse.respondent_name}.
      The family's BrainWorx coach will use these insights to develop appropriate support strategies.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resultsLink}" class="button">
        View Assessment Results
      </a>
    </div>

    <p>
      If you have any questions about the assessment or would like to discuss the findings with
      ${parentResponse.respondent_name}, please feel free to reach out to them directly.
    </p>

    <p>
      Thank you again for your time and valuable input in supporting ${assessment.child_name}'s development.
    </p>

    <p>
      Warm regards,<br>
      <strong>The BrainWorx Team</strong>
    </p>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p>© ${new Date().getFullYear()} BrainWorx. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    // Send emails
    const emailPromises = [
      // Send to parent
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "BrainWorx NIPP <noreply@brainworx.co.za>",
          to: [parentResponse.respondent_email],
          subject: `${assessment.child_name}'s ADHD Assessment Results - BrainWorx NIPP`,
          html: parentEmailHtml,
        }),
      }),

      // Send to teacher
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "BrainWorx NIPP <noreply@brainworx.co.za>",
          to: [teacherResponse.respondent_email],
          subject: `Assessment Complete: ${assessment.child_name} - Thank You`,
          html: teacherEmailHtml,
        }),
      }),
    ];

    // Add franchise owner email if available
    if (franchiseOwnerEmail) {
      const coachEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">BrainWorx NIPP</div>
    <div style="font-size: 14px; opacity: 0.9;">New Assessment Complete - Coach Report</div>
  </div>

  <div class="content">
    <h2>ADHD 7-10 Assessment Complete</h2>

    <p>A new ADHD assessment has been completed and is ready for your review.</p>

    <div class="info-box">
      <strong>Client Information:</strong><br>
      <strong>Child:</strong> ${assessment.child_name} (Age ${assessment.child_age})<br>
      <strong>Parent:</strong> ${parentResponse.respondent_name}<br>
      <strong>Teacher:</strong> ${teacherResponse.respondent_name}<br>
      <strong>Completed:</strong> ${new Date().toLocaleDateString()}
    </div>

    <p>
      <strong>Quick Summary - Top 3 Patterns:</strong>
    </p>
    ${topPatterns.map(p => `
      <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 6px;">
        <strong>${p.code}</strong> - Combined Score: ${p.combinedScore.toFixed(2)}/4.0
      </div>
    `).join('')}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resultsLink}" class="button">
        View Professional Report
      </a>
    </div>

    <p>
      The full professional/coach report includes:
    </p>
    <ul>
      <li>Detailed cross-setting analysis</li>
      <li>Clinical interpretation and ADHD likelihood assessment</li>
      <li>Parent-teacher rating comparisons</li>
      <li>Coaching focus recommendations</li>
      <li>Next steps and intervention priorities</li>
    </ul>

    <p>
      You can also access this assessment from your dashboard.
    </p>

    <p>
      Best regards,<br>
      <strong>BrainWorx System</strong>
    </p>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p>© ${new Date().getFullYear()} BrainWorx. All rights reserved.</p>
  </div>
</body>
</html>
      `;

      emailPromises.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "BrainWorx NIPP <noreply@brainworx.co.za>",
            to: [franchiseOwnerEmail],
            subject: `New ADHD Assessment Complete: ${assessment.child_name}`,
            html: coachEmailHtml,
          }),
        })
      );
    }

    // Send all emails
    const emailResults = await Promise.all(emailPromises);
    const allSuccessful = emailResults.every(r => r.ok);

    if (!allSuccessful) {
      console.error("Some emails failed to send");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reports sent successfully",
        emailsSent: emailResults.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending reports:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send reports" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
