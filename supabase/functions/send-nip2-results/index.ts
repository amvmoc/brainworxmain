import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { responseId, customerEmail, customerName, results } = await req.json();

    // Get the full response data
    const { data: response, error: responseError } = await supabase
      .from('nip2_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (responseError) {
      throw responseError;
    }

    // Format top patterns for email
    const topPatterns = results.topPatterns.slice(0, 5);
    let patternsHtml = '';
    
    topPatterns.forEach((pattern: any, index: number) => {
      const nipCode = pattern.nipGroup;
      const percentage = pattern.percentage;
      const score = pattern.score;
      const maxScore = pattern.maxScore;
      
      patternsHtml += `
        <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 8px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">
            #${index + 1} - ${nipCode}
          </h3>
          <p style="color: #4b5563; margin: 5px 0; font-size: 16px;">
            Score: <strong>${percentage}%</strong> (${score}/${maxScore})
          </p>
        </div>
      `;
    });

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

    // Send email via Gmail
    await transporter.sendMail({
      from: `BrainWorx Assessment <${GMAIL_USER}>`,
      to: customerEmail,
      subject: 'Your Neural Imprint Patterns 2.0 Assessment Results',
      html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 32px;">Neural Imprint Patterns 2.0</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Assessment Results</p>
              </div>
              
              <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1f2937; margin-top: 0;">Hello ${customerName},</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                  Thank you for completing the Neural Imprint Patterns 2.0 assessment! Your comprehensive results are now available.
                </p>

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="color: #1e40af; margin-top: 0;">Assessment Summary</h3>
                  <p style="color: #4b5563; margin: 10px 0;">
                    <strong>Questions Completed:</strong> ${results.totalQuestions}<br>
                    <strong>Completion Date:</strong> ${results.completionDate}<br>
                    <strong>Assessment ID:</strong> ${responseId}
                  </p>
                </div>

                <h3 style="color: #1f2937; margin-top: 30px;">Your Top 5 Patterns</h3>
                ${patternsHtml}

                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
                  <h3 style="color: #065f46; margin-top: 0;">What's Next?</h3>
                  <p style="color: #047857; margin: 10px 0; line-height: 1.8;">
                    Your results provide valuable insights into your unique neural imprint patterns. These patterns influence how you think, feel, and behave in various situations.
                  </p>
                  <p style="color: #047857; margin: 10px 0; line-height: 1.8;">
                    Consider working with a qualified coach or therapist to develop strategies for managing challenging patterns and leveraging your strengths.
                  </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <strong>Important:</strong> This assessment is for informational and educational purposes only and is not a substitute for professional medical or psychological advice, diagnosis, or treatment.
                </p>
              </div>

              <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
                <p>Neural Imprint Patterns 2.0 • Powered by BrainWorx™</p>
                <p style="margin-top: 10px;">&copy; 2025 BrainWorx. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
    });

    console.log('✓ Email sent successfully to:', customerEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending NIP2 results:', error);
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