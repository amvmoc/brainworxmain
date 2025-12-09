import { createTransport } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recipients, results, completedAt, htmlReport } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients array is required');
    }

    if (!results || !Array.isArray(results)) {
      throw new Error('Results array is required');
    }

    const topPatterns = results.filter((r: any) => r.percentage >= 50);
    const overallPercentage = (results.reduce((sum: number, r: any) => sum + r.percentage, 0) / results.length).toFixed(2);

    let patternsHtml = '';
    const top5 = results.slice(0, 5);

    top5.forEach((pattern: any, index: number) => {
      const getColor = (percentage: number) => {
        if (percentage >= 70) return '#DC2626';
        if (percentage >= 50) return '#EA580C';
        if (percentage >= 30) return '#CA8A04';
        return '#10B981';
      };

      const color = getColor(pattern.percentage);

      patternsHtml += `
        <div style="margin: 24px 0; padding: 24px; background: #ffffff; border-left: 6px solid ${color}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; background: ${color}; color: white; border-radius: 50%; font-weight: bold; font-size: 18px;">${index + 1}</span>
                <h3 style="color: #111827; margin: 0; font-size: 22px; font-weight: 700;">
                  ${pattern.code} - ${pattern.shortName}
                </h3>
              </div>
              <span style="display: inline-block; padding: 4px 12px; background: #F3F4F6; color: #374151; border-radius: 16px; font-size: 13px; font-weight: 600;">${pattern.level}</span>
            </div>
            <div style="text-align: right; margin-left: 20px;">
              <div style="font-size: 36px; font-weight: 700; color: ${color}; line-height: 1;">${pattern.percentage}%</div>
              <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">${pattern.actualScore}/${pattern.maxScore} points</div>
            </div>
          </div>

          <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0;">
            ${pattern.totalQuestions} questions analyzed across this pattern
          </p>
        </div>
      `;
    });

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

    const emailPromises = recipients.map((email: string) => {
      return transporter.sendMail({
        from: `BrainWorx Assessment <${GMAIL_USER}>`,
        to: email,
        subject: 'NIP3 Assessment Results - Test Simulation',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #1e293b 0%, #7e22ce 50%, #1e293b 100%); min-height: 100vh;">
              <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">

                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 48px 32px; text-align: center; border-radius: 20px 20px 0 0; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                  <div style="font-size: 48px; margin-bottom: 8px;">🧠</div>
                  <h1 style="margin: 0 0 8px 0; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">Neural Imprint Patterns 3.0</h1>
                  <p style="margin: 0; font-size: 20px; opacity: 0.95; font-weight: 300;">Complete Assessment Report</p>
                </div>

                <div style="background: #FEF3C7; border-left: 6px solid #F59E0B; padding: 20px 24px; margin: 0;">
                  <p style="margin: 0; color: #92400E; font-size: 15px; font-weight: 600;">
                    ⚠️ TEST SIMULATION: This report was generated using randomly selected answers for demonstration purposes.
                  </p>
                </div>

                <div style="background: #ffffff; padding: 40px 32px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
                  <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 28px; font-weight: 700;">Assessment Results</h2>

                  <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                    This is a test simulation of the NIP3 assessment system. The results below are based on randomly generated responses across all 343 questions.
                  </p>

                  <div style="background: linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%); padding: 24px; border-radius: 12px; margin: 0 0 40px 0; border: 1px solid #E0E7FF;">
                    <h3 style="color: #1E40AF; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">📊 Assessment Overview</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Questions Completed:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">343</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Completion Date:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">${completedAt}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Patterns Analyzed:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">20 NIP Categories</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Overall Score:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">${overallPercentage}%</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Priority Patterns (≥50%):</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">${topPatterns.length}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="margin: 0 0 24px 0;">
                    <h3 style="color: #111827; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">🎯 Top 5 Neural Imprint Patterns</h3>
                    <p style="color: #6B7280; margin: 0; font-size: 15px;">These patterns show the highest scores in this assessment.</p>
                  </div>

                  ${patternsHtml}

                  <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 28px; border-radius: 12px; margin: 40px 0 0 0; border-left: 6px solid #10B981;">
                    <h3 style="color: #065F46; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">📋 Complete Results</h3>
                    <p style="color: #047857; margin: 0 0 14px 0; font-size: 15px; line-height: 1.8; font-weight: 500;">
                      All 20 Neural Imprint Patterns have been analyzed and scored. The complete breakdown includes:
                    </p>
                    <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
                      <li style="margin: 6px 0;">Detailed scoring for each pattern</li>
                      <li style="margin: 6px 0;">Pattern presence levels (Strongly Present, Moderately Present, Mild, Minimal)</li>
                      <li style="margin: 6px 0;">Question-by-question analysis</li>
                      <li style="margin: 6px 0;">Comprehensive percentages and rankings</li>
                    </ul>
                  </div>

                  <div style="margin: 32px 0 0 0; padding: 20px 0 0 0; border-top: 2px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 13px; line-height: 1.6; margin: 0;">
                      <strong style="color: #374151;">Test Notice:</strong> This is a simulated assessment for demonstration and testing purposes. Real assessments require careful, thoughtful responses to provide meaningful insights.
                    </p>
                  </div>
                </div>

                <div style="text-align: center; padding: 32px 20px 0 20px;">
                  <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);">
                    <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">Neural Imprint Patterns 3.0™</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 0 0 4px 0; font-size: 13px;">Powered by BrainWorx™</p>
                    <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">&copy; 2025 BrainWorx. All Rights Reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    });

    await Promise.all(emailPromises);

    console.log('✓ Emails sent successfully to:', recipients.join(', '));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails sent successfully to ${recipients.length} recipient(s)`,
        recipients
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending NIP3 results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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