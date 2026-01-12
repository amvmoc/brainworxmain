import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@2.0.0";
import { generateComprehensiveCoachReport } from "./comprehensive-coach-report.ts";
import { generateClientReport } from "./client-report.ts";
import { generateAdvancedPDF } from "./pdf-generator.ts";

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
    const recipientEmail = body.recipientEmail; // Custom recipient email for sharing

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

    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // CRITICAL: Generate PDF report - this MUST always be included in the customer email
    console.log('Generating PDF report for:', customerName);
    const pdfBuffer = await generateAdvancedPDF(
      customerName,
      analysis,
      completionDate
    );

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF generation failed - buffer is empty');
    }

    console.log('✓ PDF generated successfully. Size:', pdfBuffer.length, 'bytes');

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);


    const emailResults = {
      customer: { sent: false, error: null as string | null },
      franchiseOwner: { sent: false, error: null as string | null },
      brainworxCoach: { sent: false, error: null as string | null },
      brainworxClient: { sent: false, error: null as string | null }
    };

    // CRITICAL: Send customer email with PDF attachment
    try {
      const pdfFilename = `BrainWorx_Report_${customerName.replace(/\s+/g, '_')}.pdf`;
      const emailTo = recipientEmail || customerEmail; // Use custom recipient if provided
      console.log('Sending customer email with PDF attachment:', pdfFilename, 'to:', emailTo);

      await resend.emails.send({
        from: 'BrainWorx <payments@brainworx.co.za>',
        to: emailTo,
        subject: "Your BrainWorx Neural Imprint Patterns Assessment Results",
        html: customerEmailBody,
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      emailResults.customer.sent = true;
      console.log('✓ Customer email sent successfully to:', emailTo);
      console.log('✓ PDF attachment included:', pdfFilename);
    } catch (error) {
      emailResults.customer.error = error.message;
      console.error('✗ Error sending customer email:', error);
    }

    // If recipientEmail is provided, skip sending to other addresses (franchise owner, etc.)
    if (recipientEmail) {
      console.log('Custom recipient email provided, skipping other email sends');
      return new Response(
        JSON.stringify({
          success: emailResults.customer.sent,
          emailResults
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Send FH report (no PDF) to franchise holder only
    if (franchiseOwnerEmail) {
      try {
        await resend.emails.send({
          from: 'BrainWorx <payments@brainworx.co.za>',
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

    console.log('=== Email Delivery Summary ===');
    console.log('Customer:', emailResults.customer.sent ? '✓ Sent' : '✗ Failed');
    console.log('Franchise Owner:', franchiseOwnerEmail ? (emailResults.franchiseOwner.sent ? '✓ Sent' : '✗ Failed') : 'N/A');
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