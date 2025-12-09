const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

async function sendResults() {
  console.log('📧 Preparing to send NIP3 test results...\n');

  const resultsPath = path.join(__dirname, 'nip3-test-results.json');
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

  const recipients = [
    'kobus@brainworx.co.za',
    'andrimocke@gmail.com'
  ];

  console.log(`📬 Recipients: ${recipients.join(', ')}\n`);

  const payload = {
    recipients,
    results: results.results,
    completedAt: results.completedAt,
    htmlReport: results.htmlReport
  };

  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Supabase URL or Anon Key not found in .env file');
    process.exit(1);
  }

  const functionUrl = `${supabaseUrl}/functions/v1/send-nip3-results`;

  console.log('🚀 Sending request to edge function...\n');

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log(`📨 ${data.message}`);
      console.log(`\n📊 Summary:`);
      console.log(`   - Total patterns: ${results.results.length}`);
      console.log(`   - Priority patterns (≥50%): ${results.results.filter(r => r.percentage >= 50).length}`);
      console.log(`   - Overall score: ${results.overallPercentage}%`);
      console.log(`   - Top pattern: ${results.results[0].name} (${results.results[0].percentage}%)`);
      console.log(`\n✉️ Emails sent to:`);
      data.recipients.forEach(email => {
        console.log(`   ✓ ${email}`);
      });
    } else {
      console.error('❌ Error sending results:', data.error);
      console.log('\n⚠️ The email function requires SMTP configuration.');
      console.log('📄 However, the HTML report has been generated and saved to:');
      console.log(`   ${path.join(__dirname, 'nip3-test-results.html')}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️ Could not send emails. The report is available at:');
    console.log(`   ${path.join(__dirname, 'nip3-test-results.html')}`);
    process.exit(1);
  }
}

sendResults();
