// Script to resend emails to all completed assessments
// Usage: node resend-emails.js

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: Missing environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const PATTERN_DEFINITIONS = [
  { name: "Mind In Distress", code: "DIS" },
  { name: "High Gear", code: "HYP" },
  { name: "Anchored Anger", code: "ANG" },
  { name: "Burned Out", code: "BURN" },
  { name: "Time & Order", code: "ORG" },
  { name: "Scattered Focus", code: "FOC" },
  { name: "Self-Harm Tendency", code: "SHT" },
  { name: "Stuck State", code: "TRAP" },
  { name: "Impulse Driver", code: "IMP" },
  { name: "Attitude", code: "RES" },
  { name: "Addictive Loops", code: "CPL" },
  { name: "Negative Projection", code: "NEGP" },
  { name: "Not Understanding", code: "NUH" },
  { name: "Dogma", code: "DOG" },
  { name: "Inside Out", code: "INFL" },
  { name: "Victim Loops", code: "BULLY" },
  { name: "Lack State", code: "LACK" },
  { name: "Dim Reality", code: "DIM" },
  { name: "Inward Focus", code: "INWF" },
  { name: "Deceiver", code: "DEC" }
];

const getScoreFromAnswer = (answer) => {
  const scoreMap = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
  };
  return scoreMap[answer] || 3;
};

const generatePatternScores = (answers) => {
  const patterns = {};

  PATTERN_DEFINITIONS.forEach((pattern, index) => {
    const relevantAnswers = Object.entries(answers)
      .filter(([qId]) => parseInt(qId) % 20 === index)
      .map(([_, answer]) => getScoreFromAnswer(answer));

    const avgScore = relevantAnswers.length > 0
      ? relevantAnswers.reduce((a, b) => a + b, 0) / relevantAnswers.length
      : 3;

    const normalizedScore = Math.round((avgScore / 5) * 100);
    patterns[pattern.name] = normalizedScore;
  });

  return patterns;
};

const generateAnalysisData = (patterns) => {
  const patternEntries = Object.entries(patterns).sort((a, b) => b[1] - a[1]);

  const highPatterns = patternEntries.filter(([, score]) => score >= 60);
  const lowPatterns = patternEntries.filter(([, score]) => score < 40);

  const overallScore = Math.round(
    patternEntries.reduce((sum, [, score]) => sum + score, 0) / patternEntries.length
  );

  const areasForGrowth = highPatterns.length > 0
    ? highPatterns.slice(0, 3).map(([name]) => name)
    : ['Continue maintaining current positive patterns'];

  const strengths = lowPatterns.length > 0
    ? lowPatterns.slice(0, 3).map(([name]) => `Low ${name} (Positive indicator)`)
    : ['Balanced assessment results'];

  const recommendations = [
    'Review your complete results report',
    'Schedule a consultation to discuss your assessment',
    'Consider personalized coaching for growth areas'
  ];

  return {
    overallScore,
    categoryScores: patterns,
    strengths,
    areasForGrowth,
    recommendations
  };
};

const sendEmail = async (response) => {
  try {
    const patterns = generatePatternScores(response.answers);
    const analysis = generateAnalysisData(patterns);

    const emailData = {
      customerName: response.customer_name,
      customerEmail: response.customer_email,
      franchiseOwnerEmail: response.franchise_owner_email,
      franchiseOwnerName: response.franchise_owner_name,
      responseId: response.id,
      analysis
    };

    const functionUrl = `${SUPABASE_URL}/functions/v1/send-analysis-email`;

    console.log(`\n📧 Sending to: ${response.customer_name} (${response.customer_email})`);

    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(emailData)
    });

    const result = await res.json();

    if (result.success) {
      console.log(`✅ SUCCESS - Email sent to ${response.customer_email}`);
      if (result.links) {
        console.log(`   Results URL: ${result.links.resultsUrl}`);
      }
    } else {
      console.log(`❌ FAILED - ${result.message || result.error}`);
    }

    return result;
  } catch (error) {
    console.error(`❌ ERROR sending to ${response.customer_email}:`, error.message);
    return { success: false, error: error.message };
  }
};

const main = async () => {
  console.log('==================================================');
  console.log('   RESENDING EMAILS TO ALL COMPLETED ASSESSMENTS');
  console.log('==================================================\n');

  // Fetch data from database
  console.log('Fetching completed assessments from database...\n');

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: responses, error } = await supabase
    .from('responses')
    .select(`
      id,
      customer_name,
      customer_email,
      answers,
      completed_at,
      share_token,
      franchise_owner_id,
      franchise_owners (
        email,
        name
      )
    `)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('❌ ERROR fetching responses:', error);
    process.exit(1);
  }

  console.log(`Found ${responses.length} completed assessments\n`);

  const results = {
    total: responses.length,
    successful: 0,
    failed: 0
  };

  for (const response of responses) {
    const responseWithFranchiseData = {
      ...response,
      franchise_owner_email: response.franchise_owners?.email || null,
      franchise_owner_name: response.franchise_owners?.name || null
    };

    const result = await sendEmail(responseWithFranchiseData);

    if (result.success) {
      results.successful++;
    } else {
      results.failed++;
    }

    // Small delay to avoid overwhelming the email server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n==================================================');
  console.log('                  SUMMARY');
  console.log('==================================================');
  console.log(`Total: ${results.total}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('==================================================\n');
};

main().catch(console.error);
