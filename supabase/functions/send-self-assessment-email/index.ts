import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createTransport } from "npm:nodemailer@6.9.7";

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
  responseId?: string;
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
      recommendations,
      responseId
    }: EmailRequest = await req.json();

    const SITE_URL = Deno.env.get('SITE_URL') || 'https://brainworx.co.za';

    let resultsUrl = '';
    let bookingUrl = SITE_URL;

    if (responseId) {
      const { createClient } = await import('npm:@supabase/supabase-js@2.39.0');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: response } = await supabase
        .from('self_assessment_responses')
        .select('share_token, franchise_owner_id')
        .eq('id', responseId)
        .maybeSingle();

      if (response?.share_token) {
        resultsUrl = `${SITE_URL}/results/${response.share_token}`;
      }

      if (response?.franchise_owner_id) {
        const { data: franchiseOwner } = await supabase
          .from('franchise_owners')
          .select('unique_link_code')
          .eq('id', response.franchise_owner_id)
          .maybeSingle();

        if (franchiseOwner?.unique_link_code) {
          bookingUrl = `${SITE_URL}/book/${franchiseOwner.unique_link_code}`;
        }
      }
    }

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

            ${resultsUrl || bookingUrl !== SITE_URL ? `
            <div style="text-align: center; margin: 30px 0;">
              ${resultsUrl ? `
              <a href="${resultsUrl}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #3DB3E3, #1FAFA3); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
                View Full Results
              </a>
              ` : ''}
              ${bookingUrl !== SITE_URL ? `
              <a href="${bookingUrl}" style="display: inline-block; padding: 15px 30px; background: #0A2A5E; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
                Book Consultation
              </a>
              ` : ''}
            </div>
            ` : ''}

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

    let franchiseOwnerEmail = '';
    let franchiseOwnerName = '';

    if (responseId) {
      const { createClient } = await import('npm:@supabase/supabase-js@2.39.0');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: response } = await supabase
        .from('self_assessment_responses')
        .select('franchise_owner_id')
        .eq('id', responseId)
        .maybeSingle();

      if (response?.franchise_owner_id) {
        const { data: franchiseOwner } = await supabase
          .from('franchise_owners')
          .select('email, name')
          .eq('id', response.franchise_owner_id)
          .maybeSingle();

        if (franchiseOwner) {
          franchiseOwnerEmail = franchiseOwner.email;
          franchiseOwnerName = franchiseOwner.name;
        }
      }
    }

    const BRAINWORX_EMAIL = 'info@brainworx.co.za';
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

    await transporter.sendMail({
      from: `BrainWorx <${GMAIL_USER}>`,
      to: customerEmail,
      subject: `Your ${assessmentType} Results - BrainWorx`,
      html: htmlContent,
    });

    console.log('✓ Customer email sent to:', customerEmail);

    const franchiseEmailContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
          <div style="background: #0A2A5E; color: white; padding: 30px;">
            <h2 style="margin: 0;">New Self-Assessment Completed</h2>
          </div>
          <div style="padding: 30px;">
            <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
            ${franchiseOwnerEmail ? `<p><strong>Franchise Owner:</strong> ${franchiseOwnerName} (${franchiseOwnerEmail})</p>` : ''}
            <p><strong>Assessment Type:</strong> ${assessmentType}</p>
            <p><strong>Overall Score:</strong> ${overallScore}%</p>
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0;">Top Imprints:</h3>
              ${topImprints.map((imp: any, idx: number) => `<div style="margin: 5px 0;">${idx + 1}. <strong>${imp.code} - ${imp.name}</strong> (${imp.percentage}% - ${imp.severity})</div>`).join('')}
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0;">Recommendations:</h3>
              <ol style="margin: 0; padding-left: 20px;">
                ${recommendations.map((rec: string) => `<li style="margin: 5px 0;">${rec}</li>`).join('')}
              </ol>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    if (franchiseOwnerEmail) {
      await transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: franchiseOwnerEmail,
        subject: `New Self-Assessment Completed - ${customerName}`,
        html: franchiseEmailContent,
      });

      console.log('✓ Franchise owner email sent to:', franchiseOwnerEmail);
    }

    await transporter.sendMail({
      from: `BrainWorx <${GMAIL_USER}>`,
      to: BRAINWORX_EMAIL,
      subject: `New Self-Assessment Completed - ${customerName}`,
      html: franchiseEmailContent,
    });

    console.log('✓ Admin email sent to:', BRAINWORX_EMAIL);

    await transporter.sendMail({
      from: `BrainWorx <${GMAIL_USER}>`,
      to: 'kobus@brainworx.co.za',
      subject: `New Self-Assessment Completed - ${customerName}`,
      html: franchiseEmailContent,
    });

    console.log('✓ Kobus email sent to: kobus@brainworx.co.za');

    return new Response(JSON.stringify({
      success: true,
      sentTo: {
        customer: customerEmail,
        franchiseOwner: franchiseOwnerEmail || 'N/A',
        admin: BRAINWORX_EMAIL,
        kobus: 'kobus@brainworx.co.za'
      }
    }), {
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