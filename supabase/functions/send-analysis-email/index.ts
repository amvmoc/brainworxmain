import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createTransport } from "npm:nodemailer@6.9.7";
import { generateComprehensiveCoachReport } from "./comprehensive-coach-report.ts";
import { generateClientReport } from "./client-report.ts";

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
      ({ customerName, customerEmail, franchiseOwnerEmail, franchiseOwnerName, responseId, analysis } = body);
    }

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

    const customerEmailBody = generateClientReport(
      customerName,
      customerEmail,
      franchiseOwnerEmail,
      analysis,
      resultsUrl,
      bookingUrl,
      SITE_URL
    );

    const franchiseEmailBody = generateComprehensiveCoachReport(
      customerName,
      customerEmail,
      franchiseOwnerName,
      analysis,
      resultsUrl,
      bookingUrl,
      SITE_URL
    );

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
      brainworxCoach: { sent: false, error: null as string | null },
      brainworxClient: { sent: false, error: null as string | null }
    };

    try {
      await transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: customerEmail,
        subject: "Your BrainWorx Neural Imprint Patterns Assessment Results",
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
          subject: `NIP Assessment Report - ${customerName} - Comprehensive Coach Analysis`,
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
        subject: `NIP Assessment Report - ${customerName} - Comprehensive Coach Analysis`,
        html: franchiseEmailBody,
      });

      emailResults.brainworxCoach.sent = true;
      console.log('✓ Admin coach report email sent to:', BRAINWORX_EMAIL);
    } catch (error) {
      emailResults.brainworxCoach.error = error.message;
      console.error('✗ Error sending admin coach report email:', error);
    }

    try {
      await transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: BRAINWORX_EMAIL,
        subject: `NIP Client Report - ${customerName} - Assessment Results`,
        html: customerEmailBody,
      });

      emailResults.brainworxClient.sent = true;
      console.log('✓ Admin client report email sent to:', BRAINWORX_EMAIL);
    } catch (error) {
      emailResults.brainworxClient.error = error.message;
      console.error('✗ Error sending admin client report email:', error);
    }

    try {
      await transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: 'kobus@brainworx.co.za',
        subject: `NIP Assessment Report - ${customerName} - Comprehensive Coach Analysis`,
        html: franchiseEmailBody,
      });

      console.log('✓ Kobus email sent to: kobus@brainworx.co.za');
    } catch (error) {
      console.error('✗ Error sending Kobus email:', error);
    }

    console.log('=== Email Delivery Summary ===');
    console.log('Customer:', emailResults.customer.sent ? '✓ Sent' : '✗ Failed');
    console.log('Franchise Owner:', franchiseOwnerEmail ? (emailResults.franchiseOwner.sent ? '✓ Sent' : '✗ Failed') : 'N/A');
    console.log('Admin Coach Report (info@brainworx.co.za):', emailResults.brainworxCoach.sent ? '✓ Sent' : '✗ Failed');
    console.log('Admin Client Report (info@brainworx.co.za):', emailResults.brainworxClient.sent ? '✓ Sent' : '✗ Failed');
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