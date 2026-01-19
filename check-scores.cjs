const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkScores() {
  const { data, error } = await supabase
    .from('responses')
    .select('customer_name, customer_email, analysis_results')
    .eq('customer_email', 'andrimocke@gmail.com')
    .eq('status', 'completed')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Customer:', data.customer_name);
  console.log('\nScores in database:');

  if (data.analysis_results && data.analysis_results.neuralImprintPatternScores) {
    data.analysis_results.neuralImprintPatternScores
      .sort((a, b) => b.score - a.score)
      .forEach(nip => {
        const code = (nip.code || '').padEnd(8);
        const name = (nip.name || '').padEnd(25);
        console.log(`  ${code} ${name} ${nip.score}%`);
      });
  } else {
    console.log('  No analysis_results found!');
  }
}

checkScores().catch(console.error);
