import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  assessmentId: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

const ZONE_COLORS = {
  Green: "#10b981",
  Amber: "#f59e0b",
  Red: "#ef4444"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { assessmentId }: RequestBody = await req.json();

    const { data: assessment, error: fetchError } = await supabase
      .from('self_assessment_responses')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (fetchError || !assessment) {
      throw new Error('Assessment not found');
    }

    const participantInfo = assessment.answers.participantInfo || {};
    const analysisResults = assessment.analysis_results || {};
    const top5 = analysisResults.top5 || [];
    const overall = analysisResults.overall || {};
    const safetyFlag = analysisResults.safetyFlag || false;

    // Generate client report
    const clientReportHtml = generateClientReport(
      participantInfo,
      overall,
      top5,
      safetyFlag
    );

    // Generate coach report
    const coachReportHtml = generateCoachReport(
      participantInfo,
      overall,
      top5,
      analysisResults.patternScores || [],
      safetyFlag
    );


    // Send client report
    await resend.emails.send({
      from: 'BrainWorx <payments@brainworx.co.za>',
      to: assessment.customer_email,
      subject: `Your Trauma & Loss Impact Assessment Results`,
      html: clientReportHtml,
    });

    // Send coach report to admin
    await resend.emails.send({
      from: 'BrainWorx <payments@brainworx.co.za>',
      to: 'payments@brainworx.co.za',
      subject: `Trauma Scan Coach Report - ${participantInfo.name || 'Participant'}`,
      html: coachReportHtml,
    });

    console.log('✅ Trauma scan reports sent successfully');
    console.log('- Client:', assessment.customer_email);
    console.log('- Coach: payments@brainworx.co.za');

    return new Response(
      JSON.stringify({ success: true, message: 'Reports sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error sending trauma scan reports:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateClientReport(participant: any, overall: any, top5: any[], safetyFlag: boolean): string {
  const patternRows = top5.map((p) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${p.code}</strong> — ${p.name}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="color: ${ZONE_COLORS[p.zone]};font-weight: bold;">${p.zone}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${p.pct}%
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trauma & Loss Impact Assessment - Client Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
      <div style="background: linear-gradient(135deg, #0A2A5E, #3DB3E3); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0 0 10px 0;">Trauma & Loss Impact Assessment</h1>
        <p style="margin: 0; opacity: 0.9;">Your Personal Results</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0A2A5E; margin-top: 0;">Hello ${participant.name || 'there'},</h2>
        <p>Thank you for completing the Trauma & Loss Impact Assessment. This report provides insights into patterns that may be affecting you ${participant.context || 'recently'}.</p>
        <p style="margin: 0;"><strong>Note:</strong> This is a self-reflection tool for coaching and support planning. It is <strong>not</strong> a clinical diagnosis.</p>
      </div>

      ${safetyFlag ? `
      <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #991b1b; margin-top: 0;">Important Support Message</h3>
        <p style="margin: 0;">Your responses suggest a high level of distress right now. Please reach out <strong>today</strong> to a trusted person or qualified professional. If you feel at immediate risk, contact your local emergency services immediately.</p>
      </div>
      ` : ''}

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0A2A5E; margin-top: 0;">Overall Impact</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <div style="font-size: 14px; color: #666;">Zone</div>
            <div style="font-size: 24px; font-weight: bold; color: ${ZONE_COLORS[overall.zone]};">${overall.zone}</div>
          </div>
          <div>
            <div style="font-size: 14px; color: #666;">Score</div>
            <div style="font-size: 24px; font-weight: bold; color: ${ZONE_COLORS[overall.zone]};">${overall.pct}%</div>
          </div>
          <div>
            <div style="font-size: 14px; color: #666;">Average</div>
            <div style="font-size: 24px; font-weight: bold;">${overall.avg?.toFixed(2) || '0.00'} / 4</div>
          </div>
        </div>
        <div style="background: #e5e7eb; height: 12px; border-radius: 999px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #3DB3E3, #1FAFA3); height: 100%; width: ${overall.pct}%; border-radius: 999px;"></div>
        </div>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0A2A5E; margin-top: 0;">Top 5 Activated Patterns</h2>
        <p style="color: #666; font-size: 14px;">These are the patterns most active for you right now:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Pattern</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d1d5db;">Zone</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d1d5db;">Score</th>
            </tr>
          </thead>
          <tbody>
            ${patternRows}
          </tbody>
        </table>
      </div>

      <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #1e40af; margin-top: 0;">What This Means</h3>
        <p style="margin: 0; color: #1e3a8a;">Higher scores indicate patterns that are more active right now. These patterns can shift with support, routine, and taking small steps forward. Your detailed coach report with specific next steps has been sent to your support team.</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #0A2A5E; margin-top: 0;">Next Steps</h2>
        <ul style="color: #666; padding-left: 20px;">
          <li>Review this report and reflect on the patterns identified</li>
          <li>Reach out to your support team or coach for guidance</li>
          <li>Consider professional support if patterns are significantly impacting your daily life</li>
          <li>Remember: patterns can change with proper support and small, consistent steps</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;"><strong>BrainWorx</strong></p>
        <p style="margin: 5px 0 0 0;">Transform Your Mind, Reach The World</p>
        <p style="margin: 10px 0 0 0;">This is a non-diagnostic assessment for coaching and support planning.</p>
      </div>
    </body>
    </html>
  `;
}

function generateCoachReport(participant: any, overall: any, top5: any[], allPatterns: any[], safetyFlag: boolean): string {
  const top5Rows = top5.map((p) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>${p.code}</strong></td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${p.name}<br><span style="color: #666; font-size: 12px;">${p.short}</span></td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;"><span style="color: ${ZONE_COLORS[p.zone]};font-weight: bold;">${p.zone}</span></td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.pct}%</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.avg?.toFixed(2)}</td>
    </tr>
  `).join('');

  const allPatternsRows = allPatterns.map((p) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px;"><strong>${p.code}</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${p.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 13px;"><span style="color: ${ZONE_COLORS[p.zone]};">${p.zone}</span></td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 13px;">${p.pct}%</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 13px;">${p.avg?.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trauma & Loss Impact Assessment - Coach Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
      <div style="background: linear-gradient(135deg, #0A2A5E, #3DB3E3); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0 0 10px 0;">Trauma & Loss Impact Assessment</h1>
        <p style="margin: 0; opacity: 0.9;">Coach Report - Comprehensive Analysis</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0A2A5E; margin-top: 0;">Participant Information</h2>
        <table style="width: 100%;">
          <tr><td style="padding: 8px 0; width: 150px;"><strong>Name:</strong></td><td>${participant.name || '—'}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Age:</strong></td><td>${participant.age || '—'}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Email:</strong></td><td>${participant.email || '—'}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Time Anchor:</strong></td><td>${participant.context || '—'}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Event:</strong></td><td>${participant.incidentLabel || 'the incident'} ${participant.incidentDate ? `(${participant.incidentDate})` : ''}</td></tr>
        </table>
      </div>

      ${safetyFlag ? `
      <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #991b1b; margin-top: 0;">⚠️ SAFETY FLAG - Immediate Attention Required</h3>
        <p style="margin: 0; font-weight: bold;">This participant reported high distress levels (Q18 score ≥ 3). Immediate follow-up recommended. If active self-harm intent or severe dissociation is present, pause coaching and refer to qualified clinical care.</p>
      </div>
      ` : ''}

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0A2A5E; margin-top: 0;">Overall Impact Summary</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <div style="font-size: 14px; color: #666;">Zone</div>
            <div style="font-size: 28px; font-weight: bold; color: ${ZONE_COLORS[overall.zone]};">${overall.zone}</div>
          </div>
          <div>
            <div style="font-size: 14px; color: #666;">Score</div>
            <div style="font-size: 28px; font-weight: bold; color: ${ZONE_COLORS[overall.zone]};">${overall.pct}%</div>
          </div>
          <div>
            <div style="font-size: 14px; color: #666;">Average</div>
            <div style="font-size: 28px; font-weight: bold;">${overall.avg?.toFixed(2) || '0.00'} / 4</div>
          </div>
        </div>
        <div style="background: #e5e7eb; height: 16px; border-radius: 999px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #3DB3E3, #1FAFA3); height: 100%; width: ${overall.pct}%; border-radius: 999px;"></div>
        </div>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0A2A5E; margin-top: 0;">Top 5 Activated Patterns</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db; width: 70px;">Code</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Pattern</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d1d5db; width: 90px;">Zone</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d1d5db; width: 90px;">Score</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d1d5db; width: 90px;">Avg</th>
            </tr>
          </thead>
          <tbody>
            ${top5Rows}
          </tbody>
        </table>
      </div>

      <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #1e40af; margin-top: 0;">Coaching Focus Recommendations</h3>
        <p style="color: #1e3a8a; margin: 0 0 10px 0;">Based on the top patterns:</p>
        <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
          <li>Start with stabilization: basics (sleep, hydration, meals) + nervous system downshift</li>
          <li>Build support plan: identify safe people, create micro-connection routine</li>
          <li>Address high-activation patterns (DIS, HYP, ANG) with regulation techniques</li>
          <li>Restore structure if ORG/FOC/DIM are high: 3-item lists + timer blocks</li>
          <li>Focus on small, controllable steps to rebuild agency (TRAP, INFL, BULLY)</li>
        </ul>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0A2A5E; margin-top: 0;">All 20 Pattern Scores</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 13px;">Code</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 13px;">Pattern</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #d1d5db; font-size: 13px;">Zone</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #d1d5db; font-size: 13px;">Score</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #d1d5db; font-size: 13px;">Avg</th>
            </tr>
          </thead>
          <tbody>
            ${allPatternsRows}
          </tbody>
        </table>
      </div>

      <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #92400e; margin-top: 0;">Risk-Aware Coaching Boundaries</h3>
        <ul style="color: #78350f; margin: 0; padding-left: 20px;">
          <li>Coaching focuses on stability, routine, agency, and support planning—<strong>not</strong> trauma therapy</li>
          <li>If client reports active self-harm intent, inability to stay safe, or severe dissociation: pause coaching and refer</li>
          <li>Document boundaries clearly and keep qualified referral options available</li>
          <li>This is a non-diagnostic tool for coaching support, not clinical assessment</li>
        </ul>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #0A2A5E; margin-top: 0;">Suggested 6-Session Coaching Plan</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; border-bottom: 2px solid #d1d5db; width: 80px;">Session</th>
              <th style="padding: 10px; border-bottom: 2px solid #d1d5db; text-align: left;">Goal</th>
              <th style="padding: 10px; border-bottom: 2px solid #d1d5db; text-align: left;">Focus</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><strong>1</strong></td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Stabilize</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Basics + downshift + support plan</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><strong>2</strong></td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Structure</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">3-item priorities + timer blocks</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><strong>3</strong></td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Agency</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Choices + small controllable steps</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><strong>4</strong></td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Connection</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Support map + boundaries</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><strong>5</strong></td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Rebuild</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Practical rebuild plan</td></tr>
            <tr><td style="padding: 10px; text-align: center;"><strong>6</strong></td><td style="padding: 10px;">Maintain</td><td style="padding: 10px;">Relapse plan + weekly rhythm</td></tr>
          </tbody>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;"><strong>BrainWorx Coach Report</strong></p>
        <p style="margin: 5px 0 0 0;">Coaching document — non-diagnostic. If risk or severe impairment present, refer to qualified clinical care.</p>
      </div>
    </body>
    </html>
  `;
}
