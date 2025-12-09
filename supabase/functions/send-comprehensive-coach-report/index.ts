import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createTransport } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CoachReportRequest {
  recipientEmail: string;
  recipientName?: string;
  reportData: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recipientEmail, recipientName = "Coach", reportData }: CoachReportRequest = await req.json();

    const generateCoachReportHTML = (data: any) => {
      const { client, assessmentDate, profileOverview, keyStrengths, primaryConcerns, criticalFindings, scores, patterns, actionPlan, resources, progressTracking, clinicalNotes, summary } = data;

      const renderScoreCard = (score: any) => {
        const colorClass = score.color === 'red' ? '#ef4444' : score.color === 'yellow' ? '#f59e0b' : '#3b82f6';
        return `
          <div style="background: white; border: 2px solid ${colorClass}; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div>
                <h4 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">${score.name}</h4>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Code: ${score.code} | Questions: ${score.questionCount}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 32px; font-weight: 800; color: ${colorClass};">${score.score}%</div>
                <span style="display: inline-block; padding: 4px 12px; background: ${colorClass}; color: white; border-radius: 12px; font-size: 11px; font-weight: 600;">${score.severity}</span>
              </div>
            </div>
          </div>
        `;
      };

      const renderPatternDetail = (pattern: any) => {
        const colorClass = pattern.score >= 60 ? '#ef4444' : pattern.score >= 40 ? '#f59e0b' : '#3b82f6';
        return `
          <div style="background: white; border-left: 4px solid ${colorClass}; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
              <h4 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">${pattern.name} (${pattern.code})</h4>
              <span style="font-size: 28px; font-weight: 800; color: ${colorClass};">${pattern.score}%</span>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; color: #475569; line-height: 1.6;">${pattern.description}</p>
            </div>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Clinical Significance:</h5>
              <p style="margin: 0; color: #475569; font-size: 14px;">${pattern.clinicalSignificance}</p>
            </div>
            <div style="margin-bottom: 12px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Observed Behaviors:</h5>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                ${pattern.observedBehaviors.map((b: string) => `<li style="margin-bottom: 4px;">${b}</li>`).join('')}
              </ul>
            </div>
            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #78350f;">Neurological Impact:</h5>
              <p style="margin: 0; color: #78350f; font-size: 14px;">${pattern.neurologicalImpact}</p>
            </div>
            <div style="background: #dcfce7; border-radius: 8px; padding: 16px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #14532d;">Recommendations:</h5>
              <ul style="margin: 0; padding-left: 20px; color: #14532d;">
                ${pattern.recommendations.map((r: string) => `<li style="margin-bottom: 4px;">${r}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
      };

      const renderActionPlanPhase = (phase: any) => {
        return `
          <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #1e40af;">${phase.phase}</h4>
            <p style="margin: 0 0 16px 0; color: #64748b; font-weight: 600;">${phase.timeframe}</p>
            
            <div style="margin-bottom: 16px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Focus Areas:</h5>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                ${phase.focus.map((f: string) => `<li style="margin-bottom: 4px;">${f}</li>`).join('')}
              </ul>
            </div>
            
            <div style="margin-bottom: 16px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Goals:</h5>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                ${phase.goals.map((g: string) => `<li style="margin-bottom: 4px;">${g}</li>`).join('')}
              </ul>
            </div>
            
            <div style="margin-bottom: 16px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Activities:</h5>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                ${phase.activities.map((a: string) => `<li style="margin-bottom: 4px;">${a}</li>`).join('')}
              </ul>
            </div>
            
            <div style="background: #dcfce7; border-radius: 8px; padding: 12px;">
              <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #14532d;">Success Indicators:</h5>
              <ul style="margin: 0; padding-left: 20px; color: #14532d;">
                ${phase.successIndicators.map((s: string) => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
      };

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BrainWorx Comprehensive Coach Report</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f1f5f9;">
          <div style="max-width: 900px; margin: 0 auto; background: white;">
            
            <!-- Cover Page -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); color: white; padding: 60px 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🧠</div>
              <h1 style="margin: 0 0 16px 0; font-size: 42px; font-weight: 800;">BrainWorx</h1>
              <div style="width: 80px; height: 4px; background: white; margin: 0 auto 24px auto; opacity: 0.8;"></div>
              <h2 style="margin: 0 0 32px 0; font-size: 28px; font-weight: 600;">Comprehensive Coach Report</h2>
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px; display: inline-block; text-align: left; min-width: 300px;">
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">CLIENT NAME</div>
                  <div style="font-size: 18px; font-weight: 600;">${client.name}</div>
                </div>
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">ASSESSMENT DATE</div>
                  <div style="font-size: 18px; font-weight: 600;">${assessmentDate}</div>
                </div>
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">ASSESSMENT TYPE</div>
                  <div style="font-size: 16px; font-weight: 600;">${client.assessmentType}</div>
                </div>
                <div>
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">PRACTITIONER</div>
                  <div style="font-size: 16px; font-weight: 600;">${client.practitionerName}</div>
                  <div style="font-size: 14px; opacity: 0.8;">ID: ${client.practitionerId}</div>
                </div>
              </div>
            </div>

            <!-- Executive Summary -->
            <div style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Executive Summary</h2>
              
              <div style="background: linear-gradient(to right, #dbeafe, #e0f2fe); border-left: 4px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #1e40af;">Profile Overview</h3>
                <p style="margin: 0; color: #1e293b; line-height: 1.6;">${profileOverview}</p>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                <div style="background: #dcfce7; border-radius: 12px; padding: 20px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #14532d;">Key Strengths</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #14532d;">
                    ${keyStrengths.map((s: string) => `<li style="margin-bottom: 6px;">${s}</li>`).join('')}
                  </ul>
                </div>
                <div style="background: #fee2e2; border-radius: 12px; padding: 20px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #7f1d1d;">Primary Concerns</h3>
                  ${primaryConcerns.map((c: any) => `
                    <div style="margin-bottom: 12px;">
                      <div style="font-weight: 600; color: #991b1b;">${c.pattern}</div>
                      <div style="font-size: 14px; color: #7f1d1d;">${c.description}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              ${criticalFindings.length > 0 ? `
                <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #78350f;">Critical Findings</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                    ${criticalFindings.map((f: string) => `<li style="margin-bottom: 6px;">${f}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>

            <!-- Scoring Overview -->
            <div style="padding: 40px; background: #f8fafc;">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Comprehensive Scoring Overview</h2>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                ${scores.map((score: any) => renderScoreCard(score)).join('')}
              </div>
            </div>

            <!-- Pattern Analysis -->
            <div style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Detailed Pattern Analysis</h2>
              
              ${patterns.high.length > 0 ? `
                <div style="margin-bottom: 40px;">
                  <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #dc2626;">High Priority Patterns (60-100%)</h3>
                  ${patterns.high.map((p: any) => renderPatternDetail(p)).join('')}
                </div>
              ` : ''}

              ${patterns.medium.length > 0 ? `
                <div style="margin-bottom: 40px;">
                  <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #f59e0b;">Medium Priority Patterns (40-59%)</h3>
                  ${patterns.medium.map((p: any) => renderPatternDetail(p)).join('')}
                </div>
              ` : ''}

              ${patterns.low.length > 0 ? `
                <div style="margin-bottom: 40px;">
                  <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #3b82f6;">Low Priority Patterns (0-39%)</h3>
                  ${patterns.low.map((p: any) => renderPatternDetail(p)).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Action Plan -->
            <div style="padding: 40px; background: #f8fafc;">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Structured Action Plan</h2>
              ${actionPlan.map((phase: any) => renderActionPlanPhase(phase)).join('')}
            </div>

            <!-- Resources -->
            <div style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Recommended Resources</h2>
              ${resources.map((category: any) => `
                <div style="margin-bottom: 24px;">
                  <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1e40af;">${category.icon} ${category.category}</h3>
                  ${category.resources.map((r: any) => `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                      <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">${r.title}</div>
                      <div style="color: #64748b; font-size: 14px; margin-bottom: 4px;">${r.description}</div>
                      <div style="display: inline-block; padding: 2px 8px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 12px; font-weight: 600;">${r.type}</div>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>

            <!-- Progress Tracking -->
            <div style="padding: 40px; background: #f8fafc;">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Progress Tracking Framework</h2>
              
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Review Schedule</h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569;">
                  ${progressTracking.reviewSchedule.map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
                </ul>
              </div>

              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Key Metrics</h3>
                ${progressTracking.metrics.map((m: any) => `
                  <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="font-weight: 600; color: #0f172a; margin-bottom: 8px;">${m.metric}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; font-size: 14px;">
                      <div>
                        <div style="color: #64748b; margin-bottom: 2px;">Baseline</div>
                        <div style="color: #0f172a;">${m.baseline}</div>
                      </div>
                      <div>
                        <div style="color: #64748b; margin-bottom: 2px;">Target</div>
                        <div style="color: #0f172a;">${m.target}</div>
                      </div>
                      <div>
                        <div style="color: #64748b; margin-bottom: 2px;">Frequency</div>
                        <div style="color: #0f172a;">${m.frequency}</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div>
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Tracking Tools</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                  ${progressTracking.trackingTools.map((t: string) => `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; color: #475569;">
                      ${t}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Clinical Notes -->
            <div style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Clinical Notes</h2>
              ${clinicalNotes.map((note: any) => `
                <div style="background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <div style="font-weight: 600; color: #78350f;">${note.practitioner}</div>
                    <div style="color: #92400e; font-size: 14px;">${note.date}</div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; font-weight: 600; color: #78350f; margin-bottom: 4px;">OBSERVATION</div>
                    <div style="color: #78350f;">${note.observation}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 600; color: #78350f; margin-bottom: 4px;">RECOMMENDATION</div>
                    <div style="color: #78350f;">${note.recommendation}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Summary -->
            <div style="padding: 40px; background: linear-gradient(to bottom, #f8fafc, #e2e8f0);">
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; color: #0f172a; border-bottom: 4px solid #3b82f6; padding-bottom: 12px;">Summary & Next Steps</h2>
              
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Overall Prognosis</h3>
                <p style="margin: 0; color: #475569; line-height: 1.6;">${summary.overallPrognosis}</p>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                <div style="background: white; border-radius: 12px; padding: 20px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #1e40af;">Key Takeaways</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #475569;">
                    ${summary.keyTakeaways.map((t: string) => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
                  </ul>
                </div>
                <div style="background: white; border-radius: 12px; padding: 20px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #dc2626;">Priority Actions</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #475569;">
                    ${summary.priorityActions.map((a: string) => `<li style="margin-bottom: 6px;">${a}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Next Steps Timeline</h3>
                ${summary.nextSteps.map((step: any, index: number) => `
                  <div style="display: flex; gap: 16px; margin-bottom: 12px;">
                    <div style="flex-shrink: 0; width: 32px; height: 32px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">${index + 1}</div>
                    <div style="flex: 1;">
                      <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${step.action}</div>
                      <div style="color: #64748b; font-size: 14px;">${step.timeline}</div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #7f1d1d;">Emergency Contacts</h3>
                ${summary.emergencyContacts.map((contact: any) => `
                  <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                    <div style="font-weight: 600; color: #7f1d1d;">${contact.name}</div>
                    <div style="color: #991b1b; font-size: 14px;">📞 ${contact.phone}</div>
                    <div style="color: #7f1d1d; font-size: 12px;">${contact.availability}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #0f172a; color: white; padding: 40px; text-align: center;">
              <div style="font-size: 14px; margin-bottom: 16px;">
                <strong>CONFIDENTIAL PROFESSIONAL REPORT</strong><br>
                This document contains sensitive clinical information and is intended solely for use by qualified practitioners.
              </div>
              <div style="font-size: 12px; opacity: 0.8;">
                © 2024 BrainWorx. All rights reserved.<br>
                Neural Imprint Patterns™ Assessment System<br>
                Generated: ${new Date().toLocaleString()}
              </div>
            </div>

          </div>
        </body>
        </html>
      `;
    };

    const htmlContent = generateCoachReportHTML(reportData);

    // Setup Gmail transporter
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
      to: recipientEmail,
      subject: `Comprehensive Coach Report - ${reportData.client.name}`,
      html: htmlContent,
    });

    console.log('=== Comprehensive Coach Report Sent ===');
    console.log('Recipient:', recipientEmail);
    console.log('Client:', reportData.client.name);
    console.log('Date:', reportData.assessmentDate);
    console.log('=======================================');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comprehensive coach report sent successfully',
        recipient: recipientEmail,
        client: reportData.client.name
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