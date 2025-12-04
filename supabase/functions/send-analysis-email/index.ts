import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
  responseId?: string;
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
    const { customerName, customerEmail, franchiseOwnerEmail, franchiseOwnerName, analysis }: EmailRequest = await req.json();

    const BRAINWORX_EMAIL = 'admin@brainworx.com';

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
              <strong>Next Steps:</strong> Our team will review your results and reach out within 24-48 hours to discuss personalized program options that align with your development goals.
            </p>
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
              <strong>Next Steps:</strong> This prospect is ready for a consultation. Review their full results in your dashboard and schedule a follow-up within 24-48 hours.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const brainworxEmailBody = `
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Assessment Completed - System Notification</h2>
          </div>
          <div class="content">
            <h3>Customer Information</h3>
            <div class="data-row">
              <span class="label">Customer Name:</span>
              <span>${customerName}</span>
            </div>
            <div class="data-row">
              <span class="label">Customer Email:</span>
              <span>${customerEmail}</span>
            </div>
            ${franchiseOwnerEmail ? `
            <div class="data-row">
              <span class="label">Franchise Owner:</span>
              <span>${franchiseOwnerName} (${franchiseOwnerEmail})</span>
            </div>
            ` : ''}
            <div class="data-row">
              <span class="label">Overall Score:</span>
              <span>${analysis.overallScore}%</span>
            </div>
            <div class="data-row">
              <span class="label">Completion Date:</span>
              <span>${new Date().toLocaleString()}</span>
            </div>

            <h3>Assessment Summary</h3>
            <h4>Top Strengths:</h4>
            <ul>
              ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>

            <h4>Areas for Growth:</h4>
            <ul>
              ${analysis.areasForGrowth.map(a => `<li>${a}</li>`).join('')}
            </ul>

            <h4>Recommendations:</h4>
            <ul>
              ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>

            <p style="margin-top: 20px; padding: 15px; background: #FFF5E6; border-left: 4px solid #FFB84D;">
              <strong>System Note:</strong> Customer and ${franchiseOwnerEmail ? 'franchise owner' : 'admin'} have been notified. Follow up may be required for high-priority prospects.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailsSent = {
      customer: customerEmail,
      franchiseOwner: franchiseOwnerEmail || 'N/A',
      brainworx: BRAINWORX_EMAIL
    };

    console.log('=== Email Notifications Prepared ===');
    console.log('1. Customer Email:', customerEmail);
    console.log('   Preview:', customerEmailBody.substring(0, 100) + '...');

    if (franchiseOwnerEmail) {
      console.log('2. Franchise Owner Email:', franchiseOwnerEmail);
      console.log('   Preview:', franchiseEmailBody.substring(0, 100) + '...');
    }

    console.log('3. BrainWorx Admin Email:', BRAINWORX_EMAIL);
    console.log('   Preview:', brainworxEmailBody.substring(0, 100) + '...');
    console.log('=================================');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analysis emails prepared and ready to send',
        emailsSent,
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
