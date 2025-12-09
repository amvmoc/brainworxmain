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
  franchiseOwnerEmail?: string;
  franchiseOwnerName?: string;
  responseId: string;
  analysis: {
    overallScore: number;
    categoryScores: Record<string, number>;
    strengths: string[];
    areasForGrowth: string[];
    recommendations: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    let customerName: string, customerEmail: string, franchiseOwnerEmail: string | undefined, franchiseOwnerName: string | undefined, responseId: string, analysis: any;

    // If only responseId is provided, fetch the data from the database
    if (body.responseId && !body.analysis) {
      const { createClient } = await import('npm:@supabase/supabase-js@2.39.0');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: response, error } = await supabase
        .from('responses')
        .select('customer_name, customer_email, analysis_results, franchise_owner_id')
        .eq('id', body.responseId)
        .single();

      if (error || !response) {
        throw new Error('Response not found');
      }

      customerName = response.customer_name;
      customerEmail = response.customer_email;
      responseId = body.responseId;
      analysis = response.analysis_results;

      // Fetch franchise owner info if exists
      if (response.franchise_owner_id) {
        const { data: franchiseOwner } = await supabase
          .from('franchise_owners')
          .select('email, name')
          .eq('id', response.franchise_owner_id)
          .single();

        if (franchiseOwner) {
          franchiseOwnerEmail = franchiseOwner.email;
          franchiseOwnerName = franchiseOwner.name;
        }
      }
    } else {
      // Use provided data
      ({ customerName, customerEmail, franchiseOwnerEmail, franchiseOwnerName, responseId, analysis } = body);
    }

    const BRAINWORX_EMAIL = 'info@brainworx.co.za';
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://brainworx.co.za';

    // Create or reuse Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.0');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: response } = await supabase
      .from('responses')
      .select('share_token, franchise_owner_id')
      .eq('id', responseId)
      .single();

    let franchiseCode = '';
    if (response?.franchise_owner_id) {
      const { data: franchiseOwner } = await supabase
        .from('franchise_owners')
        .select('unique_link_code')
        .eq('id', response.franchise_owner_id)
        .single();

      franchiseCode = franchiseOwner?.unique_link_code || '';
    }

    const resultsUrl = `${SITE_URL}/results/${response?.share_token}`;
    const bookingUrl = franchiseCode ? `${SITE_URL}/book/${franchiseCode}` : `${SITE_URL}`;

    const customerEmailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3DB3E3, #1FAFA3); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }
          .score { font-size: 48px; font-weight: bold; color: #3DB3E3; text-align: center; margin: 20px 0; }
          .section { margin: 20px 0; }
          .section h3 { color: #0A2A5E; border-bottom: 2px solid #3DB3E3; padding-bottom: 10px; }
          ul { list-style: none; padding: 0; }
          li { padding: 8px 0; border-bottom: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BrainWorx Assessment Results</h1>
            <p>Your Comprehensive Analysis Report</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Thank you for completing the BrainWorx Comprehensive Assessment. Your results have been analyzed and are ready for review.</p>
            
            <div class="score">${analysis.overallScore}%</div>
            <p style="text-align: center; color: #666;">Overall Performance Score</p>
            
            <div class="section">
              <h3>Your Top Strengths</h3>
              <ul>
                ${analysis.strengths.map(s => `<li>✓ ${s}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h3>Growth Opportunities</h3>
              <ul>
                ${analysis.areasForGrowth.map(a => `<li>→ ${a}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h3>Personalized Recommendations</h3>
              <ul>
                ${analysis.recommendations.map(r => `<li>• ${r}</li>`).join('')}
              </ul>
            </div>
            
            <p style="margin-top: 30px; padding: 20px; background: #E6E9EF; border-radius: 10px;">
              <strong>Next Steps:</strong> Review your full results and book a consultation to discuss personalized program options.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultsUrl}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #3DB3E3, #1FAFA3); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
                View Full Results
              </a>
              ${bookingUrl !== SITE_URL ? `
              <a href="${bookingUrl}" style="display: inline-block; padding: 15px 30px; background: #0A2A5E; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
                Book Consultation
              </a>
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>© 2024 BrainWorx. All rights reserved.</p>
            <p>Transform Your Mind, Reach The World</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const generateCoachReportForEmail = () => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BrainWorx Assessment - Coach Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f1f5f9;">
          <div style="max-width: 800px; margin: 0 auto; background: white;">

            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); color: white; padding: 40px; text-align: center;">
              <div style="font-size: 36px; margin-bottom: 12px;">🧠</div>
              <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800;">New Assessment Completed</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">BrainWorx Neural Imprint Pattern Assessment</p>
            </div>

            <div style="padding: 32px; background: #f8fafc;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a;">Client Information</h2>
              <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">CLIENT NAME</div>
                    <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${customerName}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">CLIENT EMAIL</div>
                    <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${customerEmail}</div>
                  </div>
                  ${franchiseOwnerEmail ? `
                  <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">FRANCHISE OWNER</div>
                    <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${franchiseOwnerName}</div>
                  </div>
                  ` : ''}
                  <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">COMPLETION DATE</div>
                    <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style="padding: 32px;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                <h2 style="margin: 0 0 16px 0; font-size: 20px; opacity: 0.95;">Overall Performance Score</h2>
                <div style="font-size: 56px; font-weight: 800; line-height: 1;">${analysis.overallScore}%</div>
                <p style="margin: 12px 0 0 0; font-size: 16px; opacity: 0.9;">
                  ${analysis.overallScore >= 70 ? 'High Intensity Profile' : analysis.overallScore >= 40 ? 'Moderate Intensity Profile' : 'Balanced Profile'}
                </p>
              </div>
            </div>

            <div style="padding: 0 32px 32px 32px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="background: #dcfce7; border-radius: 12px; padding: 20px; border: 2px solid #86efac;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #14532d;">✓ Top Strengths</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #15803d;">
                    ${analysis.strengths.map(s => `<li style="margin-bottom: 6px;">${s}</li>`).join('')}
                  </ul>
                </div>
                <div style="background: #fee2e2; border-radius: 12px; padding: 20px; border: 2px solid #fca5a5;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #7f1d1d;">→ Areas for Growth</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
                    ${analysis.areasForGrowth.map(a => `<li style="margin-bottom: 6px;">${a}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <div style="padding: 0 32px 32px 32px;">
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #78350f;">📋 Key Recommendations</h3>
                <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                  ${analysis.recommendations.map(r => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
                </ul>
              </div>
            </div>

            <div style="padding: 0 32px 32px 32px;">
              <div style="background: #e0f2fe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #1e40af;">🎯 Next Steps</h3>
                <p style="margin: 0 0 12px 0; color: #1e3a8a;">This prospect is ready for a consultation. Review their full results and follow up within 24-48 hours for optimal engagement.</p>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${resultsUrl}" style="display: inline-block; padding: 12px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);">
                    View Full Assessment Results
                  </a>
                </div>
              </div>
            </div>

            <div style="padding: 0 32px 32px 32px;">
              <div style="background: #fff5e6; border-radius: 8px; padding: 20px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #78350f;">🔗 Important Links</h3>
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 14px; color: #92400e; font-weight: 600;">Customer Results Link:</div>
                  <a href="${resultsUrl}" style="color: #3b82f6; word-break: break-all; font-size: 14px;">${resultsUrl}</a>
                </div>
                ${bookingUrl !== SITE_URL ? `
                <div style="margin-top: 12px;">
                  <div style="font-size: 14px; color: #92400e; font-weight: 600;">Booking Page:</div>
                  <a href="${bookingUrl}" style="color: #3b82f6; font-size: 14px;">${bookingUrl}</a>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background: #0f172a; color: white; padding: 32px; text-align: center;">
              <div style="font-size: 13px; margin-bottom: 12px; opacity: 0.9;">
                <strong>PROFESSIONAL NOTIFICATION</strong><br>
                This assessment has been completed and is ready for your review.
              </div>
              <div style="font-size: 11px; opacity: 0.7;">
                © ${new Date().getFullYear()} BrainWorx. All rights reserved.<br>
                Transform Your Mind, Reach The World
              </div>
            </div>

          </div>
        </body>
        </html>
      `;
    };

    const franchiseEmailBody = generateCoachReportForEmail();

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

    const emailResults = {
      customer: { sent: false, error: null as string | null },
      franchiseOwner: { sent: false, error: null as string | null },
      brainworx: { sent: false, error: null as string | null }
    };

    try {
      await transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: customerEmail,
        subject: "Your BrainWorx Assessment Results",
        html: customerEmailBody,
      });

      emailResults.customer.sent = true;
      console.log('✓ Customer email sent to:', customerEmail);
    } catch (error) {
      emailResults.customer.error = error.message;
      console.error('✗ Error sending customer email:', error);
    }

    if (franchiseOwnerEmail) {
      try {
        await transporter.sendMail({
          from: `BrainWorx <${GMAIL_USER}>`,
          to: franchiseOwnerEmail,
          subject: "New Prospect Assessment Completed",
          html: franchiseEmailBody,
        });

        emailResults.franchiseOwner.sent = true;
        console.log('✓ Franchise owner email sent to:', franchiseOwnerEmail);
      } catch (error) {
        emailResults.franchiseOwner.error = error.message;
        console.error('✗ Error sending franchise owner email:', error);
      }
    }

    try {
      await transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: BRAINWORX_EMAIL,
        subject: "New Prospect Assessment Completed",
        html: franchiseEmailBody,
      });

      emailResults.brainworx.sent = true;
      console.log('✓ Admin email sent to:', BRAINWORX_EMAIL);
    } catch (error) {
      emailResults.brainworx.error = error.message;
      console.error('✗ Error sending admin email:', error);
    }

    try {
      await transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: 'kobus@brainworx.co.za',
        subject: "New Prospect Assessment Completed",
        html: franchiseEmailBody,
      });

      console.log('✓ Kobus email sent to: kobus@brainworx.co.za');
    } catch (error) {
      console.error('✗ Error sending Kobus email:', error);
    }

    console.log('=== Email Delivery Summary ===');
    console.log('Customer:', emailResults.customer.sent ? '✓ Sent' : '✗ Failed');
    console.log('Franchise Owner:', franchiseOwnerEmail ? (emailResults.franchiseOwner.sent ? '✓ Sent' : '✗ Failed') : 'N/A');
    console.log('Admin (info@brainworx.co.za):', emailResults.brainworx.sent ? '✓ Sent' : '✗ Failed');
    console.log('Kobus (kobus@brainworx.co.za): ✓ Sent');
    console.log('Results URL:', resultsUrl);
    console.log('Booking URL:', bookingUrl);
    console.log('==============================');

    return new Response(
      JSON.stringify({
        success: emailResults.customer.sent,
        message: emailResults.customer.sent ? 'Emails sent successfully' : 'Failed to send customer email',
        emailResults,
        links: {
          resultsUrl,
          bookingUrl
        },
        analysis: {
          score: analysis.overallScore,
          strengths: analysis.strengths.length,
          areasForGrowth: analysis.areasForGrowth.length
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
