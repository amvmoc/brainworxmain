import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createTransport } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  assessmentId: string;
}

const NIPP_PATTERN_INFO: Record<string, { name: string; description: string }> = {
  FOC: { name: "Scattered Focus", description: "Difficulty maintaining attention and concentration" },
  HYP: { name: "High Energy", description: "Elevated activity levels and restlessness" },
  IMP: { name: "Impulse Rush", description: "Acting without thinking, difficulty with self-control" },
  ORG: { name: "Disorganized Thinking", description: "Challenges with planning, organizing, and task management" },
  DIM: { name: "Academic Struggles", description: "Difficulty with learning tasks and academic performance" },
  ANG: { name: "Emotional Anger", description: "Difficulty regulating emotions, irritability, frustration" },
  RES: { name: "Daily Functioning Challenges", description: "Struggles with everyday tasks and routines" },
  INWF: { name: "Inward Focus", description: "Social-emotional withdrawal, internalized stress" },
  BURN: { name: "Burned Out", description: "Fatigue, overwhelm, difficulty sustaining effort" },
  BULLY: { name: "Social Conflict", description: "Difficulties in peer relationships and social interactions" },
};

function getSeverityLabel(score: number): string {
  if (score < 1.5) return "Low";
  if (score < 2.5) return "Mild";
  if (score < 3.0) return "Moderate";
  return "High";
}

function getSeverityColor(score: number): string {
  if (score < 1.5) return "#10b981";
  if (score < 2.5) return "#f59e0b";
  if (score < 3.0) return "#f97316";
  return "#ef4444";
}

function generateComprehensiveCoachReport(
  assessment: any,
  parentResponse: any,
  teacherResponse: any,
  patterns: any[],
  resultsLink: string
): string {
  const corePatterns = patterns.filter(p =>
    ["FOC", "HYP", "IMP", "ORG", "DIM"].includes(p.code)
  );
  const emotionalPatterns = patterns.filter(p =>
    ["ANG", "RES", "INWF", "BURN", "BULLY"].includes(p.code)
  );

  const moderateOrHighCount = corePatterns.filter(p => p.combinedScore >= 2.5).length;
  const avgCoreScore = (
    corePatterns.reduce((sum, p) => sum + p.combinedScore, 0) / corePatterns.length
  ).toFixed(2);

  let interpretation = "";
  if (avgCoreScore >= 3.0 || moderateOrHighCount >= 4) {
    interpretation = "Significant ADHD-style patterns are present across multiple core domains. Strong recommendation for comprehensive evaluation by a qualified professional.";
  } else if (avgCoreScore >= 2.5 || moderateOrHighCount >= 3) {
    interpretation = "Moderate ADHD-style patterns observed. Recommend monitoring, implementing support strategies, and considering professional consultation.";
  } else if (avgCoreScore >= 2.0 || moderateOrHighCount >= 2) {
    interpretation = "Some ADHD-style patterns noted. Continue monitoring and implement targeted support strategies. Professional evaluation may be warranted if patterns persist or worsen.";
  } else {
    interpretation = "Minimal ADHD-style patterns. The child appears to be functioning within typical developmental expectations in most areas.";
  }

  const generatePatternCard = (pattern: any) => {
    const discrepancy = Math.abs(pattern.parentScore - pattern.teacherScore);
    const hasLargeDiscrepancy = discrepancy >= 1.0;

    return `
      <div class="pattern-card">
        <div class="pattern-header">
          <div>
            <h3 class="pattern-title">${pattern.code} – ${pattern.name}</h3>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">${NIPP_PATTERN_INFO[pattern.code]?.description || ""}</p>
          </div>
          <div class="pattern-score" style="color: ${getSeverityColor(pattern.combinedScore)};">
            ${pattern.combinedScore.toFixed(2)}
          </div>
        </div>

        <table class="scores-table">
          <thead>
            <tr>
              <th>Rater</th>
              <th style="text-align: center;">Score</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Parent (${parentResponse.respondent_name})</strong></td>
              <td style="text-align: center; font-weight: 600;">${pattern.parentScore.toFixed(2)}</td>
              <td>
                <span class="severity-badge" style="background: ${getSeverityColor(pattern.parentScore)};">
                  ${pattern.parentLabel}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>Teacher (${teacherResponse.respondent_name})</strong></td>
              <td style="text-align: center; font-weight: 600;">${pattern.teacherScore.toFixed(2)}</td>
              <td>
                <span class="severity-badge" style="background: ${getSeverityColor(pattern.teacherScore)};">
                  ${pattern.teacherLabel}
                </span>
              </td>
            </tr>
            <tr style="background: #f8fafc;">
              <td><strong>Combined Average</strong></td>
              <td style="text-align: center; font-weight: 700; font-size: 16px;">${pattern.combinedScore.toFixed(2)}</td>
              <td>
                <span class="severity-badge" style="background: ${getSeverityColor(pattern.combinedScore)};">
                  ${pattern.combinedLabel}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        ${hasLargeDiscrepancy ? `
          <div class="discrepancy-note">
            <strong>⚠️ Setting Discrepancy Noted:</strong> There is a difference of ${discrepancy.toFixed(2)} points
            between home and school ratings. This may indicate:
            <ul style="margin: 8px 0 0 0; padding-left: 24px;">
              <li>Different behavioral presentation across settings</li>
              <li>Varying demands or structure in each environment</li>
              <li>Different observer perspectives or thresholds</li>
            </ul>
            Consider discussing with both raters to understand contextual factors.
          </div>
        ` : ""}

        <div class="recommendations-box">
          <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #065f46;">Coaching Focus Areas:</h4>
          <ul style="margin: 0; padding-left: 24px; color: #065f46;">
            ${pattern.combinedScore >= 2.5 ? `
              <li>Priority area for intervention and support</li>
              <li>Develop targeted strategies for both home and school</li>
              <li>Consider professional consultation for evidence-based interventions</li>
              <li>Monitor progress closely and adjust approaches as needed</li>
            ` : pattern.combinedScore >= 2.0 ? `
              <li>Monitor for changes or escalation</li>
              <li>Implement preventive strategies and skill-building</li>
              <li>Maintain open communication between home and school</li>
            ` : `
              <li>Continue current support approaches</li>
              <li>Reinforce positive behaviors and coping strategies</li>
            `}
          </ul>
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 1cm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f8fafc;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 20px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
    .info-item {
      padding: 8px 0;
    }
    .info-label {
      font-weight: 600;
      color: #64748b;
      font-size: 14px;
    }
    .info-value {
      color: #1e293b;
      font-size: 16px;
    }
    .section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 3px solid #3b82f6;
    }
    .alert-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .interpretation-box {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .pattern-card {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .pattern-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }
    .pattern-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .pattern-score {
      font-size: 32px;
      font-weight: 800;
    }
    .scores-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .scores-table th {
      background: #f1f5f9;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #cbd5e1;
    }
    .scores-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      color: white;
    }
    .discrepancy-note {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 12px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .recommendations-box {
      background: #dcfce7;
      border-left: 4px solid #10b981;
      padding: 16px;
      margin: 16px 0;
      border-radius: 6px;
    }
    .footer {
      text-align: center;
      color: #64748b;
      font-size: 13px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
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
    @media print {
      body { background: white; }
      .section { page-break-inside: avoid; }
      .pattern-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">BrainWorx NIPP</div>
    <div style="font-size: 18px; margin-top: 10px;">Professional / Coach Report</div>
    <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Child Focus & Behaviour Screen (7–10 years)</div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Child Name</div>
      <div class="info-value">${assessment.child_name}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Age</div>
      <div class="info-value">${assessment.child_age} years</div>
    </div>
    <div class="info-item">
      <div class="info-label">Parent/Guardian</div>
      <div class="info-value">${parentResponse.respondent_name}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Teacher</div>
      <div class="info-value">${teacherResponse.respondent_name}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Date Completed</div>
      <div class="info-value">${new Date(assessment.updated_at).toLocaleDateString()}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Assessment Type</div>
      <div class="info-value">ADHD 7-10 Screen</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Report Overview</h2>
    <p style="margin: 0; color: #475569; line-height: 1.8;">
      This comprehensive report summarises parent and teacher observations of ADHD-style patterns and related
      emotional/impact domains for <strong>${assessment.child_name}</strong>, a school-aged child (7–10 years).
      It is designed as a screening and coaching tool and does not replace a full diagnostic assessment.
    </p>
    <div class="alert-box">
      <strong>Important:</strong> This screening tool provides valuable insights into behavioral patterns across
      home and school settings. Results should be integrated with developmental history, direct observation, and
      any additional assessment data. Professional evaluation is recommended for definitive diagnosis.
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Overall ADHD Pattern Indicator</h2>

    <div style="margin: 20px 0;">
      <div style="font-size: 16px; margin-bottom: 12px;">
        <strong>Core patterns with Moderate/High combined scores:</strong> ${moderateOrHighCount} out of 5
      </div>
      <div style="font-size: 16px; margin-bottom: 20px;">
        <strong>Average combined core ADHD score:</strong> ${avgCoreScore} (1.00–4.00 scale)
      </div>
    </div>

    <div class="interpretation-box">
      <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px;">Interpretation Summary:</h4>
      <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.7;">${interpretation}</p>
    </div>

    <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b; font-style: italic;">
      Summary based solely on these rating scales. Integrate with history, direct observation,
      developmental expectations and any additional assessment data.
    </p>
  </div>

  <div class="section">
    <h2 class="section-title">Core ADHD Domains</h2>
    <p style="margin: 0 0 24px 0; color: #64748b;">
      The following five domains represent the core features typically associated with ADHD:
    </p>

    ${corePatterns.map(generatePatternCard).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">Emotional & Impact Domains</h2>
    <p style="margin: 0 0 24px 0; color: #64748b;">
      These domains reflect emotional regulation difficulties and the impact of ADHD patterns on daily functioning:
    </p>

    ${emotionalPatterns.map(generatePatternCard).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">Summary & Next Steps</h2>

    <h3 style="color: #1e293b; margin: 24px 0 12px 0;">Top Priority Patterns</h3>
    <p style="color: #64748b; margin: 0 0 16px 0;">
      Focus coaching efforts on these highest-scoring patterns:
    </p>
    <ol style="color: #475569; line-height: 1.8;">
      ${patterns.slice(0, 3).map(p => `
        <li><strong>${p.code} (${p.name})</strong> - Combined Score: ${p.combinedScore.toFixed(2)}/4.0</li>
      `).join('')}
    </ol>

    <h3 style="color: #1e293b; margin: 24px 0 12px 0;">Recommended Actions</h3>
    <ul style="color: #475569; line-height: 1.8;">
      ${moderateOrHighCount >= 3 ? `
        <li><strong>Urgent:</strong> Refer for comprehensive ADHD evaluation by a qualified healthcare provider</li>
        <li>Implement immediate support strategies at home and school</li>
        <li>Consider consultation with school psychologist or counselor</li>
      ` : moderateOrHighCount >= 1 ? `
        <li>Monitor patterns closely over the next 4-6 weeks</li>
        <li>Implement targeted behavioral interventions</li>
        <li>Schedule follow-up assessment to track changes</li>
      ` : `
        <li>Continue current support strategies</li>
        <li>Maintain regular communication between home and school</li>
        <li>Reinforce positive behaviors and build on strengths</li>
      `}
      <li>Collaborate with both parent and teacher to ensure consistent approaches</li>
      <li>Document progress and any changes in behavior patterns</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resultsLink}" class="button">
        View Interactive Report Online
      </a>
    </div>

    <p style="font-size: 14px; color: #64748b; text-align: center;">
      <a href="${resultsLink}" style="color: #3b82f6; word-break: break-all;">${resultsLink}</a>
    </p>
  </div>

  <div class="footer">
    <p style="margin: 8px 0;"><strong>BrainWorx Neural Imprint Patterns (NIPP)</strong></p>
    <p style="margin: 8px 0;">This is a screening tool, not a diagnostic instrument.</p>
    <p style="margin: 8px 0;">Professional interpretation and integration with other data is essential.</p>
    <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} BrainWorx. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables are not configured");
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

    const { data: assessment, error: assessmentError } = await supabase
      .from("adhd_assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error("Assessment not found");
    }

    if (assessment.status !== "both_completed") {
      return new Response(
        JSON.stringify({ error: "Both parent and teacher assessments must be completed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    let franchiseOwnerEmail = null;
    if (assessment.franchise_owner_id) {
      const { data: franchiseOwner } = await supabase
        .from("franchise_owners")
        .select("email, full_name")
        .eq("id", assessment.franchise_owner_id)
        .single();

      if (franchiseOwner) {
        franchiseOwnerEmail = franchiseOwner.email;
      }
    }

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const resultsLink = `${baseUrl}/#/adhd710/${assessment.share_token}/results`;

    const parentScores = parentResponse.scores?.nippScores || {};
    const teacherScores = teacherResponse.scores?.nippScores || {};

    const patterns = Object.keys(parentScores).map(code => {
      const parentScore = parentScores[code];
      const teacherScore = teacherScores[code];
      const combinedScore = (parentScore + teacherScore) / 2;

      return {
        code,
        name: NIPP_PATTERN_INFO[code]?.name || code,
        category: ["FOC", "HYP", "IMP", "ORG", "DIM"].includes(code) ? "Core ADHD" : "Emotional/Impact",
        parentScore,
        teacherScore,
        combinedScore,
        parentLabel: getSeverityLabel(parentScore),
        teacherLabel: getSeverityLabel(teacherScore),
        combinedLabel: getSeverityLabel(combinedScore),
      };
    });

    patterns.sort((a, b) => b.combinedScore - a.combinedScore);
    const topPatterns = patterns.slice(0, 3);

    const parentEmailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#3b82f6 0%,#6366f1 100%);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center}.content{background:white;padding:30px;border:1px solid #e5e7eb;border-top:none}.button{display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#6366f1 100%);color:white!important;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;margin:20px 0}.info-box{background:#eff6ff;border-left:4px solid #3b82f6;padding:15px;margin:20px 0;border-radius:4px}.pattern-item{margin:10px 0;padding:10px;background:#f9fafb;border-radius:6px}</style></head><body><div class="header"><div style="font-size:24px;font-weight:bold;margin-bottom:10px">BrainWorx NIPP</div><div style="font-size:14px;opacity:0.9">Assessment Complete</div></div><div class="content"><h2>Your Child's ADHD Assessment Results Are Ready</h2><p>Dear ${parentResponse.respondent_name},</p><p>The ADHD assessment for <strong>${assessment.child_name}</strong> has been completed by both you and ${teacherResponse.respondent_name}. The comprehensive report is now available.</p><div class="info-box"><strong>Top 3 Patterns Identified:</strong><br><br>${topPatterns.map(p => `<div class="pattern-item"><strong>${p.code}</strong> - Combined Score: ${p.combinedScore.toFixed(2)}/4.0</div>`).join('')}</div><p><strong>What's included in your report:</strong></p><ul><li>Detailed analysis of 10 ADHD-related patterns</li><li>Comparison of observations from home and school</li><li>Visual charts showing pattern strengths</li><li>Practical guidance for supporting your child</li><li>Recommendations for next steps</li></ul><div style="text-align:center;margin:30px 0"><a href="${resultsLink}" class="button">View Complete Report</a></div><p style="font-size:14px;color:#6b7280">Or copy and paste this link into your browser:<br><a href="${resultsLink}" style="color:#3b82f6;word-break:break-all">${resultsLink}</a></p><div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:4px"><strong>Important:</strong> This assessment is a screening tool, not a diagnosis. We recommend discussing these results with your BrainWorx coach or a qualified healthcare professional.</div><p>Your BrainWorx coach will receive the detailed professional report and will be in touch to discuss the findings and next steps.</p><p>Best regards,<br><strong>The BrainWorx Team</strong></p></div><div style="text-align:center;color:#6b7280;font-size:12px;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb"><p>© ${new Date().getFullYear()} BrainWorx. All rights reserved.</p></div></body></html>`;

    const teacherEmailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#3b82f6 0%,#6366f1 100%);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center}.content{background:white;padding:30px;border:1px solid #e5e7eb;border-top:none}.button{display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#6366f1 100%);color:white!important;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;margin:20px 0}</style></head><body><div class="header"><div style="font-size:24px;font-weight:bold;margin-bottom:10px">BrainWorx NIPP</div><div style="font-size:14px;opacity:0.9">Assessment Complete - Thank You</div></div><div class="content"><h2>Assessment Completed</h2><p>Dear ${teacherResponse.respondent_name},</p><p>Thank you for completing the ADHD assessment for <strong>${assessment.child_name}</strong>. Your input as ${assessment.child_name}'s teacher has been invaluable in creating a comprehensive picture of their functioning across different settings.</p><p>The assessment results have been compiled and shared with ${parentResponse.respondent_name}. The family's BrainWorx coach will use these insights to develop appropriate support strategies.</p><div style="text-align:center;margin:30px 0"><a href="${resultsLink}" class="button">View Assessment Results</a></div><p>If you have any questions about the assessment or would like to discuss the findings with ${parentResponse.respondent_name}, please feel free to reach out to them directly.</p><p>Thank you again for your time and valuable input in supporting ${assessment.child_name}'s development.</p><p>Warm regards,<br><strong>The BrainWorx Team</strong></p></div><div style="text-align:center;color:#6b7280;font-size:12px;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb"><p>© ${new Date().getFullYear()} BrainWorx. All rights reserved.</p></div></body></html>`;

    const emailPromises = [
      transporter.sendMail({
        from: `BrainWorx NIPP <${GMAIL_USER}>`,
        to: parentResponse.respondent_email,
        subject: `${assessment.child_name}'s ADHD Assessment Results - BrainWorx NIPP`,
        html: parentEmailHtml,
      }),
      transporter.sendMail({
        from: `BrainWorx NIPP <${GMAIL_USER}>`,
        to: teacherResponse.respondent_email,
        subject: `Assessment Complete: ${assessment.child_name} - Thank You`,
        html: teacherEmailHtml,
      }),
    ];

    if (franchiseOwnerEmail) {
      const coachReportHtml = generateComprehensiveCoachReport(
        assessment,
        parentResponse,
        teacherResponse,
        patterns,
        resultsLink
      );

      emailPromises.push(
        transporter.sendMail({
          from: `BrainWorx NIPP <${GMAIL_USER}>`,
          to: franchiseOwnerEmail,
          subject: `New ADHD Assessment Complete: ${assessment.child_name} - Comprehensive Coach Report`,
          html: coachReportHtml,
        })
      );
    }

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reports sent successfully",
        emailsSent: emailPromises.length,
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
