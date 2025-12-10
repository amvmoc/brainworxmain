import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

interface ClientReportRequest {
  customerName: string;
  customerEmail: string;
  franchiseOwnerEmail?: string;
  franchiseOwnerName?: string;
  assessmentDate: string;
  totalQuestions: number;
  patterns: Record<string, PatternData>;
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
      franchiseOwnerEmail,
      franchiseOwnerName,
      assessmentDate,
      totalQuestions,
      patterns
    }: ClientReportRequest = await req.json();

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
              <a href="mailto:support@brainworx.com?subject=FREE 45-Minute Coaching Session" class="cta-button">
                Schedule Your FREE Session
              </a>
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
                📧 Email: support@brainworx.com<br>
                🌐 Website: www.brainworx.com
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

    console.log('=== Client Report Email Prepared ===');
    console.log('Customer:', customerName, '/', customerEmail);
    console.log('Patterns:', Object.keys(patterns).length);
    console.log('High Priority:', highPatterns.length);
    console.log('Medium Priority:', mediumPatterns.length);
    console.log('Low Priority:', lowPatterns.length);
    console.log('===================================');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client report email prepared and ready to send',
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