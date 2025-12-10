import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { createTransport } from "npm:nodemailer@6.9.7";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { responseId, customerEmail, customerName, results } = await req.json();

    const { data: response, error: responseError } = await supabase
      .from('nip2_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (responseError) {
      throw responseError;
    }

    const NIP_PATTERNS: Record<string, any> = {
      NIP01: { code: 'TRAP', name: 'Home/Work', color: '#FFB800', category: 'Environmental', impact: 'High', description: 'Spaces that ignore the need for conscious human growth, creating environments where individuals simply "exist" instead of evolving.', interventions: ['Create intentional growth spaces and rituals', 'Establish clear personal and professional boundaries', 'Develop a vision for conscious evolution'] },
      NIP02: { code: 'SHT', name: 'Shattered Worth', color: '#FF6B6B', category: 'Trauma', impact: 'Critical', description: 'An individual who has endured emotional damage causing hyper-sensitivity whether physical, verbal, or sexual — often at a distance with a weakened sense of personal worth and dignity.', interventions: ['Trauma-informed therapy (EMDR, Somatic Experiencing)', 'Self-compassion practices and affirmation work', 'Boundary setting and assertiveness training'] },
      NIP03: { code: 'ORG', name: 'Time & Order', color: '#DAA520', category: 'Executive Function', impact: 'High', description: 'Refers to persistent difficulties with planning, organizing, and managing time. The individual may misjudge how long tasks will take, lose important items, forget appointments, or feel constantly "behind."', interventions: ['Implement structured daily routines and systems', 'Use time-blocking and calendar management tools', 'Break large tasks into smaller, manageable steps'] },
      NIP04: { code: 'NEGP', name: 'Unmet Needs', color: '#90C695', category: 'Developmental', impact: 'High', description: 'Refers to parenting styles that fail to nurture healthy emotional and cognitive growth. These parents may rely on punishment rather than guidance, neglect emotional connection, or lack the understanding of how the brain and behavior develop.', interventions: ['Reparenting work with therapist', 'Inner child healing practices', 'Learn and practice healthy emotional expression'] },
      NIP05: { code: 'HYP', name: 'High Gear', color: '#B0B0E0', category: 'Arousal', impact: 'High', description: 'Refers to a body and mind that feel as if they are constantly "on." The individual may struggle to sit still, relax, unwind, or may appear calm on the outside while experiencing an intense inner restlessness.', interventions: ['Vagal nerve toning exercises', 'Progressive muscle relaxation', 'Mindfulness and meditation practices'] },
      NIP06: { code: 'DOG', name: 'Dogmatic Chains', color: '#87CEEB', category: 'Cognitive', impact: 'Medium', description: 'A way of thinking rooted in belief systems that restrict how a person interprets or responds to everyday issues like relationships, lifestyle, or values.', interventions: ['Cognitive flexibility exercises', 'Exposure to diverse perspectives and worldviews', 'Critical thinking skill development'] },
      NIP07: { code: 'IMP', name: 'Impulse Rush', color: '#FFD700', category: 'Impulse Control', impact: 'Medium', description: 'Describes a pattern where a person tends to "jump all out" before they are fully thought through. The person may interrupt, blurt out comments, buy things impulsively, or make quick decisions they later regret.', interventions: ['Pause-and-plan strategies before acting', 'Impulse control delay techniques', 'Mindfulness of urges without immediate action'] },
      NIP08: { code: 'NUH', name: 'Numb Heart', color: '#FFB6C1', category: 'Emotional', impact: 'Critical', description: 'Describes a pattern where a person has learned to withhold feeling as a way to survive. Emotions are kept at a distance, and empathy or boundaries hardly register.', interventions: ['Gradual emotional reconnection therapy', 'Somatic experiencing to access buried feelings', 'Safe relational experiences to practice vulnerability'] },
      NIP09: { code: 'DIS', name: 'Mind In Distress', color: '#4A90E2', category: 'Mental Health', impact: 'Critical', description: 'Points to the presence of a mental health conditions that strongly affect daily functioning. This may include depression, bipolar shifts, severe anxiety or panic, schizophrenia, certain personality patterns, trauma-related states, or other clinical concerns.', interventions: ['Comprehensive psychiatric evaluation', 'Medication management if appropriate', 'Intensive therapy (CBT, DBT, or specialized modalities)'] },
      NIP10: { code: 'ANG', name: 'Anchored Anger', color: '#DC143C', category: 'Emotional', impact: 'High', description: 'A persistent form of anger stemming from past experiences, marked by an inability to let go of resentment or grudges. It exists in two states: -Expressed: openly felt and demonstrated, or -Latent: held dormant but capable of re-emerging when triggered.', interventions: ['Anger management therapy and skill-building', 'Forgiveness work and resentment release', 'Trauma resolution for root causes'] },
      NIP11: { code: 'INFL', name: 'Inside Out', color: '#2C3E50', category: 'Locus of Control', impact: 'High', description: 'Refers to a person who complains that "life is something inflicted on their life: Do I not experience life as something I inflict on choices, patterns, and responses make their feelings."', interventions: ['Develop internal locus of control awareness', 'Personal responsibility and agency building', 'Cognitive reframing of victimhood narratives'] },
      NIP12: { code: 'BULLY', name: 'Victim Loops', color: '#9370DB', category: 'Behavioral Pattern', impact: 'Medium', description: 'Out Pattern: A habit of turning internal disappointment inward. The person often feels powerless, misunderstood, or targeted. In Pattern: A habit of turning internal disappointment.', interventions: ['Break victim-perpetrator-rescuer triangle patterns', 'Assertiveness and boundary-setting training', 'Self-advocacy skill development'] },
      NIP13: { code: 'LACK', name: 'Lack State', color: '#696969', category: 'Scarcity Mindset', impact: 'Medium', description: 'A situation created by limiting belief in financial means or material resources. The individual (or organization) may face genuine economic strain, depression, or other structural needs.', interventions: ['Financial literacy and planning education', 'Abundance mindset cultivation practices', 'Practical budgeting and resource management'] },
      NIP14: { code: 'DIM', name: 'Detail/Big Picture', color: '#B0C4DE', category: 'Attention', impact: 'Medium', description: 'Describes how easily a person can move between detail and "big picture" thinking. Some get stuck in the small and lose track of practical steps.', interventions: ['Attention training and focus techniques', 'Task prioritization systems', 'Environmental modifications for concentration'] },
      NIP15: { code: 'FOC', name: 'Scatter Focus', color: '#CD5C5C', category: 'Attention', impact: 'High', description: 'Refers to a pattern where a person struggles to rapidly between tasks, sounds, or ideas, making it hard to focus long enough to complete what was started.', interventions: ['Implement single-tasking practices', 'Use of timers and structured work periods', 'Minimize distractions in environment'] },
      NIP16: { code: 'RES', name: 'Attitude', color: '#9ACD32', category: 'Attitude', impact: 'Medium', description: 'A consistent pattern of resistance or negativity expressed toward people, relationships, responsibilities, or life situations — shaping how one engages with the world around them.', interventions: ['Identify and challenge automatic negative responses', 'Gratitude and appreciation practices', 'Explore origins of resistance patterns'] },
      NIP17: { code: 'INWF', name: 'Inward Focus', color: '#D2691E', category: 'Self-Perception', impact: 'Medium', description: 'An amplified belief in one\'s own importance that results in self-centered attitudes and choices, frequently disregarding the feelings or needs of those around them.', interventions: ['Perspective-taking and empathy development', 'Service and contribution to others', 'Feedback reception and integration'] },
      NIP18: { code: 'CPL', name: 'Addictive Loops', color: '#DC143C', category: 'Addiction', impact: 'Critical', description: 'Refers to a repeated pattern of reaching for the same behavior — no matter how you feel — even when you know it works against the path. The goal is usually to soothe, distract, or create a sense of control.', interventions: ['Addiction treatment program (inpatient or outpatient)', 'Twelve-step or recovery support groups', 'Address underlying trauma and emotional pain'] },
      NIP19: { code: 'BURN', name: 'Burned Out', color: '#A9A9A9', category: 'Depletion', impact: 'High', description: 'When a person feels or behaves older than their years — mentally, emotionally, or physically — usually because of weakness, stress overload, or prolonged caregiving.', interventions: ['Rest and recovery prioritization', 'Stress management and life balance', 'Energy restoration practices'] },
      NIP20: { code: 'DEC', name: 'Deceiver', color: '#4B0082', category: 'Interpersonal', impact: 'High', description: 'An individual who masks self-serving motives with an appearance of goodness or innocence. Such people skillfully project their authentic but operate with hidden agendas.', interventions: ['Honesty and integrity skill-building', 'Explore underlying fears and insecurities', 'Accountability and consequences'] }
    };

    const topPatterns = results.topPatterns.slice(0, 5);
    let patternsHtml = '';

    topPatterns.forEach((pattern: any, index: number) => {
      const nipInfo = NIP_PATTERNS[pattern.nipGroup];
      if (!nipInfo) return;

      const impactColor = nipInfo.impact === 'Critical' ? '#DC2626' : nipInfo.impact === 'High' ? '#EA580C' : '#CA8A04';
      const impactBg = nipInfo.impact === 'Critical' ? '#FEE2E2' : nipInfo.impact === 'High' ? '#FFEDD5' : '#FEF3C7';

      patternsHtml += `
        <div style="margin: 24px 0; padding: 24px; background: #ffffff; border-left: 6px solid ${nipInfo.color}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; background: ${nipInfo.color}; color: white; border-radius: 50%; font-weight: bold; font-size: 18px;">${index + 1}</span>
                <h3 style="color: #111827; margin: 0; font-size: 22px; font-weight: 700;">
                  ${nipInfo.code} - ${nipInfo.name}
                </h3>
              </div>
              <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <span style="display: inline-block; padding: 4px 12px; background: #F3F4F6; color: #374151; border-radius: 16px; font-size: 13px; font-weight: 600;">${nipInfo.category}</span>
                <span style="display: inline-block; padding: 4px 12px; background: ${impactBg}; color: ${impactColor}; border-radius: 16px; font-size: 13px; font-weight: 600;">${nipInfo.impact} Impact</span>
              </div>
            </div>
            <div style="text-align: right; margin-left: 20px;">
              <div style="font-size: 36px; font-weight: 700; color: ${nipInfo.color}; line-height: 1;">${pattern.percentage}%</div>
              <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">${pattern.score}/${pattern.maxScore} points</div>
            </div>
          </div>

          <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            ${nipInfo.description}
          </p>

          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <h4 style="color: #111827; font-size: 14px; font-weight: 700; margin: 0 0 10px 0;">Key Intervention Strategies:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
              ${nipInfo.interventions.map((intervention: string) => `<li style="margin: 4px 0;">${intervention}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    });

    let franchiseOwnerEmail = '';
    let franchiseOwnerName = '';

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

    const BRAINWORX_EMAIL = 'info@brainworx.co.za';

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

    const customerEmailContent = `
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
                  <h1 style="margin: 0 0 8px 0; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">Neural Imprint Patterns 2.0</h1>
                  <p style="margin: 0; font-size: 20px; opacity: 0.95; font-weight: 300;">Comprehensive Assessment Report</p>
                </div>

                <div style="background: #ffffff; padding: 40px 32px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
                  <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 28px; font-weight: 700;">Hello ${customerName},</h2>

                  <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                    Thank you for completing the Neural Imprint Patterns 2.0 assessment. Your comprehensive 343-question evaluation has been analyzed, and your personalized results are ready.
                  </p>

                  <div style="background: linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%); padding: 24px; border-radius: 12px; margin: 0 0 40px 0; border: 1px solid #E0E7FF;">
                    <h3 style="color: #1E40AF; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">📊 Assessment Overview</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Questions Completed:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">${results.totalQuestions}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Assessment Date:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">${results.completionDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 15px; font-weight: 600;">Patterns Identified:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 700; text-align: right;">20 NIP Categories</td>
                      </tr>
                    </table>
                  </div>

                  <div style="margin: 0 0 24px 0;">
                    <h3 style="color: #111827; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">🎯 Your Top 5 Neural Imprint Patterns</h3>
                    <p style="color: #6B7280; margin: 0; font-size: 15px;">These patterns represent the strongest imprints identified in your assessment.</p>
                  </div>

                  ${patternsHtml}

                  <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 28px; border-radius: 12px; margin: 40px 0 0 0; border-left: 6px solid #10B981;">
                    <h3 style="color: #065F46; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">✨ What's Next?</h3>
                    <p style="color: #047857; margin: 0 0 14px 0; font-size: 15px; line-height: 1.8; font-weight: 500;">
                      Your results provide valuable insights into your unique neural imprint patterns — deeply embedded psychological, behavioral, and cognitive configurations that shape how you think, feel, and respond to life.
                    </p>
                    <p style="color: #047857; margin: 0 0 14px 0; font-size: 15px; line-height: 1.8;">
                      Each pattern includes evidence-based intervention strategies designed to help you manage challenges and leverage your natural strengths.
                    </p>
                    <p style="color: #047857; margin: 0; font-size: 15px; line-height: 1.8; font-weight: 600;">
                      Consider working with a qualified coach, therapist, or counselor to develop a personalized action plan based on your results.
                    </p>
                  </div>

                  <div style="margin: 32px 0 0 0; padding: 20px 0 0 0; border-top: 2px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 13px; line-height: 1.6; margin: 0;">
                      <strong style="color: #374151;">Important Notice:</strong> This assessment is for informational and educational purposes only. It is not a diagnostic tool and is not a substitute for professional medical or psychological advice, diagnosis, or treatment. If you are experiencing mental health concerns, please consult with a qualified healthcare provider.
                    </p>
                  </div>
                </div>

                <div style="text-align: center; padding: 32px 20px 0 20px;">
                  <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);">
                    <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">Neural Imprint Patterns 2.0™</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 0 0 4px 0; font-size: 13px;">Powered by BrainWorx™</p>
                    <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">&copy; 2025 BrainWorx. All Rights Reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

    const franchiseEmailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f3f4f6;">
          <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: #0A2A5E; color: white; padding: 30px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0;">New NIP2 Assessment Completed</h2>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
              <p><strong>Customer Name:</strong> ${customerName}</p>
              <p><strong>Customer Email:</strong> ${customerEmail}</p>
              ${franchiseOwnerEmail ? `<p><strong>Franchise Owner:</strong> ${franchiseOwnerName} (${franchiseOwnerEmail})</p>` : ''}
              <p><strong>Completion Date:</strong> ${results.completionDate}</p>
              <p><strong>Questions Completed:</strong> ${results.totalQuestions}</p>
              <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0;">Top 5 Patterns:</h3>
                ${topPatterns.map((pattern: any, index: number) => {
                  const nipInfo = NIP_PATTERNS[pattern.nipGroup];
                  return `<div style="margin: 8px 0;"><strong>${index + 1}. ${nipInfo?.code || pattern.nipGroup} - ${nipInfo?.name || 'Unknown'}</strong> - ${pattern.percentage}% (${nipInfo?.impact || 'Unknown'} Impact)</div>`;
                }).join('')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // CRITICAL: Generate PDF report - this MUST always be included in the customer email
    console.log('Generating NIP2 PDF report for:', customerName);
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
    doc.text('Neural Imprint Patterns 2.0', 20, 30);
    doc.setFontSize(12);
    doc.text('Comprehensive Assessment Report', 20, 38);

    yPos = 60;
    doc.setTextColor(0, 0, 0);

    // Client Info
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Report for: ${customerName}`, 20, yPos);
    yPos += 10;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Assessment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPos);
    yPos += 15;

    // Top Patterns Section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Top 5 Neural Imprint Patterns', 20, yPos);
    yPos += 10;

    topPatterns.forEach((pattern: any, index: number) => {
      const nipInfo = NIP_PATTERNS[pattern.nipGroup];
      if (!nipInfo) return;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const title = `${index + 1}. ${nipInfo.code} - ${nipInfo.name}`;
      doc.text(title, 25, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Score: ${pattern.percentage}% | Impact: ${nipInfo.impact} | Category: ${nipInfo.category}`, 25, yPos);
      yPos += 7;

      const descLines = doc.splitTextToSize(nipInfo.description, 160);
      doc.text(descLines, 25, yPos);
      yPos += descLines.length * 5 + 5;

      doc.setFont(undefined, 'bold');
      doc.text('Key Interventions:', 25, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');

      nipInfo.interventions.forEach((intervention: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const intLines = doc.splitTextToSize(`• ${intervention}`, 155);
        doc.text(intLines, 30, yPos);
        yPos += intLines.length * 5 + 2;
      });

      yPos += 5;
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
      throw new Error('NIP2 PDF generation failed - buffer is empty');
    }

    console.log('✓ NIP2 PDF generated successfully. Size:', pdfBuffer.length, 'bytes');

    const pdfFilename = `BrainWorx_NIP2_Report_${customerName.replace(/\s+/g, '_')}.pdf`;
    console.log('Sending customer email with PDF attachment:', pdfFilename);

    await transporter.sendMail({
      from: `BrainWorx Assessment <${GMAIL_USER}>`,
      to: customerEmail,
      subject: 'Your Neural Imprint Patterns 2.0 Assessment Results',
      html: customerEmailContent,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log('✓ PDF attachment included:', pdfFilename);

    console.log('✓ Customer email sent to:', customerEmail);

    if (franchiseOwnerEmail) {
      await transporter.sendMail({
        from: `BrainWorx Assessment <${GMAIL_USER}>`,
        to: franchiseOwnerEmail,
        subject: 'New NIP2 Assessment Completed',
        html: franchiseEmailContent,
      });
      console.log('✓ Franchise owner email sent to:', franchiseOwnerEmail);
    }

    await transporter.sendMail({
      from: `BrainWorx Assessment <${GMAIL_USER}>`,
      to: BRAINWORX_EMAIL,
      subject: 'New NIP2 Assessment Completed',
      html: franchiseEmailContent,
    });

    console.log('✓ Admin email sent to:', BRAINWORX_EMAIL);

    await transporter.sendMail({
      from: `BrainWorx Assessment <${GMAIL_USER}>`,
      to: 'kobus@brainworx.co.za',
      subject: 'New NIP2 Assessment Completed',
      html: franchiseEmailContent,
    });

    console.log('✓ Kobus email sent to: kobus@brainworx.co.za');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails sent successfully',
        sentTo: {
          customer: customerEmail,
          franchiseOwner: franchiseOwnerEmail || 'N/A',
          admin: BRAINWORX_EMAIL,
          kobus: 'kobus@brainworx.co.za'
        }
      }),
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