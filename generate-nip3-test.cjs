const fs = require('fs');
const path = require('path');

const questionsData = require('./src/data/nip3/questions.json');
const questions = questionsData.questions;

const NIP_DEFINITIONS = {
  NIP01: { code: 'NIP01', name: 'TRAP - Home/Work Environment', shortName: 'Home/Work' },
  NIP02: { code: 'NIP02', name: 'SHT - Shattered Worth', shortName: 'Shattered Worth' },
  NIP03: { code: 'NIP03', name: 'ORG - Time & Order', shortName: 'Time & Order' },
  NIP04: { code: 'NIP04', name: 'NEGP - Unmet Needs (Parenting)', shortName: 'Unmet Needs' },
  NIP05: { code: 'NIP05', name: 'HYP - High Gear (Hyperarousal)', shortName: 'High Gear' },
  NIP06: { code: 'NIP06', name: 'DOG - Dogmatic Chains', shortName: 'Dogmatic' },
  NIP07: { code: 'NIP07', name: 'IMP - Impulse Rush', shortName: 'Impulse' },
  NIP08: { code: 'NIP08', name: 'NUH - Numb Heart', shortName: 'Numb Heart' },
  NIP09: { code: 'NIP09', name: 'DIS - Mind In Distress', shortName: 'Distress' },
  NIP10: { code: 'NIP10', name: 'ANG - Anchored Anger', shortName: 'Anger' },
  NIP11: { code: 'NIP11', name: 'INFL - Inside Out (Locus of Control)', shortName: 'Locus Control' },
  NIP12: { code: 'NIP12', name: 'BULLY - Victim Loops', shortName: 'Victim' },
  NIP13: { code: 'NIP13', name: 'LACK - Lack State', shortName: 'Lack' },
  NIP14: { code: 'NIP14', name: 'DIM - Left/Right Brain', shortName: 'Thinking Style' },
  NIP15: { code: 'NIP15', name: 'FOC - Scatter Focus', shortName: 'Scatter Focus' },
  NIP16: { code: 'NIP16', name: 'RES - Attitude (Resistance)', shortName: 'Resistance' },
  NIP17: { code: 'NIP17', name: 'INWF - Inward Focus (Narcissism)', shortName: 'Narcissism' },
  NIP18: { code: 'NIP18', name: 'CPL - Addictive Loops', shortName: 'Addiction' },
  NIP19: { code: 'NIP19', name: 'BURN - Burned Out', shortName: 'Burnout' },
  NIP20: { code: 'NIP20', name: 'DEC - Deceiver', shortName: 'Deception' }
};

const ANSWER_OPTIONS = [
  { label: 'Not at all true of me', value: 0 },
  { label: 'A little true of me', value: 1 },
  { label: 'Often true of me', value: 2 },
  { label: 'Completely true of me', value: 3 }
];

function generateRandomAnswers() {
  const answers = [];
  questions.forEach(question => {
    const randomIndex = Math.floor(Math.random() * 4);
    const answerOption = ANSWER_OPTIONS[randomIndex];
    answers.push({
      questionId: question.id,
      value: answerOption.value,
      option: answerOption.label
    });
  });
  return answers;
}

function calculateNIPResults(answers) {
  const nipQuestions = new Map();
  questions.forEach(q => {
    if (!nipQuestions.has(q.nipCode)) {
      nipQuestions.set(q.nipCode, []);
    }
    nipQuestions.get(q.nipCode).push(q);
  });

  const answerMap = new Map();
  answers.forEach(a => answerMap.set(a.questionId, a));

  const results = [];

  nipQuestions.forEach((nipQs, nipCode) => {
    let actualScore = 0;
    const totalQuestions = nipQs.length;
    const maxScore = totalQuestions * 3;

    nipQs.forEach(q => {
      const answer = answerMap.get(q.id);
      if (answer) {
        let score = answer.value;
        if (q.reverseScored) {
          score = 3 - score;
        }
        actualScore += score;
      }
    });

    const percentage = (actualScore / maxScore) * 100;

    let level;
    if (percentage >= 70) level = 'Strongly Present';
    else if (percentage >= 50) level = 'Moderately Present';
    else if (percentage >= 30) level = 'Mild Pattern';
    else level = 'Minimal Pattern';

    const nipDef = NIP_DEFINITIONS[nipCode];
    results.push({
      code: nipCode,
      name: nipDef.name,
      shortName: nipDef.shortName,
      totalQuestions,
      actualScore,
      maxScore,
      percentage: parseFloat(percentage.toFixed(2)),
      level
    });
  });

  return results.sort((a, b) => b.percentage - a.percentage);
}

function generateHTMLReport(results, completedAt) {
  const topPatterns = results.filter(r => r.percentage >= 50);
  const overallPercentage = (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2);

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NIP3 Assessment Results - Test Simulation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #3b82f6; }
    .header h1 { font-size: 32px; color: #1f2937; margin-bottom: 10px; }
    .header p { color: #6b7280; font-size: 16px; }
    .test-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 30px; border-radius: 6px; }
    .test-notice strong { color: #92400e; }
    .summary { background: #eff6ff; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
    .summary h2 { color: #1e40af; margin-bottom: 15px; font-size: 24px; }
    .stat { display: inline-block; margin-right: 30px; margin-bottom: 15px; }
    .stat-label { font-size: 14px; color: #6b7280; display: block; }
    .stat-value { font-size: 28px; font-weight: bold; color: #1e40af; }
    .priority-section { margin-bottom: 40px; }
    .priority-section h2 { color: #dc2626; font-size: 24px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #fee2e2; }
    .pattern-card { background: white; border: 2px solid #fee2e2; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
    .pattern-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .pattern-name { font-size: 18px; font-weight: bold; color: #991b1b; }
    .pattern-percentage { font-size: 24px; font-weight: bold; color: #dc2626; }
    .pattern-level { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 5px; }
    .level-strongly { background: #fee2e2; color: #991b1b; }
    .level-moderately { background: #fef3c7; color: #92400e; }
    .level-mild { background: #dbeafe; color: #1e40af; }
    .level-minimal { background: #f3f4f6; color: #4b5563; }
    .results-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    .results-table th { background: #3b82f6; color: white; padding: 12px; text-align: left; font-weight: 600; }
    .results-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .results-table tr:hover { background: #f9fafb; }
    .progress-bar { background: #e5e7eb; height: 24px; border-radius: 12px; overflow: hidden; margin-top: 8px; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-size: 12px; font-weight: 600; transition: width 0.3s; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Neural Imprint Patterns Assessment</h1>
      <p>Complete Analysis Report - 343 Questions, 20 Patterns</p>
      <p style="margin-top: 10px;"><strong>Completed:</strong> ${completedAt}</p>
    </div>

    <div class="test-notice">
      <strong>⚠️ TEST SIMULATION:</strong> This report was generated using randomly selected answers for demonstration purposes.
    </div>

    <div class="summary">
      <h2>📊 Executive Summary</h2>
      <div class="stat">
        <span class="stat-label">Total Questions</span>
        <span class="stat-value">343</span>
      </div>
      <div class="stat">
        <span class="stat-label">Patterns Analyzed</span>
        <span class="stat-value">20</span>
      </div>
      <div class="stat">
        <span class="stat-label">Overall Score</span>
        <span class="stat-value">${overallPercentage}%</span>
      </div>
      <div class="stat">
        <span class="stat-label">Priority Patterns</span>
        <span class="stat-value">${topPatterns.length}</span>
      </div>
    </div>

    ${topPatterns.length > 0 ? `
    <div class="priority-section">
      <h2>🎯 Priority Patterns (≥50%)</h2>
      <p style="color: #6b7280; margin-bottom: 20px;">These patterns show moderate to strong presence and should receive focused attention:</p>
      ${topPatterns.map(pattern => `
        <div class="pattern-card">
          <div class="pattern-header">
            <div>
              <div class="pattern-name">${pattern.name}</div>
              <span class="pattern-level level-${pattern.level.toLowerCase().replace(' ', '')}">${pattern.level}</span>
            </div>
            <div class="pattern-percentage">${pattern.percentage}%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${pattern.percentage}%">${pattern.percentage}%</div>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
            Score: ${pattern.actualScore} / ${pattern.maxScore} (${pattern.totalQuestions} questions)
          </p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; margin-top: 40px;">📋 Complete NIP Analysis</h2>
    <table class="results-table">
      <thead>
        <tr>
          <th>NIP Code</th>
          <th>Pattern Name</th>
          <th>Questions</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td><strong>${r.code}</strong></td>
            <td>${r.name}</td>
            <td>${r.totalQuestions}</td>
            <td>${r.actualScore} / ${r.maxScore}</td>
            <td>
              <div class="progress-bar" style="margin: 0;">
                <div class="progress-fill" style="width: ${r.percentage}%">${r.percentage}%</div>
              </div>
            </td>
            <td>
              <span class="pattern-level level-${r.level.toLowerCase().replace(' ', '')}">${r.level}</span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>&copy; 2025 Neural Imprint Patterns Assessment. All rights reserved.</p>
      <p style="margin-top: 5px;">This is a test simulation with randomly generated responses.</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

console.log('🧪 Starting NIP3 Test Simulation...\n');
console.log(`📋 Total Questions: ${questions.length}`);

console.log('🎲 Generating random answers...');
const answers = generateRandomAnswers();
console.log(`✅ Generated ${answers.length} answers\n`);

console.log('📊 Calculating NIP results...');
const results = calculateNIPResults(answers);
console.log(`✅ Calculated ${results.length} NIP patterns\n`);

console.log('🎯 Top 5 Patterns:');
results.slice(0, 5).forEach((r, i) => {
  console.log(`${i + 1}. ${r.name}: ${r.percentage}% (${r.level})`);
});

const completedAt = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

console.log('\n📄 Generating HTML report...');
const htmlReport = generateHTMLReport(results, completedAt);

const reportPath = path.join(__dirname, 'nip3-test-results.html');
fs.writeFileSync(reportPath, htmlReport);
console.log(`✅ Report saved to: ${reportPath}`);

const emailResults = {
  answers,
  results,
  completedAt,
  overallPercentage: (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2),
  htmlReport
};

const jsonPath = path.join(__dirname, 'nip3-test-results.json');
fs.writeFileSync(jsonPath, JSON.stringify(emailResults, null, 2));
console.log(`✅ JSON results saved to: ${jsonPath}`);

console.log('\n✨ Simulation complete!');

module.exports = emailResults;
