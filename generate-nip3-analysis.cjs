const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// NIP Definitions
const NIP_DEFINITIONS = {
  NIP1: { code: 'NIP1', name: 'Emotional Deprivation' },
  NIP2: { code: 'NIP2', name: 'Abandonment/Instability' },
  NIP3: { code: 'NIP3', name: 'Mistrust/Abuse' },
  NIP4: { code: 'NIP4', name: 'Social Isolation/Alienation' },
  NIP5: { code: 'NIP5', name: 'Defectiveness/Shame' },
  NIP6: { code: 'NIP6', name: 'Failure' },
  NIP7: { code: 'NIP7', name: 'Dependence/Incompetence' },
  NIP8: { code: 'NIP8', name: 'Vulnerability to Harm or Illness' },
  NIP9: { code: 'NIP9', name: 'Enmeshment/Undeveloped Self' },
  NIP10: { code: 'NIP10', name: 'Subjugation' },
  NIP11: { code: 'NIP11', name: 'Self-Sacrifice' },
  NIP12: { code: 'NIP12', name: 'Emotional Inhibition' },
  NIP13: { code: 'NIP13', name: 'Unrelenting Standards/Hypercriticalness' },
  NIP14: { code: 'NIP14', name: 'Entitlement/Grandiosity' },
  NIP15: { code: 'NIP15', name: 'Insufficient Self-Control/Self-Discipline' },
  NIP16: { code: 'NIP16', name: 'Approval-Seeking/Recognition-Seeking' },
  NIP17: { code: 'NIP17', name: 'Negativity/Pessimism' },
  NIP18: { code: 'NIP18', name: 'Punitiveness' },
  NIP19: { code: 'NIP19', name: 'Approval-Seeking/Recognition-Seeking' },
  NIP20: { code: 'NIP20', name: 'Negativity/Pessimism' }
};

async function generateNIP3Analysis() {
  try {
    console.log('Loading questions...');
    const questionsPath = path.join(__dirname, 'src/data/nip3/questions.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    const questions = questionsData.questions;

    console.log(`Loaded ${questions.length} questions`);

    // Get completed NIP3 assessments without analysis_results
    const { data: responses, error } = await supabase
      .from('responses')
      .select('*')
      .eq('status', 'completed')
      .is('analysis_results', null);

    if (error) {
      console.error('Error fetching responses:', error);
      return;
    }

    console.log(`Found ${responses.length} completed assessments without analysis`);

    for (const response of responses) {
      console.log(`\nProcessing: ${response.customer_name} (${response.customer_email})`);

      const answers = response.answers || {};
      const answerCount = Object.keys(answers).length;

      if (answerCount === 0) {
        console.log('  Skipping - no answers');
        continue;
      }

      console.log(`  Answer count: ${answerCount}`);

      // Group questions by NIP
      const nipQuestions = {};
      questions.forEach(q => {
        if (!nipQuestions[q.nipCode]) {
          nipQuestions[q.nipCode] = [];
        }
        nipQuestions[q.nipCode].push(q);
      });

      // Calculate scores for each NIP
      const nipResults = [];

      for (const [nipCode, nipQs] of Object.entries(nipQuestions)) {
        let actualScore = 0;
        const totalQuestions = nipQs.length;
        const maxScore = totalQuestions * 3;

        nipQs.forEach(q => {
          const answer = answers[q.id];
          if (answer !== undefined && answer !== null) {
            let score = typeof answer === 'object' ? answer.value : answer;

            // Apply reverse scoring if needed
            if (q.reverseScored) {
              score = 3 - score;
            }

            actualScore += score;
          }
        });

        const percentage = (actualScore / maxScore) * 100;

        const nipDef = NIP_DEFINITIONS[nipCode];
        if (nipDef) {
          nipResults.push({
            code: nipCode,
            name: nipDef.name,
            score: Math.round(percentage),
            actualScore,
            maxScore,
            totalQuestions
          });
        }
      }

      // Sort by score (highest first)
      nipResults.sort((a, b) => b.score - a.score);

      const overallScore = Math.round(
        nipResults.reduce((sum, r) => sum + r.score, 0) / nipResults.length
      );

      const analysis_results = {
        overallScore,
        neuralImprintPatternScores: nipResults,
        completedAt: response.completed_at,
        totalQuestions: answerCount
      };

      console.log(`  Overall Score: ${overallScore}%`);
      console.log(`  Top 3 patterns:`);
      nipResults.slice(0, 3).forEach(r => {
        console.log(`    - ${r.code} (${r.name}): ${r.score}%`);
      });

      // Update the database
      const { error: updateError } = await supabase
        .from('responses')
        .update({ analysis_results })
        .eq('id', response.id);

      if (updateError) {
        console.error('  Error updating:', updateError);
      } else {
        console.log('  ✓ Analysis results saved!');
      }
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateNIP3Analysis();
