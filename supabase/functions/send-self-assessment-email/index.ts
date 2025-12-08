import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  customerName: string;
  customerEmail: string;
  assessmentType: string;
  overallScore: number;
  topImprints: Array<{
    code: string;
    name: string;
    percentage: number;
    severity: string;
  }>;
  recommendations: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      customerName,
      customerEmail,
      assessmentType,
      overallScore,
      topImprints,
      recommendations
    }: EmailRequest = await req.json();

    const topImprintsHtml = topImprints
      .map(
        (imprint, idx) => `
        <tr>
          <td style="padding: 12px; border: 1px solid #e6e9ef;">
            <strong>${idx + 1}. ${imprint.code} - ${imprint.name}</strong>
          </td>
          <td style="padding: 12px; border: 1px solid #e6e9ef; text-align: center;">
            <span style="background-color: ${imprint.severity === 'high' ? '#ef4444' : imprint.severity === 'moderate' ? '#eab308' : '#22c55e'}; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 12px;">
              ${imprint.severity.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; border: 1px solid #e6e9ef; text-align: center;">
            <strong style="color: #0A2A5E; font-size: 18px;">${imprint.percentage}%</strong>
          </td>
        </tr>
      `
      )
      .join("");

    const recommendationsHtml = recommendations
      .map((rec, idx) => `<li style="margin-bottom: 10px;">${idx + 1}. ${rec}</li>`)
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0A2A5E, #3DB3E3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e6e9ef; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
          .score-box { background: linear-gradient(135deg, #3DB3E3, #1FAFA3); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #0A2A5E; color: white; padding: 12px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">BrainWorx Assessment Results</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${assessmentType}</p>
          </div>

          <div class="content">
            <p>Dear ${customerName},</p>

            <p>Thank you for completing the <strong>${assessmentType}</strong> with BrainWorx. Your personalized neural imprint profile analysis is ready!</p>

            <div class="score-box">
              <h2 style="margin: 0 0 10px 0;">Overall Profile Score</h2>
              <p style="font-size: 48px; font-weight: bold; margin: 0;">${overallScore}%</p>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">
                ${overallScore >= 70 ? 'High Intensity' : overallScore >= 40 ? 'Moderate Intensity' : 'Balanced Profile'}
              </p>
            </div>

            <h2 style="color: #0A2A5E; margin-top: 30px;">Top Neural Imprint Patterns</h2>
            <p>These are the most prominent neural imprint patterns identified in your assessment:</p>

            <table>
              <thead>
                <tr>
                  <th>Neural Imprint</th>
                  <th style="text-align: center;">Severity</th>
                  <th style="text-align: center;">Score</th>
                </tr>
              </thead>
              <tbody>
                ${topImprintsHtml}
              </tbody>
            </table>

            <h2 style="color: #0A2A5E; margin-top: 30px;">Personalized Recommendations</h2>
            <ul style="padding-left: 20px;">
              ${recommendationsHtml}
            </ul>

            <div style="background-color: #fff5e6; border-left: 4px solid #FFB84D; padding: 15px; margin-top: 30px; border-radius: 4px;">
              <h3 style="color: #0A2A5E; margin-top: 0;">Next Steps</h3>
              <p style="margin-bottom: 0;">To dive deeper into your results and create a personalized action plan, we recommend scheduling a 45-minute coaching session with our certified BrainWorx coaches.</p>
            </div>

            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-top: 20px; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #666;"><strong>Important Disclaimer:</strong> This assessment is a self-reflection and coaching tool, not a medical or psychological diagnosis. Results should not be used to start, change, or stop any medication or treatment. Please consult with licensed professionals for medical or mental health concerns.</p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>BrainWorx - Neural Imprint Patterns Assessment</strong></p>
            <p style="margin: 0;">© 2025 BrainWorx. All rights reserved.</p>
            <p style="margin: 10px 0 0 0; font-size: 11px;">This email contains confidential assessment results. Please do not forward.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BrainWorx <noreply@brainworx.co.za>",
        to: [customerEmail],
        subject: `Your ${assessmentType} Results - BrainWorx`,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, messageId: data.id }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in send-self-assessment-email function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});