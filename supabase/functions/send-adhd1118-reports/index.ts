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

const NIPP_PATTERN_INFO: Record<string, { name: string; description: string }> = {
  FOC: { name: "Scattered Focus", description: "Difficulty sustaining attention and focusing on tasks" },
  HYP: { name: "High Gear", description: "Excessive physical activity and restlessness" },
  IMP: { name: "Impulse Rush", description: "Acting without thinking and difficulty with self-control" },
  ORG: { name: "Time & Order", description: "Challenges with organization and time management" },
  DIM: { name: "Flexible Focus", description: "Inconsistent performance and mental fatigue" },
  ANG: { name: "Anchored Anger", description: "Frequent emotional outbursts and frustration" },
  RES: { name: "Resistance / Attitude", description: "Oppositional behavior and resistance to routines" },
  INWF: { name: "Inward Focus", description: "Withdrawal and negative self-perception" },
  BURN: { name: "Burned Out", description: "Mental exhaustion and need for recovery time" },
  BULLY: { name: "Victim Loops", description: "Social difficulties and peer relationship challenges" },
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
  if (score < 3.0) return "#ef4444";
  return "#991b1b";
}

function scoreToPercentage(score: number): number {
  return Math.round((score / 4.0) * 100);
}

function generateTeenClientReport(
  assessment: any,
  teenResponse: any,
  patterns: any[],
  baseUrl: string
): string {
  const corePatterns = patterns.filter(p =>
    ["FOC", "HYP", "IMP", "ORG", "DIM"].includes(p.code)
  );
  const emotionalPatterns = patterns.filter(p =>
    ["ANG", "RES", "INWF", "BURN", "BULLY"].includes(p.code)
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 1cm; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f7f7fb;
      padding: 24px;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .logo-box {
      width: 140px;
      height: 40px;
      border-radius: 8px;
      border: 1px dashed #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .header-subtitle {
      font-size: 12px;
      color: #4b5563;
    }
    .header-info {
      font-size: 11px;
      color: #374151;
      text-align: right;
    }
    .header-info div {
      margin-bottom: 2px;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 8px;
      margin-top: 16px;
    }
    h2 {
      font-size: 18px;
      margin-top: 16px;
      margin-bottom: 4px;
    }
    p {
      font-size: 13px;
      margin-bottom: 16px;
    }
    .section-intro {
      font-size: 13px;
      margin-bottom: 12px;
    }
    .pattern-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
      background-color: #ffffff;
    }
    .pattern-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .pattern-card p {
      font-size: 13px;
      margin-bottom: 4px;
    }
    .progress-bar-container {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background-color: #e5e7eb;
      overflow: hidden;
      margin-top: 4px;
    }
    .progress-bar {
      height: 100%;
      background-color: #4f46e5;
    }
    .progress-label {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .guidance-section h2 {
      font-size: 18px;
      margin-top: 24px;
      margin-bottom: 8px;
    }
    .guidance-section p {
      font-size: 13px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="logo-box">BrainWorx / NIPP Logo</div>
        <div class="header-subtitle">
          <strong>BrainWorx</strong> – Neural Imprint Patterns (NIPP)<br>
          Teen ADHD Self-Assessment (11–18 years)
        </div>
      </div>
      <div class="header-info">
        <div>Name: ${assessment.teen_name}</div>
        <div>Age: ${assessment.teen_age}</div>
        <div>Date: ${new Date(teenResponse.completed_at).toLocaleDateString()}</div>
      </div>
    </div>

    <h1>Your Personal Assessment Report</h1>
    <p>
      This report shows your responses about focus, energy, emotions, and daily challenges.
      It's designed to help you and your coach understand your patterns and work together on strategies that work for you.
    </p>

    <h2>Focus, Organization & Impulse Patterns</h2>
    <p class="section-intro">
      These patterns show how you manage attention, organization, and self-control in school and daily life.
    </p>

    <div style="margin-bottom: 24px;">
      ${corePatterns.map(pattern => `
        <div class="pattern-card">
          <div class="pattern-title">${pattern.code} – ${pattern.name}</div>
          <p>${NIPP_PATTERN_INFO[pattern.code]?.description || ""}</p>
          <p><strong>Your Score:</strong> ${pattern.teenScore.toFixed(2)} (${pattern.teenLabel})</p>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${pattern.percentage}%;"></div>
          </div>
          <div class="progress-label">${pattern.percentage}% of maximum intensity</div>
        </div>
      `).join('')}
    </div>

    <h2>Emotional & Impact Patterns</h2>
    <p class="section-intro">
      These patterns look at frustration, self-perception, resistance, and how you experience challenges.
    </p>

    <div style="margin-bottom: 24px;">
      ${emotionalPatterns.map(pattern => `
        <div class="pattern-card">
          <div class="pattern-title">${pattern.code} – ${pattern.name}</div>
          <p>${NIPP_PATTERN_INFO[pattern.code]?.description || ""}</p>
          <p><strong>Your Score:</strong> ${pattern.teenScore.toFixed(2)} (${pattern.teenLabel})</p>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${pattern.percentage}%;"></div>
          </div>
          <div class="progress-label">${pattern.percentage}% of maximum intensity</div>
        </div>
      `).join('')}
    </div>

    <div class="guidance-section">
      <h2>What This Means</h2>
      <p>
        <strong>•</strong> Patterns in the <strong>Moderate</strong> or <strong>High</strong> range are areas where you might benefit from extra support and strategies.
      </p>
      <p>
        <strong>•</strong> These scores don't define you – they're just one way to understand your experiences and find what helps.
      </p>
      <p>
        <strong>•</strong> Your coach will work with you on practical tools and approaches based on these results.
      </p>
      <p>
        <strong>•</strong> This assessment is NOT a diagnosis. Only qualified healthcare professionals can diagnose ADHD.
      </p>
    </div>

    ${assessment.franchise_owner_id ? `
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 24px; border-radius: 12px; margin: 32px 0; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
      <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700;">📅 Ready to Take the Next Step?</h2>
      <p style="margin: 0 0 20px 0; font-size: 15px; opacity: 0.95; line-height: 1.6;">
        Schedule a session with your BrainWorx coach to discuss your results<br>
        and develop personalized strategies that work for you.
      </p>
      <a href="${baseUrl}/booking/${assessment.franchise_owner_id}?name=${encodeURIComponent(assessment.teen_name)}&age=${assessment.teen_age}&email=${encodeURIComponent(teenResponse.respondent_email)}"
         style="display: inline-block; background: white; color: #3b82f6; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;">
        Book Your Coaching Session
      </a>
      <p style="margin: 20px 0 0 0; font-size: 13px; opacity: 0.85;">
        Click to view available times and schedule your appointment
      </p>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

function generateComprehensiveCoachReport(
  assessment: any,
  teenResponse: any,
  patterns: any[],
  resultsLink: string
): string {
  const corePatterns = patterns.filter(p =>
    ["FOC", "HYP", "IMP", "ORG", "DIM"].includes(p.code)
  );
  const emotionalPatterns = patterns.filter(p =>
    ["ANG", "RES", "INWF", "BURN", "BULLY"].includes(p.code)
  );

  const moderateOrHighCount = corePatterns.filter(p => p.teenScore >= 2.5).length;
  const avgCoreScore = (
    corePatterns.reduce((sum, p) => sum + p.teenScore, 0) / corePatterns.length
  ).toFixed(2);

  let interpretation = "";
  if (avgCoreScore >= 3.0 || moderateOrHighCount >= 4) {
    interpretation = "Significant ADHD-style patterns are present across multiple core domains. Strong recommendation for comprehensive evaluation by a qualified professional.";
  } else if (avgCoreScore >= 2.5 || moderateOrHighCount >= 3) {
    interpretation = "Moderate ADHD-style patterns observed. Recommend monitoring, implementing support strategies, and considering professional consultation.";
  } else if (avgCoreScore >= 2.0 || moderateOrHighCount >= 2) {
    interpretation = "Some ADHD-style patterns noted. Continue monitoring and implement targeted support strategies. Professional evaluation may be warranted if patterns persist or worsen.";
  } else {
    interpretation = "Minimal ADHD-style patterns. The teen appears to be functioning within typical developmental expectations in most areas.";
  }

  const generatePatternCard = (pattern: any) => {
    return `
      <div class="pattern-card">
        <div class="pattern-header">
          <div>
            <h3 class="pattern-title">${pattern.code} – ${pattern.name}</h3>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">${NIPP_PATTERN_INFO[pattern.code]?.description || ""}</p>
          </div>
          <div class="pattern-score" style="color: ${getSeverityColor(pattern.teenScore)};">
            ${pattern.teenScore.toFixed(2)}
          </div>
        </div>

        <table class="scores-table">
          <thead>
            <tr>
              <th>Score Type</th>
              <th style="text-align: center;">Score</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Teen Self-Report</strong></td>
              <td style="text-align: center; font-weight: 700; font-size: 16px;">${pattern.teenScore.toFixed(2)}</td>
              <td>
                <span class="severity-badge" style="background: ${getSeverityColor(pattern.teenScore)};">
                  ${pattern.teenLabel}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="recommendations-box">
          <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #065f46;">Coaching Focus Areas:</h4>
          <ul style="margin: 0; padding-left: 24px; color: #065f46;">
            ${pattern.teenScore >= 2.5 ? `
              <li>Priority area for intervention and support</li>
              <li>Develop targeted strategies for school and daily life</li>
              <li>Consider professional consultation for evidence-based interventions</li>
              <li>Monitor progress closely and adjust approaches as needed</li>
            ` : pattern.teenScore >= 2.0 ? `
              <li>Monitor for changes or escalation</li>
              <li>Implement preventive strategies and skill-building</li>
              <li>Maintain open communication with teen and family</li>
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
    <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Teen ADHD Self-Assessment (11–18 years)</div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Teen Name</div>
      <div class="info-value">${assessment.teen_name}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Age</div>
      <div class="info-value">${assessment.teen_age} years</div>
    </div>
    <div class="info-item">
      <div class="info-label">Email</div>
      <div class="info-value">${teenResponse.respondent_email}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Date Completed</div>
      <div class="info-value">${new Date(teenResponse.completed_at).toLocaleDateString()}</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Report Overview</h2>
    <p style="margin: 0; color: #475569; line-height: 1.8;">
      This comprehensive report summarizes the teen's self-reported experiences with ADHD-style patterns and related
      emotional/impact domains for <strong>${assessment.teen_name}</strong>. This assessment is designed as a screening
      and coaching tool and does not replace a full diagnostic assessment.
    </p>
    <div class="alert-box">
      <strong>Important:</strong> This is a self-report screening tool based on the teen's own perspective. Results should
      be integrated with parent/teacher observations, developmental history, and any additional assessment data.
      Professional evaluation is recommended for definitive diagnosis.
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Overall ADHD Pattern Indicator</h2>

    <div style="margin: 20px 0;">
      <div style="font-size: 16px; margin-bottom: 12px;">
        <strong>Core patterns with Moderate/High scores:</strong> ${moderateOrHighCount} out of 5
      </div>
      <div style="font-size: 16px; margin-bottom: 20px;">
        <strong>Average core ADHD score:</strong> ${avgCoreScore} (1.00–4.00 scale)
      </div>
    </div>

    <div class="interpretation-box">
      <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px;">Interpretation Summary:</h4>
      <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.7;">${interpretation}</p>
    </div>

    <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b; font-style: italic;">
      Summary based solely on teen self-report. Consider parent/teacher perspectives, direct observation,
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
        <li><strong>${p.code} (${p.name})</strong> - Score: ${p.teenScore.toFixed(2)}/4.0</li>
      `).join('')}
    </ol>

    <h3 style="color: #1e293b; margin: 24px 0 12px 0;">Recommended Actions</h3>
    <ul style="color: #475569; line-height: 1.8;">
      ${moderateOrHighCount >= 3 ? `
        <li><strong>Urgent:</strong> Refer for comprehensive ADHD evaluation by a qualified healthcare provider</li>
        <li>Implement immediate support strategies at school and home</li>
        <li>Consider consultation with school psychologist or counselor</li>
      ` : moderateOrHighCount >= 1 ? `
        <li>Monitor patterns closely over the next 4-6 weeks</li>
        <li>Implement targeted behavioral interventions</li>
        <li>Schedule follow-up assessment to track changes</li>
      ` : `
        <li>Continue current support strategies</li>
        <li>Build on teen's strengths and positive coping mechanisms</li>
        <li>Maintain open communication with teen and family</li>
      `}
      <li>Work collaboratively with teen, family, and school</li>
      <li>Document progress and any changes in reported patterns</li>
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

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

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
      .from("adhd_1118_assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error("Assessment not found");
    }

    if (assessment.status !== "teen_completed") {
      return new Response(
        JSON.stringify({ error: "Teen assessment must be completed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: responses, error: responsesError } = await supabase
      .from("adhd_1118_assessment_responses")
      .select("*")
      .eq("assessment_id", assessmentId);

    if (responsesError || !responses || responses.length === 0) {
      throw new Error("Could not retrieve assessment responses");
    }

    const teenResponse = responses.find(r => r.respondent_type === "teen");

    if (!teenResponse) {
      throw new Error("Teen response not found");
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
    const resultsLink = `${baseUrl}/adhd1118/${assessment.share_token}/results`;

    const teenScores = teenResponse.scores?.nippScores || {};

    const patterns = Object.keys(teenScores).map(code => {
      const teenScore = teenScores[code];

      return {
        code,
        name: NIPP_PATTERN_INFO[code]?.name || code,
        category: ["FOC", "HYP", "IMP", "ORG", "DIM"].includes(code) ? "Core ADHD" : "Emotional/Impact",
        teenScore,
        teenLabel: getSeverityLabel(teenScore),
        percentage: scoreToPercentage(teenScore),
      };
    });

    patterns.sort((a, b) => b.teenScore - a.teenScore);

    const teenClientHtml = generateTeenClientReport(assessment, teenResponse, patterns, baseUrl);

    const emailPromises = [
      resend.emails.send({
        from: 'BrainWorx NIPP <payments@brainworx.co.za>',
        to: teenResponse.respondent_email,
        subject: `Your ADHD Assessment Results - BrainWorx NIPP`,
        html: teenClientHtml,
      }),
    ];

    if (franchiseOwnerEmail) {
      const coachReportHtml = generateComprehensiveCoachReport(
        assessment,
        teenResponse,
        patterns,
        resultsLink
      );

      emailPromises.push(
        resend.emails.send({
          from: 'BrainWorx NIPP <payments@brainworx.co.za>',
          to: franchiseOwnerEmail,
          subject: `New Teen ADHD Assessment Complete: ${assessment.teen_name} - Comprehensive Coach Report`,
          html: coachReportHtml,
        })
      );
    }

    const results = await Promise.all(emailPromises);

    for (const result of results) {
      if (result.error) {
        throw new Error(`Failed to send email: ${result.error.message}`);
      }
    }

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
