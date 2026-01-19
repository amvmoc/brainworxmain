import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@2.0.0";
import { jsPDF } from "npm:jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  customerName?: string;
  customerEmail?: string;
  assessmentType?: string;
  overallScore?: number;
  topImprints?: Array<{
    code: string;
    name: string;
    percentage: number;
    severity: string;
  }>;
  recommendations?: string[];
  responseId?: string;
  recipientType?: 'client' | 'coach';
}

async function handleResponseIdRequest(responseId: string, recipientType: 'client' | 'coach') {
  const { createClient } = await import('npm:@supabase/supabase-js@2.39.0');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch self-assessment data
  const { data: response, error: fetchError } = await supabase
    .from('self_assessment_responses')
    .select('*')
    .eq('id', responseId)
    .maybeSingle();

  if (fetchError || !response) {
    throw new Error('Self-assessment response not found');
  }

  const customerName = response.customer_name;
  const customerEmail = response.customer_email;
  const assessmentType = response.assessment_type || 'Self Assessment';
  const analysisResults = response.analysis_results || {};
  const overallScore = analysisResults.overallScore || 0;
  const topImprints = analysisResults.topImprints || [];

  if (recipientType === 'client') {
    // Send client report to customer
    return await sendClientReport(
      customerName,
      customerEmail,
      assessmentType,
      overallScore,
      topImprints,
      responseId,
      response.franchise_owner_id
    );
  } else {
    // Send coach report to franchise owner
    const { data: franchiseOwner } = await supabase
      .from('franchise_owners')
      .select('email, name')
      .eq('id', response.franchise_owner_id)
      .maybeSingle();

    if (!franchiseOwner) {
      throw new Error('Franchise owner not found');
    }

    return await sendCoachReport(
      customerName,
      customerEmail,
      franchiseOwner.email,
      franchiseOwner.name,
      assessmentType,
      overallScore,
      topImprints,
      analysisResults,
      responseId
    );
  }
}

async function sendClientReport(
  customerName: string,
  customerEmail: string,
  assessmentType: string,
  overallScore: number,
  topImprints: any[],
  responseId: string,
  franchiseOwnerId?: string
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);
  const SITE_URL = Deno.env.get('SITE_URL') || 'https://brainworx.co.za';

  const topImprintsHtml = topImprints.slice(0, 5)
    .map((imprint, idx) => `
      <tr>
        <td style="padding: 12px; border: 1px solid #e6e9ef;">
          <strong>${idx + 1}. ${imprint.code} - ${imprint.name}</strong>
        </td>
        <td style="padding: 12px; border: 1px solid #e6e9ef; text-align: center;">
          <strong style="color: #0A2A5E; font-size: 18px;">${imprint.percentage}%</strong>
        </td>
      </tr>
    `).join("");

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
          <h1 style="margin: 0; font-size: 28px;">Your Assessment Results</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${assessmentType}</p>
        </div>

        <div class="content">
          <p>Dear ${customerName},</p>

          <p>Thank you for completing your assessment with BrainWorx. Your personalized results are ready!</p>

          <div class="score-box">
            <h2 style="margin: 0 0 10px 0;">Overall Score</h2>
            <p style="font-size: 48px; font-weight: bold; margin: 0;">${overallScore}%</p>
          </div>

          <h2 style="color: #0A2A5E; margin-top: 30px;">Your Top Areas</h2>
          <p>These are your highest scoring areas based on your responses:</p>

          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th style="text-align: center;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${topImprintsHtml}
            </tbody>
          </table>

          <div style="background-color: #fff5e6; border-left: 4px solid #0A2A5E; padding: 15px; margin-top: 30px; border-radius: 4px;">
            <h3 style="color: #0A2A5E; margin-top: 0;">Next Steps</h3>
            <p style="margin-bottom: 0;">Schedule a consultation with a BrainWorx coach to discuss your results and create a personalized action plan.</p>
          </div>

          ${franchiseOwnerId ? `
          <div style="background: linear-gradient(135deg, #0A2A5E, #3DB3E3); color: white; padding: 24px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: 0 4px 12px rgba(10, 42, 94, 0.3);">
            <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700;">📅 Book Your Consultation</h2>
            <p style="margin: 0 0 20px 0; font-size: 15px; opacity: 0.95; line-height: 1.6;">
              Ready to turn these insights into action?<br>
              Schedule a session with your BrainWorx coach to discuss your results.
            </p>
            <a href="${SITE_URL}/book/ADMIN001?name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}"
               style="display: inline-block; background: white; color: #0A2A5E; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              Schedule Your Session
            </a>
            <p style="margin: 20px 0 0 0; font-size: 13px; opacity: 0.85;">
              View available times and book your appointment
            </p>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>BrainWorx - ${assessmentType}</strong></p>
          <p style="margin: 0;">© 2025 BrainWorx. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;


  await resend.emails.send({
    from: 'BrainWorx <payments@brainworx.co.za>',
    to: customerEmail,
    subject: `Your ${assessmentType} Results`,
    html: htmlContent,
  });

  console.log('Client report sent to:', customerEmail);

  return new Response(JSON.stringify({
    success: true,
    sentTo: customerEmail,
    type: 'client'
  }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function sendCoachReport(
  customerName: string,
  customerEmail: string,
  coachEmail: string,
  coachName: string,
  assessmentType: string,
  overallScore: number,
  topImprints: any[],
  analysisResults: any,
  responseId: string
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

  const allImprintsHtml = topImprints
    .map((imprint, idx) => `
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
        <td style="padding: 12px; border: 1px solid #e6e9ef; font-size: 12px;">
          ${imprint.itemCount} questions
        </td>
      </tr>
    `).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A2A5E, #3DB3E3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e6e9ef; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #0A2A5E; color: white; padding: 12px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Coach Report - ${assessmentType}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Comprehensive Analysis</p>
        </div>

        <div class="content">
          <p>Dear ${coachName},</p>

          <p>This comprehensive coach report provides detailed analysis for <strong>${customerName}</strong> (${customerEmail}).</p>

          <div style="background: linear-gradient(135deg, #3DB3E3, #1FAFA3); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">Overall Score</h2>
            <p style="font-size: 48px; font-weight: bold; margin: 0;">${overallScore}%</p>
          </div>

          <h2 style="color: #0A2A5E; margin-top: 30px;">Complete Neural Imprint Profile</h2>
          <table>
            <thead>
              <tr>
                <th>Neural Imprint</th>
                <th style="text-align: center;">Severity</th>
                <th style="text-align: center;">Score</th>
                <th style="text-align: center;">Questions</th>
              </tr>
            </thead>
            <tbody>
              ${allImprintsHtml}
            </tbody>
          </table>

          <h2 style="color: #0A2A5E; margin-top: 30px;">Clinical Notes</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>Client:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Assessment Type:</strong> ${assessmentType}</p>
            <p><strong>Overall Score:</strong> ${overallScore}%</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <h2 style="color: #0A2A5E; margin-top: 30px;">Coaching Recommendations</h2>
          <ul>
            <li>Review high-severity areas for immediate intervention</li>
            <li>Develop targeted action plan based on top imprints</li>
            <li>Schedule follow-up assessment in 3-6 months</li>
            <li>Consider additional specialized assessments as needed</li>
          </ul>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>BrainWorx - Comprehensive Coach Report</strong></p>
          <p style="margin: 0;">© 2025 BrainWorx. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;


  await resend.emails.send({
    from: 'BrainWorx <payments@brainworx.co.za>',
    to: coachEmail,
    subject: `Coach Report: ${customerName} - ${assessmentType}`,
    html: htmlContent,
  });

  console.log('Coach report sent to:', coachEmail);

  return new Response(JSON.stringify({
    success: true,
    sentTo: coachEmail,
    type: 'coach'
  }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const requestBody: EmailRequest = await req.json();

    // If responseId and recipientType are provided, fetch data from database
    if (requestBody.responseId && requestBody.recipientType) {
      return await handleResponseIdRequest(requestBody.responseId, requestBody.recipientType);
    }

    // Otherwise use the legacy direct data flow
    const {
      customerName,
      customerEmail,
      assessmentType,
      overallScore,
      topImprints,
      recommendations,
      responseId
    } = requestBody as Required<EmailRequest>;

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);


    // CRITICAL: Generate PDF report - this MUST always be included in the customer email
    console.log('Generating Self-Assessment PDF report for:', customerName);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPos = 20;

    // Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('BrainWorx', 20, 20);

    doc.setFontSize(16);
    doc.text(assessmentType, 20, 30);
    doc.setFontSize(12);
    doc.text('Self-Assessment Results', 20, 38);

    yPos = 60;
    doc.setTextColor(0, 0, 0);

    // Client Info
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Report for: ${customerName}`, 20, yPos);
    yPos += 10;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Assessment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPos);
    yPos += 7;
    doc.text(`Overall Score: ${overallScore}%`, 20, yPos);
    yPos += 15;

    // Top Imprints Section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Top Neural Imprints', 20, yPos);
    yPos += 10;

    topImprints.forEach((imprint: any, index: number) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const title = `${index + 1}. ${imprint.code} - ${imprint.name}`;
      doc.text(title, 25, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Score: ${imprint.percentage}% | Severity: ${imprint.severity}`, 25, yPos);
      yPos += 10;
    });

    // Disclaimer
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 10;
    doc.setFillColor(255, 243, 205);
    doc.rect(15, yPos - 5, 180, 35, 'F');
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Important Disclaimer:', 20, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');
    const disclaimerText = 'This is a self-assessment tool for personal insight and is NOT a psychological evaluation or medical diagnosis. Results should be reviewed with a qualified professional. If experiencing mental health concerns, please consult a healthcare provider.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, 165);
    doc.text(disclaimerLines, 20, yPos);

    const pdfBuffer = new Uint8Array(doc.output('arraybuffer'));

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Self-Assessment PDF generation failed - buffer is empty');
    }

    console.log('✓ Self-Assessment PDF generated successfully. Size:', pdfBuffer.length, 'bytes');

    const pdfFilename = `BrainWorx_Self_Assessment_${customerName.replace(/\s+/g, '_')}.pdf`;
    console.log('Sending customer email with PDF attachment:', pdfFilename);

    await resend.emails.send({
      from: 'BrainWorx <payments@brainworx.co.za>',
      to: customerEmail,
      subject: `Your ${assessmentType} Results - BrainWorx`,
      html: htmlContent,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log('✓ PDF attachment included:', pdfFilename);

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
      await resend.emails.send({
        from: 'BrainWorx <payments@brainworx.co.za>',
        to: franchiseOwnerEmail,
        subject: `New Self-Assessment Completed - ${customerName}`,
        html: franchiseEmailContent,
      });

      console.log('✓ Franchise owner email sent to:', franchiseOwnerEmail);
    }

    await resend.emails.send({
      from: 'BrainWorx <payments@brainworx.co.za>',
      to: BRAINWORX_EMAIL,
      subject: `New Self-Assessment Completed - ${customerName}`,
      html: franchiseEmailContent,
    });

    console.log('✓ Admin email sent to:', BRAINWORX_EMAIL);

    await resend.emails.send({
      from: 'BrainWorx <payments@brainworx.co.za>',
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