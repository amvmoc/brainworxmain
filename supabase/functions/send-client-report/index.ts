import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PatternData {
  score: number;
  code: string;
  description: string;
}

interface CareerReportData {
  customerName: string;
  riaSecCode: string;
  riaSecExplanation: string;
  topInterests: Array<{ code: string; name: string; score: number }>;
  summary: string;
  nextSteps: string[];
  franchiseOwnerCode?: string;
}

interface ClientReportRequest {
  customerName?: string;
  customerEmail?: string;
  franchiseOwnerEmail?: string;
  franchiseOwnerName?: string;
  assessmentDate?: string;
  totalQuestions?: number;
  patterns?: Record<string, PatternData>;
  responseId?: string;
  recipientEmail?: string;
  recipientName?: string;
  reportData?: CareerReportData;
}

async function sendCareerClientReport(reportData: CareerReportData, recipientEmail: string, recipientName: string) {
  const { customerName, riaSecCode, riaSecExplanation, topInterests, summary, nextSteps, franchiseOwnerCode } = reportData;

  const topInterestsHtml = topInterests.map((interest, idx) => `
    <tr>
      <td style="padding: 12px; border: 1px solid #e6e9ef;">
        <strong>${idx + 1}. ${interest.name}</strong>
      </td>
      <td style="padding: 12px; border: 1px solid #e6e9ef; text-align: center;">
        <strong style="color: #0A2A5E; font-size: 18px;">${interest.score}%</strong>
      </td>
    </tr>
  `).join('');

  const nextStepsHtml = nextSteps.map((step, idx) => `
    <li style="margin-bottom: 10px;">${idx + 1}. ${step}</li>
  `).join('');

  const riasecLines = riaSecExplanation.split('\n\n');
  const riasecHtml = riasecLines.map(line => `<p style="margin: 10px 0;">${line}</p>`).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e6e9ef; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
        .score-box { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #667eea; color: white; padding: 12px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Your Career Direction Results</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Teen Career & Future Direction Assessment</p>
        </div>

        <div class="content">
          <p>Dear ${customerName},</p>

          <p>Thank you for completing the Career Direction Assessment with BrainWorx. Your personalized career profile is ready!</p>

          <div class="score-box">
            <h2 style="margin: 0 0 10px 0;">Your RIASEC Career Code</h2>
            <p style="font-size: 48px; font-weight: bold; margin: 0;">${riaSecCode}</p>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">This code represents your career interests and strengths</p>
          </div>

          <h2 style="color: #667eea; margin-top: 30px;">What Your Code Means</h2>
          ${riasecHtml}

          <h2 style="color: #667eea; margin-top: 30px;">Your Top Interest Areas</h2>
          <p>These are your strongest career interest areas based on your responses:</p>

          <table>
            <thead>
              <tr>
                <th>Interest Area</th>
                <th style="text-align: center;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${topInterestsHtml}
            </tbody>
          </table>

          <h2 style="color: #667eea; margin-top: 30px;">Your Career Profile Summary</h2>
          <p>${summary}</p>

          <h2 style="color: #667eea; margin-top: 30px;">Recommended Next Steps</h2>
          <ul style="padding-left: 20px;">
            ${nextStepsHtml}
          </ul>

          <div style="background: linear-gradient(to right, #fef3c7, #fef9c3); border: 4px solid #f59e0b; border-radius: 16px; padding: 32px; text-align: center; margin-top: 30px;">
            <h3 style="color: #92400e; font-size: 24px; margin: 0 0 16px 0;">🎁 Ready to Explore Further?</h3>
            <p style="color: #92400e; font-size: 16px; margin: 0 0 16px 0;">
              Book a <strong>FREE 45-Minute Career Coaching Session</strong> to:<br>
              ✓ Create your personalized action plan<br>
              ✓ Explore education pathways aligned with your interests<br>
              ✓ Discuss career options and next steps<br>
              ✓ Get expert guidance on your career journey
            </p>
            ${franchiseOwnerCode ? `
            <a href="${Deno.env.get('SITE_URL') || 'https://brainworx.co.za'}?book=${franchiseOwnerCode}"
               style="display: inline-block; margin-top: 16px; padding: 16px 32px; border-radius: 9999px; font-size: 18px; font-weight: 600; color: white; background: linear-gradient(to right, #10b981, #14b8a6); text-decoration: none;">
              Book Your FREE Session Now
            </a>
            ` : `
            <a href="mailto:info@brainworx.co.za?subject=FREE Career Coaching Session - ${riaSecCode} Profile"
               style="display: inline-block; margin-top: 16px; padding: 16px 32px; border-radius: 9999px; font-size: 18px; font-weight: 600; color: white; background: linear-gradient(to right, #10b981, #14b8a6); text-decoration: none;">
              Schedule Your FREE Session
            </a>
            `}
          </div>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-top: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; color: #666;"><strong>Important Note:</strong> This assessment is a career exploration tool designed to help identify interests and potential career directions. It should be used as a guide in conjunction with other career planning resources and professional guidance.</p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>BrainWorx - Career Direction Assessment</strong></p>
          <p style="margin: 0;">© 2025 BrainWorx. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);


  await resend.emails.send({
    from: 'BrainWorx <payments@brainworx.co.za>',
    to: recipientEmail,
    subject: `Your Career Direction Results - ${riaSecCode} Profile`,
    html: htmlContent,
  });

  console.log('Career client report sent to:', recipientEmail);

  return new Response(JSON.stringify({
    success: true,
    sentTo: recipientEmail
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
    const requestData: ClientReportRequest = await req.json();

    // Handle Career Assessment Reports
    if (requestData.reportData && requestData.recipientEmail) {
      return await sendCareerClientReport(requestData.reportData, requestData.recipientEmail, requestData.recipientName || requestData.reportData.customerName);
    }

    let customerName: string;
    let customerEmail: string;
    let franchiseOwnerCode: string | null = null;
    let assessmentDate: string;
    let totalQuestions: number;
    let patterns: Record<string, PatternData>;

    if (requestData.responseId) {
      const { createClient } = await import('npm:@supabase/supabase-js@2.39.0');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: response, error: responseError } = await supabase
        .from('responses')
        .select('customer_name, customer_email, answers, completed_at, franchise_owner_id')
        .eq('id', requestData.responseId)
        .single();

      if (responseError || !response) {
        throw new Error('Response not found');
      }

      customerName = response.customer_name;
      customerEmail = response.customer_email;
      assessmentDate = new Date(response.completed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      totalQuestions = Object.keys(response.answers).length;

      const calculatePatternScore = (answers: any, patternCode: string): number => {
        const patternAnswers = Object.entries(answers).filter(([key]) =>
          key.startsWith(patternCode)
        );
        if (patternAnswers.length === 0) return 0;
        const total = patternAnswers.reduce((sum, [, value]) => sum + (value as number), 0);
        return Math.round((total / (patternAnswers.length * 4)) * 100);
      };

      const patternNames: Record<string, { name: string; description: string }> = {
        DIS: { name: 'Distraction', description: 'Difficulty maintaining focus and attention' },
        HYP: { name: 'Hyperactivity', description: 'Excessive physical or mental restlessness' },
        ANG: { name: 'Anger', description: 'Difficulty managing angry emotions' },
        BURN: { name: 'Burnout', description: 'Physical and emotional exhaustion' },
        ORG: { name: 'Disorganization', description: 'Difficulty with planning and organization' },
        FOC: { name: 'Focus', description: 'Trouble maintaining concentration' },
        SHT: { name: 'Short-term Memory', description: 'Difficulty retaining recent information' },
        TRAP: { name: 'Trapped', description: 'Feeling stuck or unable to move forward' },
        IMP: { name: 'Impulsivity', description: 'Acting without thinking' },
        RES: { name: 'Restlessness', description: 'Constant need to be in motion' },
        CPL: { name: 'Completion', description: 'Difficulty finishing tasks' },
        NEGP: { name: 'Negative Perception', description: 'Tendency toward negative thinking' },
        NUH: { name: 'Not Understanding Hardwires', description: 'Lack of self-awareness' },
        DOG: { name: 'Dogged', description: 'Excessive persistence despite futility' },
        INFL: { name: 'Inflexibility', description: 'Resistance to change' },
        BULLY: { name: 'Bullying', description: 'Aggressive or dominating behavior' },
        LACK: { name: 'Lack of Empathy', description: 'Difficulty understanding others\' feelings' },
        DIM: { name: 'Diminished Self-worth', description: 'Low self-esteem' },
        INWF: { name: 'Inward Focus', description: 'Excessive self-preoccupation' },
        DEC: { name: 'Deception', description: 'Dishonesty or lack of truthfulness' }
      };

      patterns = {};
      for (const [code, info] of Object.entries(patternNames)) {
        const score = calculatePatternScore(response.answers, code);
        patterns[info.name] = {
          score,
          code,
          description: info.description
        };
      }

      if (response.franchise_owner_id) {
        const { data: franchiseOwner } = await supabase
          .from('franchise_owners')
          .select('unique_link_code')
          .eq('id', response.franchise_owner_id)
          .single();

        if (franchiseOwner) {
          franchiseOwnerCode = franchiseOwner.unique_link_code;
        }
      }
    } else {
      customerName = requestData.customerName!;
      customerEmail = requestData.customerEmail!;
      assessmentDate = requestData.assessmentDate!;
      totalQuestions = requestData.totalQuestions!;
      patterns = requestData.patterns!;
    }

    const patternsArray = Object.entries(patterns).sort(
      (a, b) => b[1].score - a[1].score
    );

    const highPatterns = patternsArray.filter(([, data]) => data.score >= 60);
    const mediumPatterns = patternsArray.filter(([, data]) => data.score >= 40 && data.score < 60);
    const lowPatterns = patternsArray.filter(([, data]) => data.score < 40);

    const renderPatternRow = (name: string, data: PatternData, color: string) => {
      return `
        <div style="background: linear-gradient(to right, #f8fafc, white); padding: 20px; margin-bottom: 16px; border-radius: 12px; border-left: 4px solid ${color};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h4 style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 0;">${name}</h4>
              <span style="display: inline-block; padding: 4px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; color: white; background-color: ${color}; margin-top: 8px;">
                ${data.score}%
              </span>
            </div>
          </div>
          <p style="color: #64748b; line-height: 1.6; margin: 12px 0 0 0;">${data.description}</p>
        </div>
      `;
    };

    const customerEmailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
          }
          .container { max-width: 800px; margin: 0 auto; background-color: white; }
          .header {
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            color: white;
            text-align: center;
            padding: 40px 24px;
          }
          .header h1 { font-size: 36px; margin: 0 0 16px 0; font-weight: 800; }
          .header p { margin: 0; font-size: 16px; opacity: 0.95; }
          .client-info {
            background: linear-gradient(to right, #f1f5f9, #e2e8f0);
            padding: 24px;
            border-bottom: 4px solid #3b82f6;
          }
          .client-info h3 { color: #2563eb; font-size: 20px; margin: 0 0 16px 0; font-weight: 700; }
          .info-grid { display: grid; gap: 16px; }
          .info-item { font-size: 14px; }
          .info-label { color: #2563eb; font-weight: 600; }
          .content { padding: 32px 24px; }
          .section { margin: 40px 0; }
          .section h2 {
            font-size: 24px;
            font-weight: 700;
            color: #2563eb;
            border-bottom: 4px solid #3b82f6;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .intro-box {
            background: linear-gradient(to right, #cffafe, #e0f2fe);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
          }
          .warning-box {
            background: linear-gradient(to right, #fef3c7, #fef9c3);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 12px;
            margin: 24px 0;
          }
          .legend {
            display: flex;
            justify-content: center;
            gap: 32px;
            flex-wrap: wrap;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            margin: 24px 0;
          }
          .legend-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            font-weight: 600;
          }
          .legend-color {
            width: 24px;
            height: 24px;
            border-radius: 6px;
          }
          .cta-box {
            background: linear-gradient(to right, #fef3c7, #fef9c3);
            border: 4px solid #f59e0b;
            border-radius: 16px;
            padding: 32px 24px;
            text-align: center;
            margin: 32px 0;
          }
          .cta-box h3 {
            font-size: 28px;
            font-weight: 800;
            color: #92400e;
            margin: 0 0 16px 0;
          }
          .cta-title {
            font-size: 28px;
            font-weight: 800;
            color: #dc2626;
            margin: 16px 0;
          }
          .cta-button {
            display: inline-block;
            margin-top: 16px;
            padding: 16px 32px;
            border-radius: 9999px;
            font-size: 18px;
            font-weight: 600;
            color: white;
            background: linear-gradient(to right, #10b981, #14b8a6);
            text-decoration: none;
          }
          .next-steps {
            background: linear-gradient(to right, #d1fae5, #a7f3d0);
            border: 4px solid #10b981;
            border-radius: 16px;
            padding: 24px;
          }
          .next-steps h3 {
            color: #065f46;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 16px 0;
          }
          .step-item {
            background: white;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            display: flex;
            gap: 12px;
          }
          .step-icon { color: #10b981; font-size: 20px; font-weight: 700; flex-shrink: 0; }
          .footer {
            background: #f8fafc;
            border-top: 4px solid #3b82f6;
            padding: 32px 24px;
            text-align: center;
          }
          .disclaimer {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 16px;
            font-size: 12px;
            color: #92400e;
            text-align: left;
            max-width: 600px;
            margin: 24px auto;
          }
          @media (min-width: 768px) {
            .info-grid { grid-template-columns: repeat(3, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧠 BrainWorx</h1>
            <h2 style="font-size: 24px; margin: 8px 0; font-weight: 700;">Your Neural Imprint Assessment Results</h2>
            <p>Comprehensive Personal Report</p>
          </div>

          <div class="client-info">
            <h3>Assessment Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name:</span> ${customerName}
              </div>
              <div class="info-item">
                <span class="info-label">Assessment Date:</span> ${assessmentDate}
              </div>
              <div class="info-item">
                <span class="info-label">Total Questions:</span> ${totalQuestions}
              </div>
            </div>
          </div>

          <div class="content">
            <div class="section">
              <h2>📋 Understanding Your Results</h2>

              <div class="intro-box">
                <p style="margin: 0;">
                  Thank you for completing the Neural Imprint Patterns™ assessment. This comprehensive evaluation measures 20 distinct psychological patterns that influence your thoughts, emotions, and behaviors. Your results provide valuable insights into areas of strength and opportunities for growth.
                </p>
              </div>

              <div class="warning-box">
                <p style="margin: 0;">
                  <strong>Important:</strong> This assessment is a self-evaluation tool designed to increase personal awareness. It is NOT a clinical diagnosis. These results should be reviewed with a qualified mental health professional or your BrainWorx coach for proper interpretation and guidance.
                </p>
              </div>
            </div>

            <div class="section">
              <h2>📊 Your Complete Score Overview</h2>

              <div class="legend">
                <div class="legend-item">
                  <div class="legend-color" style="background: linear-gradient(to bottom right, #ef4444, #dc2626);"></div>
                  <span>High (60–100%): Requires attention</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: linear-gradient(to bottom right, #fbbf24, #f97316);"></div>
                  <span>Medium (40–59%): Monitor & manage</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: linear-gradient(to bottom right, #0ea5e9, #2563eb);"></div>
                  <span>Low (0–39%): Positive indicator</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>🔍 Your Pattern Analysis</h2>

              ${highPatterns.length > 0 ? `
                <div style="margin-bottom: 32px;">
                  <div style="background: linear-gradient(to right, #ef4444, #dc2626); color: white; padding: 16px 20px; border-radius: 12px 12px 0 0; font-size: 18px; font-weight: 600;">
                    🔴 High Priority Patterns (60–100%)
                  </div>
                  <div style="border: 2px solid #ef4444; border-top: 0; border-radius: 0 0 12px 12px; padding: 20px; background: white;">
                    <p style="color: #991b1b; font-weight: 600; margin: 0 0 16px 0;">
                      These patterns scored above 60% and may require professional attention and support.
                    </p>
                    ${highPatterns.map(([name, data]) => renderPatternRow(name, data, '#ef4444')).join('')}
                  </div>
                </div>
              ` : ''}

              ${mediumPatterns.length > 0 ? `
                <div style="margin-bottom: 32px;">
                  <div style="background: linear-gradient(to right, #fbbf24, #f97316); color: white; padding: 16px 20px; border-radius: 12px 12px 0 0; font-size: 18px; font-weight: 600;">
                    🟠 Medium Priority Patterns (40–59%)
                  </div>
                  <div style="border: 2px solid #fbbf24; border-top: 0; border-radius: 0 0 12px 12px; padding: 20px; background: white;">
                    <p style="color: #92400e; font-weight: 600; margin: 0 0 16px 0;">
                      These patterns are moderately present and would benefit from awareness and management strategies.
                    </p>
                    ${mediumPatterns.map(([name, data]) => renderPatternRow(name, data, '#fbbf24')).join('')}
                  </div>
                </div>
              ` : ''}

              ${lowPatterns.length > 0 ? `
                <div style="margin-bottom: 16px;">
                  <div style="background: linear-gradient(to right, #0ea5e9, #2563eb); color: white; padding: 16px 20px; border-radius: 12px 12px 0 0; font-size: 18px; font-weight: 600;">
                    🔵 Low Priority Patterns (0–39%)
                  </div>
                  <div style="border: 2px solid #0ea5e9; border-top: 0; border-radius: 0 0 12px 12px; padding: 20px; background: white;">
                    <p style="color: #1e3a8a; font-weight: 600; margin: 0 0 16px 0;">
                      These patterns show minimal presence, indicating areas of relative strength.
                    </p>
                    ${lowPatterns.map(([name, data]) => renderPatternRow(name, data, '#0ea5e9')).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="cta-box">
              <h3>🎁 Congratulations!</h3>
              <p style="color: #92400e; font-size: 16px; margin: 0 0 8px 0;">
                You've completed the Neural Imprint Patterns™ assessment!<br>
                As a thank you, you're eligible for:
              </p>
              <div class="cta-title">FREE 45-Minute Coaching Session</div>
              <p style="color: #92400e; font-size: 14px; margin: 16px 0;">
                Work with a certified BrainWorx coach to:<br>
                ✓ Review your results in detail<br>
                ✓ Understand your patterns deeply<br>
                ✓ Create a personalized action plan<br>
                ✓ Get professional guidance and support
              </p>
              ${franchiseOwnerCode ? `
              <a href="${Deno.env.get('SITE_URL') || 'https://brainworx.co.za'}?book=${franchiseOwnerCode}" class="cta-button">
                Book Your Appointment
              </a>
              ` : `
              <a href="mailto:info@brainworx.co.za?subject=FREE 45-Minute Coaching Session" class="cta-button">
                Schedule Your FREE Session
              </a>
              `}
            </div>

            <div class="next-steps">
              <h3>🚀 Recommended Next Steps</h3>
              <div class="step-item">
                <span class="step-icon">✓</span>
                <span>Save or print this report for your records</span>
              </div>
              <div class="step-item">
                <span class="step-icon">✓</span>
                <span>Schedule your FREE 45-minute coaching session</span>
              </div>
              <div class="step-item">
                <span class="step-icon">✓</span>
                <span>Share results with your healthcare provider if appropriate</span>
              </div>
              <div class="step-item">
                <span class="step-icon">✓</span>
                <span>Begin implementing small changes in high-priority areas</span>
              </div>
              <div class="step-item">
                <span class="step-icon">✓</span>
                <span>Consider ongoing coaching for sustained growth and support</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div>
              <p style="font-weight: 600; margin: 0 0 8px 0;">Questions? Contact Us:</p>
              <p style="margin: 0;">
                📧 Email: info@brainworx.co.za<br>
                🌐 Website: www.brainworx.co.za
              </p>
            </div>

            <div class="disclaimer">
              <strong>Important Disclaimer:</strong><br>
              This assessment is a self-evaluation tool for personal insight and is NOT a psychological evaluation or medical diagnosis. Results should be reviewed in conjunction with professional therapeutic support. This tool is not a substitute for professional medical or psychological diagnosis and treatment. If you are experiencing mental health concerns, please consult with a qualified healthcare provider.<br><br>
              <strong>Crisis Support:</strong> If you are experiencing a mental health crisis, please contact your local emergency services or crisis hotline immediately.
            </div>

            <p style="font-size: 11px; color: #64748b; margin: 16px 0 0 0;">
              © 2024 BrainWorx. All rights reserved. | Neural Imprint Patterns™ is a trademark of BrainWorx.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;



    await resend.emails.send({
      from: 'BrainWorx <payments@brainworx.co.za>',
      to: customerEmail,
      subject: `Your Neural Imprint Assessment Results - ${customerName}`,
      html: customerEmailBody,
    });

    console.log('=== Client Report Email Sent ===');
    console.log('Customer:', customerName, '/', customerEmail);
    console.log('Patterns:', Object.keys(patterns).length);
    console.log('High Priority:', highPatterns.length);
    console.log('Medium Priority:', mediumPatterns.length);
    console.log('Low Priority:', lowPatterns.length);
    console.log('Booking Link Included:', !!franchiseOwnerCode);
    console.log('===================================');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client report email sent successfully',
        emailSent: customerEmail,
        stats: {
          totalPatterns: Object.keys(patterns).length,
          highPriority: highPatterns.length,
          mediumPriority: mediumPatterns.length,
          lowPriority: lowPatterns.length
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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