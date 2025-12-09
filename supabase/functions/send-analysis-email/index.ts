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
    const { customerName, customerEmail, franchiseOwnerEmail, franchiseOwnerName, responseId, analysis }: EmailRequest = await req.json();

    const BRAINWORX_EMAIL = 'info@brainworx.co.za';
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://brainworx.co.za';

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

    const franchiseEmailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0A2A5E; color: white; padding: 20px; border-radius: 10px; }
          .content { padding: 20px; }
          .data-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; color: #0A2A5E; }
          .score-highlight { font-size: 32px; font-weight: bold; color: #3DB3E3; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Prospect Assessment Completed</h2>
          </div>
          <div class="content">
            <p>Dear ${franchiseOwnerName || 'Franchise Owner'},</p>
            <p>A prospect has completed the BrainWorx assessment through your franchise.</p>

            <div class="data-row">
              <span class="label">Prospect Name:</span>
              <span>${customerName}</span>
            </div>
            <div class="data-row">
              <span class="label">Prospect Email:</span>
              <span>${customerEmail}</span>
            </div>
            <div class="data-row">
              <span class="label">Completion Date:</span>
              <span>${new Date().toLocaleString()}</span>
            </div>

            <div class="score-highlight">${analysis.overallScore}%</div>
            <p style="text-align: center; color: #666;">Overall Performance Score</p>

            <h3>Top Strengths:</h3>
            <ul>
              ${analysis.strengths.map(s => `<li>✓ ${s}</li>`).join('')}
            </ul>

            <h3>Areas for Growth:</h3>
            <ul>
              ${analysis.areasForGrowth.map(a => `<li>→ ${a}</li>`).join('')}
            </ul>

            <p style="margin-top: 20px; padding: 15px; background: #E6F7FF; border-left: 4px solid #3DB3E3; border-radius: 4px;">
              <strong>Next Steps:</strong> This prospect is ready for a consultation. Review their full results and follow up within 24-48 hours.
            </p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${resultsUrl}" style="display: inline-block; padding: 12px 24px; background: #3DB3E3; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Full Results
              </a>
            </div>

            <p style="margin-top: 15px; padding: 12px; background: #FFF5E6; border-radius: 6px; font-size: 14px;">
              <strong>Customer's View Link:</strong><br/>
              <a href="${resultsUrl}" style="color: #3DB3E3; word-break: break-all;">${resultsUrl}</a><br/>
              ${bookingUrl !== SITE_URL ? `<strong style="margin-top: 10px; display: block;">Booking Link:</strong> <a href="${bookingUrl}" style="color: #3DB3E3;">${bookingUrl}</a>` : ''}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

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