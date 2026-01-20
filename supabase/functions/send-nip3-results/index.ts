import { Resend } from "npm:resend@2.0.0";
import { jsPDF } from "npm:jspdf@2.5.2";

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
    const { recipients, results, completedAt, htmlReport, customerName, customerEmail, franchiseOwnerId, isCoachReport = false } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients array is required');
    }

    if (!results || !Array.isArray(results)) {
      throw new Error('Results array is required');
    }

    if (!customerName) {
      throw new Error('Customer name is required');
    }

    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    const topPatterns = results.filter((r: any) => r.percentage >= 50);
    const overallPercentage = (results.reduce((sum: number, r: any) => sum + r.percentage, 0) / results.length).toFixed(2);

    // Generate HTML for ALL 20 patterns (sorted by score)
    const sortedResults = [...results].sort((a, b) => b.percentage - a.percentage);
    let patternsHtml = '';

    sortedResults.forEach((pattern: any, index: number) => {
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

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

    // CRITICAL: Generate PDF report - this MUST always be included in customer emails
    console.log('Generating NIP3 PDF report');
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
    doc.text('Neural Imprint Patterns 3.0', 20, 30);
    doc.setFontSize(12);
    doc.text('Assessment Results', 20, 38);

    yPos = 60;
    doc.setTextColor(0, 0, 0);

    // Assessment Info
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Assessment Summary', 20, yPos);
    yPos += 10;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Client Name: ${customerName}`, 20, yPos);
    yPos += 7;
    doc.text(`Client Email: ${customerEmail}`, 20, yPos);
    yPos += 7;
    doc.text(`Completion Date: ${completedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPos);
    yPos += 7;
    doc.text(`Overall Score: ${overallPercentage}%`, 20, yPos);
    yPos += 7;
    doc.text(`Patterns Analyzed: ${results.length}`, 20, yPos);
    yPos += 15;

    // All Patterns (sorted by score)
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('All Neural Imprint Patterns (Ranked by Score)', 20, yPos);
    yPos += 10;

    sortedResults.forEach((pattern: any, index: number) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const title = `${index + 1}. ${pattern.code} - ${pattern.shortName}`;
      doc.text(title, 25, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Score: ${pattern.percentage}% | Level: ${pattern.level}`, 25, yPos);
      yPos += 7;
      doc.text(`Questions: ${pattern.totalQuestions} | Score: ${pattern.actualScore}/${pattern.maxScore}`, 25, yPos);
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
    const disclaimerText = 'This assessment is a self-evaluation tool for personal insight and is NOT a psychological evaluation or medical diagnosis. Results should be reviewed with a qualified professional. If experiencing mental health concerns, please consult a healthcare provider.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, 165);
    doc.text(disclaimerLines, 20, yPos);

    const pdfBuffer = new Uint8Array(doc.output('arraybuffer'));

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('NIP3 PDF generation failed - buffer is empty');
    }

    console.log('✓ NIP3 PDF generated successfully. Size:', pdfBuffer.length, 'bytes');

    const sanitizedName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const pdfFilename = `BrainWorx_NIP3_Report_${sanitizedName}.pdf`;

    let franchiseOwnerLinkCode = null;
    if (franchiseOwnerId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error("Supabase credentials not configured");
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/franchise_owners?id=eq.${franchiseOwnerId}&select=unique_link_code`, {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            "apikey": supabaseServiceKey
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            franchiseOwnerLinkCode = data[0].unique_link_code;
          }
        }
      } catch (error) {
        console.error('Error fetching franchise owner code:', error);
      }
    }

    const emailPromises = recipients.map((email: string) => {
      console.log('Sending NIP3 Report with PDF attachment to:', email);
      const reportType = isCoachReport ? 'Comprehensive Coach Report' : 'Assessment Results';
      const subject = isCoachReport
        ? `NIP3 Coach Report - ${customerName} - Complete Assessment Results`
        : `NIP3 Assessment Results - ${customerName}`;

      return resend.emails.send({
        from: 'BrainWorx Assessment <payments@brainworx.co.za>',
        to: email,
        subject: subject,
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
                  <p style="margin: 0; font-size: 20px; opacity: 0.95; font-weight: 300;">Comprehensive Coach Report</p>
                </div>

                <div style="background: #DBEAFE; border-left: 6px solid #3B82F6; padding: 20px 24px; margin: 0;">
                  <p style="margin: 0; color: #1E40AF; font-size: 15px; font-weight: 600;">
                    👨‍💼 COACH REPORT: This comprehensive report includes all 20 Neural Imprint Patterns with detailed scoring and analysis.
                  </p>
                </div>

                <div style="background: #ffffff; padding: 40px 32px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
                  <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 28px; font-weight: 700;">Complete Assessment Results</h2>

                  <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                    This comprehensive coach report provides a complete analysis of all 20 Neural Imprint Patterns based on 343 questions. Use this detailed breakdown to understand the client's patterns and guide your coaching approach.
                  </p>

                  <div style="background: linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%); padding: 24px; border-radius: 12px; margin: 0 0 40px 0; border: 1px solid #E0E7FF;">
                    <h3 style="color: #1E40AF; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">📊 Assessment Overview</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Client Name:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Client Email:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">${customerEmail}</td>
                      </tr>
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
                    <h3 style="color: #111827; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">🎯 All 20 Neural Imprint Patterns (Ranked by Score)</h3>
                    <p style="color: #6B7280; margin: 0; font-size: 15px;">Complete breakdown of all patterns from highest to lowest scoring.</p>
                  </div>

                  ${patternsHtml}

                  <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 28px; border-radius: 12px; margin: 40px 0 0 0; border-left: 6px solid #10B981;">
                    <h3 style="color: #065F46; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">📋 Coach Guidance</h3>
                    <p style="color: #047857; margin: 0 0 14px 0; font-size: 15px; line-height: 1.8; font-weight: 500;">
                      This report provides comprehensive insights for coaching:
                    </p>
                    <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
                      <li style="margin: 6px 0;">All 20 patterns ranked by intensity</li>
                      <li style="margin: 6px 0;">Pattern presence levels for prioritization</li>
                      <li style="margin: 6px 0;">Detailed scoring breakdown per pattern</li>
                      <li style="margin: 6px 0;">Question-level analysis (343 total questions)</li>
                    </ul>
                  </div>

                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px; margin: 40px 0 0 0; text-align: center;">
                    <h3 style="color: #ffffff; margin: 0 0 12px 0; font-size: 24px; font-weight: 700;">📅 Ready for Your Next Step?</h3>
                    <p style="color: rgba(255,255,255,0.95); margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                      Schedule a consultation session to discuss your results and create a personalized action plan.
                    </p>
                    <a href="${franchiseOwnerLinkCode ? `https://www.brainworx.co.za/book/${franchiseOwnerLinkCode}?name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}` : 'https://www.brainworx.co.za/booking'}" style="display: inline-block; background: #ffffff; color: #667eea; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s;">
                      Book Your Session Now
                    </a>
                  </div>

                  <div style="margin: 32px 0 0 0; padding: 20px 0 0 0; border-top: 2px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 13px; line-height: 1.6; margin: 0;">
                      <strong style="color: #374151;">Professional Use:</strong> This report is intended for qualified coaches and practitioners. Use these insights to guide personalized coaching strategies and interventions.
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
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
    });

    const results = await Promise.all(emailPromises);

    for (const result of results) {
      if (result.error) {
        throw new Error(`Failed to send email: ${result.error.message}`);
      }
    }

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
