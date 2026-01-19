#!/usr/bin/env node

/**
 * Script to recalculate and fix analysis_results for all NIP3 assessments
 * This fixes the issue where old assessments have incorrect scores
 */

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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load questions data
const questionsData = require('./src/data/nip3/questions.json');
const questions = questionsData.questions;

// NIP Definitions
const NIP_DEFINITIONS = {
  'NIP01': { name: 'Non-Growth Spaces', code: 'NIP01' },
  'NIP02': { name: 'Emotional Damage', code: 'NIP02' },
  'NIP03': { name: 'Time & Order', code: 'ORG' },
  'NIP04': { name: 'Ineffective Parenting', code: 'NIP04' },
  'NIP05': { name: 'High Gear', code: 'HYP' },
  'NIP06': { name: 'Dogma', code: 'DOG' },
  'NIP07': { name: 'Impulse Driver', code: 'IMP' },
  'NIP08': { name: 'Numb Heart', code: 'NUH' },
  'NIP09': { name: 'Mind In Distress', code: 'DIS' },
  'NIP10': { name: 'Anchored Anger', code: 'ANG' },
  'NIP11': { name: 'Control Locus', code: 'NIP11' },
  'NIP12': { name: 'Victim Loops', code: 'BULLY' },
  'NIP13': { name: 'Lack State', code: 'LACK' },
  'NIP14': { name: 'Detail/Big Picture', code: 'DIM' },
  'NIP15': { name: 'Scattered Focus', code: 'FOC' },
  'NIP16': { name: 'Attitude', code: 'RES' },
  'NIP17': { name: 'Inside Out', code: 'INFL' },
  'NIP18': { name: 'Addictive Loops', code: 'CPL' },
  'NIP19': { name: 'Burned Out', code: 'BURN' },
  'NIP20': { name: 'Deceiver', code: 'DEC' }
};

/**
 * Calculate NIP results from answers using the correct NIP3 scoring method
 */
function calculateNIPResults(answers, questions) {
  // Group questions by NIP
  const nipQuestions = new Map();
  questions.forEach(q => {
    if (!nipQuestions.has(q.nipCode)) {
      nipQuestions.set(q.nipCode, []);
    }
    nipQuestions.get(q.nipCode).push(q);
  });

  // Create answer map for quick lookup
  const answerMap = new Map();
  Object.entries(answers).forEach(([qId, answer]) => {
    answerMap.set(parseInt(qId), answer);
  });

  // Calculate scores for each NIP
  const results = [];

  nipQuestions.forEach((nipQs, nipCode) => {
    let actualScore = 0;
    const totalQuestions = nipQs.length;
    const maxScore = totalQuestions * 3;

    nipQs.forEach(q => {
      const answer = answerMap.get(q.id);
      if (answer) {
        let score = answer.value;

        // Apply reverse scoring if needed
        if (q.reverseScored) {
          score = 3 - score; // 0->3, 1->2, 2->1, 3->0
        }

        actualScore += score;
      }
    });

    const percentage = (actualScore / maxScore) * 100;
    const nipDef = NIP_DEFINITIONS[nipCode];

    if (nipDef) {
      results.push({
        code: nipDef.code,
        name: nipDef.name,
        score: Math.round(percentage),
        actualScore,
        maxScore,
        totalQuestions
      });
    }
  });

  // Sort by percentage (highest first)
  return results.sort((a, b) => b.score - a.score);
}

async function fixNIP3AnalysisResults() {
  console.log('🔍 Fetching all completed NIP3 assessments...\n');

  // Fetch all completed responses with 344 questions (NIP3)
  const { data: responses, error } = await supabase
    .from('responses')
    .select('id, customer_name, customer_email, answers, analysis_results, completed_at')
    .eq('status', 'completed')
    .not('completed_at', 'is', null);

  if (error) {
    console.error('Error fetching responses:', error);
    process.exit(1);
  }

  // Filter to only NIP3 assessments (those with answers to questions in the NIP3 range)
  const nip3Responses = responses.filter(r => {
    if (!r.answers || typeof r.answers !== 'object') return false;
    const answerKeys = Object.keys(r.answers);
    // NIP3 has 343 questions (IDs 1-343)
    return answerKeys.length >= 300 && answerKeys.length <= 350;
  });

  console.log(`Found ${nip3Responses.length} NIP3 assessments to check\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const response of nip3Responses) {
    try {
      // Check if analysis_results exists and has neuralImprintPatternScores
      const hasCorrectAnalysis =
        response.analysis_results &&
        response.analysis_results.neuralImprintPatternScores &&
        Array.isArray(response.analysis_results.neuralImprintPatternScores) &&
        response.analysis_results.neuralImprintPatternScores.length === 20;

      if (hasCorrectAnalysis) {
        console.log(`✓ ${response.customer_name} - Already has correct analysis_results`);
        skipped++;
        continue;
      }

      console.log(`🔧 Fixing: ${response.customer_name} (${response.customer_email})`);

      // Recalculate using correct NIP3 scoring
      const nipResults = calculateNIPResults(response.answers, questions);

      const analysisResults = {
        completedAt: response.completed_at,
        overallScore: Math.round(nipResults.reduce((sum, nip) => sum + nip.score, 0) / nipResults.length),
        totalQuestions: questions.length,
        neuralImprintPatternScores: nipResults
      };

      // Update the database
      const { error: updateError } = await supabase
        .from('responses')
        .update({ analysis_results: analysisResults })
        .eq('id', response.id);

      if (updateError) {
        console.error(`  ✗ Error updating ${response.customer_name}:`, updateError.message);
        errors++;
      } else {
        console.log(`  ✓ Fixed! Overall score: ${analysisResults.overallScore}%`);
        fixed++;
      }

    } catch (err) {
      console.error(`  ✗ Error processing ${response.customer_name}:`, err.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  ✓ Fixed: ${fixed} assessments`);
  console.log(`  - Skipped (already correct): ${skipped} assessments`);
  console.log(`  ✗ Errors: ${errors} assessments`);
  console.log('='.repeat(60));
}

fixNIP3AnalysisResults().catch(console.error);
