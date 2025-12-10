import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingReminderRequest {
  franchiseOwnerEmail: string;
  franchiseOwnerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      franchiseOwnerEmail,
      franchiseOwnerName,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      startTime,
      endTime,
      notes
    }: BookingReminderRequest = await req.json();

    const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailToFranchiseOwner = {
      from: "BrainWorx <info@brainworx.co.za>",
      to: franchiseOwnerEmail,
      subject: `New Booking Confirmed: ${customerName} on ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A2A5E 0%, #3DB3E3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📅 New Booking Confirmed!</h1>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Dear ${franchiseOwnerName},</p>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You have a new booking scheduled in your calendar:
            </p>

            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #0A2A5E; margin: 0 0 15px 0; font-size: 20px;">Booking Details</h2>

              <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 120px;">Customer:</span>
                  <span style="color: #333;">${customerName}</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 120px;">Email:</span>
                  <span style="color: #333;">${customerEmail}</span>
                </div>
                ${customerPhone ? `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 120px;">Phone:</span>
                  <span style="color: #333;">${customerPhone}</span>
                </div>
                ` : ''}
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 120px;">Date:</span>
                  <span style="color: #333; font-weight: bold; font-size: 16px;">${formattedDate}</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 120px;">Time:</span>
                  <span style="color: #333; font-weight: bold; font-size: 16px;">${startTime} - ${endTime}</span>
                </div>
                ${notes ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                  <span style="font-weight: bold; color: #0A2A5E; display: block; margin-bottom: 5px;">Notes:</span>
                  <span style="color: #666; font-style: italic;">${notes}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background: #e7f3ff; border-left: 4px solid #3DB3E3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0A2A5E; font-size: 14px;">
                <strong>💡 Reminder:</strong> The customer has been sent a confirmation email with these booking details.
              </p>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 20px;">
              To manage this booking or view your full calendar, please log in to your dashboard.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} BrainWorx™ | All Rights Reserved<br>
                <a href="https://www.brainworx.co.za" style="color: #3DB3E3; text-decoration: none;">www.brainworx.co.za</a> |
                <a href="mailto:info@brainworx.co.za" style="color: #3DB3E3; text-decoration: none;">info@brainworx.co.za</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const emailToCustomer = {
      from: "BrainWorx <info@brainworx.co.za>",
      to: customerEmail,
      subject: `Booking Confirmation: ${formattedDate} at ${startTime}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Booking Confirmed!</h1>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Dear ${customerName},</p>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your booking with <strong>BrainWorx</strong> has been confirmed!
            </p>

            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #667eea; margin: 0 0 15px 0; font-size: 20px;">Your Appointment Details</h2>

              <div style="background: white; border-radius: 8px; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="font-size: 18px; color: #667eea; font-weight: bold; margin-bottom: 5px;">📅 ${formattedDate}</div>
                  <div style="font-size: 24px; color: #333; font-weight: bold;">🕐 ${startTime} - ${endTime}</div>
                </div>

                <div style="padding-top: 20px; border-top: 2px solid #f0f0f0;">
                  <div style="margin-bottom: 10px;">
                    <span style="font-weight: bold; color: #667eea;">Coach:</span>
                    <span style="color: #333; margin-left: 10px;">${franchiseOwnerName}</span>
                  </div>
                  ${notes ? `
                  <div style="margin-top: 15px;">
                    <span style="font-weight: bold; color: #667eea; display: block; margin-bottom: 5px;">Session Notes:</span>
                    <span style="color: #666;">${notes}</span>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⏰ Important:</strong> Please arrive 5 minutes before your scheduled time.
              </p>
            </div>

            <div style="background: #e7f3ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #333; font-size: 14px;">
                <strong>Need to reschedule or have questions?</strong><br>
                Contact us at <a href="mailto:info@brainworx.co.za" style="color: #667eea; text-decoration: none;">info@brainworx.co.za</a>
              </p>
            </div>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">
              We look forward to seeing you!
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} BrainWorx™ | All Rights Reserved<br>
                <a href="https://www.brainworx.co.za" style="color: #667eea; text-decoration: none;">www.brainworx.co.za</a> |
                <a href="mailto:info@brainworx.co.za" style="color: #667eea; text-decoration: none;">info@brainworx.co.za</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const emailToBrainworxInfo = {
      from: "BrainWorx <info@brainworx.co.za>",
      to: "info@brainworx.co.za",
      subject: `New Booking Alert: ${customerName} with ${franchiseOwnerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A2A5E 0%, #3DB3E3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📋 New Booking Notification</h1>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">New booking created in the system:</p>

            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #0A2A5E; margin: 0 0 15px 0; font-size: 20px;">Booking Details</h2>

              <div style="background: white; border-radius: 8px; padding: 15px;">
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 150px; display: inline-block;">Franchise Holder:</span>
                  <span style="color: #333;">${franchiseOwnerName} (${franchiseOwnerEmail})</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 150px; display: inline-block;">Customer:</span>
                  <span style="color: #333;">${customerName}</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 150px; display: inline-block;">Email:</span>
                  <span style="color: #333;">${customerEmail}</span>
                </div>
                ${customerPhone ? `
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 150px; display: inline-block;">Phone:</span>
                  <span style="color: #333;">${customerPhone}</span>
                </div>
                ` : ''}
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 150px; display: inline-block;">Date:</span>
                  <span style="color: #333; font-weight: bold;">${formattedDate}</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: bold; color: #0A2A5E; width: 150px; display: inline-block;">Time:</span>
                  <span style="color: #333; font-weight: bold;">${startTime} - ${endTime}</span>
                </div>
                ${notes ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                  <span style="font-weight: bold; color: #0A2A5E; display: block; margin-bottom: 5px;">Notes:</span>
                  <span style="color: #666; font-style: italic;">${notes}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background: #e7f3ff; border-left: 4px solid #3DB3E3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0A2A5E; font-size: 14px;">
                <strong>✓ Status:</strong> Confirmation emails have been sent to both the franchise holder and the customer.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} BrainWorx™ | All Rights Reserved<br>
                <a href="https://www.brainworx.co.za" style="color: #3DB3E3; text-decoration: none;">www.brainworx.co.za</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const [ownerResult, customerResult, infoResult] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailToFranchiseOwner),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailToCustomer),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailToBrainworxInfo),
      }),
    ]);

    if (!ownerResult.ok || !customerResult.ok || !infoResult.ok) {
      const errors = [];
      if (!ownerResult.ok) errors.push(`Franchise owner email failed: ${await ownerResult.text()}`);
      if (!customerResult.ok) errors.push(`Customer email failed: ${await customerResult.text()}`);
      if (!infoResult.ok) errors.push(`BrainWorx info email failed: ${await infoResult.text()}`);
      throw new Error(errors.join('; '));
    }

    return new Response(
      JSON.stringify({ success: true, message: "Reminder emails sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});