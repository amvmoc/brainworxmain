import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createTransport } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvoiceEmailRequest {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  franchiseOwnerEmail?: string;
  franchiseOwnerName?: string;
  amount: number;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  paymentMethod?: string;
  paidAt?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const emailData: InvoiceEmailRequest = await req.json();
    
    const GMAIL_USER = "payments@brainworx.co.za";
    const GMAIL_PASSWORD = "Bra14604";

    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASSWORD,
      },
    });

    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    };

    const itemsHtml = emailData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice, emailData.currency)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(item.total, emailData.currency)}</td>
      </tr>
    `).join('');

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3DB3E3, #1FAFA3); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #fff; padding: 30px; margin-top: 20px; border: 1px solid #ddd; border-radius: 10px; }
          .invoice-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0A2A5E; color: white; padding: 12px; text-align: left; }
          .total-row { background: #E6F7FF; font-weight: bold; font-size: 18px; }
          .success-badge { background: #4CAF50; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmation</h1>
            <p>Thank you for your payment!</p>
          </div>
          
          <div class="content">
            <div class="success-badge">✓ PAID</div>
            
            <p>Dear ${emailData.customerName},</p>
            <p>We have received your payment. Thank you for choosing BrainWorx!</p>
            
            <div class="invoice-details">
              <h3 style="color: #0A2A5E; margin-top: 0;">Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${emailData.invoiceNumber}</p>
              <p><strong>Payment Date:</strong> ${emailData.paidAt ? new Date(emailData.paidAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              ${emailData.paymentMethod ? `<p><strong>Payment Method:</strong> ${emailData.paymentMethod}</p>` : ''}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right;">Total Amount Paid:</td>
                  <td style="padding: 15px; text-align: right;">${formatCurrency(emailData.amount, emailData.currency)}</td>
                </tr>
              </tbody>
            </table>

            <p style="margin-top: 30px; padding: 20px; background: #E6F7FF; border-radius: 10px; border-left: 4px solid #3DB3E3;">
              <strong>What's Next?</strong><br>
              Our team will contact you within 24 hours to schedule your first session and provide access to your personalized program.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>BrainWorx</strong></p>
            <p>Transform Your Mind, Reach The World</p>
            <p style="margin-top: 10px;">If you have any questions, please contact us at payments@brainworx.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #0A2A5E; color: white; padding: 20px; border-radius: 10px; }
          .content { padding: 20px; background: #fff; border: 1px solid #ddd; border-radius: 10px; margin-top: 20px; }
          .data-row { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; color: #0A2A5E; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0A2A5E; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #ddd; }
          .total-row { background: #E6F7FF; font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>💰 New Payment Received</h2>
          </div>
          <div class="content">
            <h3>Payment Information</h3>
            <div class="data-row">
              <span class="label">Invoice Number:</span>
              <span>${emailData.invoiceNumber}</span>
            </div>
            <div class="data-row">
              <span class="label">Customer Name:</span>
              <span>${emailData.customerName}</span>
            </div>
            <div class="data-row">
              <span class="label">Customer Email:</span>
              <span>${emailData.customerEmail}</span>
            </div>
            ${emailData.franchiseOwnerEmail ? `
            <div class="data-row">
              <span class="label">Franchise Owner:</span>
              <span>${emailData.franchiseOwnerName} (${emailData.franchiseOwnerEmail})</span>
            </div>
            ` : ''}
            <div class="data-row">
              <span class="label">Amount:</span>
              <span style="color: #4CAF50; font-weight: bold; font-size: 18px;">${formatCurrency(emailData.amount, emailData.currency)}</span>
            </div>
            <div class="data-row">
              <span class="label">Payment Date:</span>
              <span>${emailData.paidAt ? new Date(emailData.paidAt).toLocaleString('en-ZA') : new Date().toLocaleString('en-ZA')}</span>
            </div>
            ${emailData.paymentMethod ? `
            <div class="data-row">
              <span class="label">Payment Method:</span>
              <span>${emailData.paymentMethod}</span>
            </div>
            ` : ''}

            <h3 style="margin-top: 30px;">Invoice Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 15px;">Total:</td>
                  <td style="text-align: right; padding: 15px;">${formatCurrency(emailData.amount, emailData.currency)}</td>
                </tr>
              </tbody>
            </table>

            <p style="margin-top: 20px; padding: 15px; background: #FFF5E6; border-left: 4px solid #FFB84D; border-radius: 4px;">
              <strong>Action Required:</strong> Customer confirmation email has been sent. Please contact the customer within 24 hours to schedule their first session.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailPromises = [];

    emailPromises.push(
      transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: emailData.customerEmail,
        subject: `Payment Confirmed - Invoice ${emailData.invoiceNumber}`,
        html: customerEmailHtml,
      })
    );

    emailPromises.push(
      transporter.sendMail({
        from: `BrainWorx <${GMAIL_USER}>`,
        to: GMAIL_USER,
        subject: `New Payment Received - ${emailData.invoiceNumber} - ${formatCurrency(emailData.amount, emailData.currency)}`,
        html: adminEmailHtml,
      })
    );

    if (emailData.franchiseOwnerEmail) {
      emailPromises.push(
        transporter.sendMail({
          from: `BrainWorx <${GMAIL_USER}>`,
          to: emailData.franchiseOwnerEmail,
          subject: `Payment Received from Your Client - ${emailData.invoiceNumber}`,
          html: adminEmailHtml,
        })
      );
    }

    await Promise.all(emailPromises);

    console.log('✅ Invoice payment emails sent successfully');
    console.log('- Customer:', emailData.customerEmail);
    console.log('- Admin:', GMAIL_USER);
    if (emailData.franchiseOwnerEmail) {
      console.log('- Franchise Owner:', emailData.franchiseOwnerEmail);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invoice payment confirmation emails sent successfully',
        recipients: {
          customer: emailData.customerEmail,
          admin: GMAIL_USER,
          franchiseOwner: emailData.franchiseOwnerEmail || null,
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
    console.error('❌ Error sending invoice emails:', error);
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