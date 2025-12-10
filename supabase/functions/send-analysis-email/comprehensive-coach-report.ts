export function generateComprehensiveCoachReport(
  customerName: string,
  customerEmail: string,
  franchiseOwnerName: string | undefined,
  analysis: any,
  resultsUrl: string,
  bookingUrl: string,
  siteUrl: string
): string {
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const neuralPatterns = analysis.neuralImprintPatternScores || [];
  const sortedPatterns = [...neuralPatterns].sort((a, b) => b.score - a.score);
  const highPriorityPatterns = sortedPatterns.filter(p => p.score >= 60);
  const mediumPriorityPatterns = sortedPatterns.filter(p => p.score >= 40 && p.score < 60);
  const lowPriorityPatterns = sortedPatterns.filter(p => p.score < 40);

  const getScoreClass = (score: number) => {
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const generateBarChart = () => {
    return sortedPatterns.map(pattern => `
      <div class="bar-item">
        <div class="bar-label">
          <span>${pattern.code}</span>
          <span>${pattern.score}%</span>
        </div>
        <div class="bar-container">
          <div class="bar-fill ${getScoreClass(pattern.score)}" style="width: ${pattern.score}%">
            ${pattern.score}%
          </div>
        </div>
      </div>
    `).join('');
  };

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Coach Report - ${customerName}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; }body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }.container { max-width: 1200px; margin: 0 auto; background: white; }.section { padding: 40px; }h2 { color: #667eea; margin-bottom: 20px; }.bar-chart { margin: 20px 0; }.bar-item { margin-bottom: 15px; }.bar-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: 600; }.bar-container { height: 30px; background: #e0e0e0; border-radius: 15px; overflow: hidden; }.bar-fill { height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-weight: 600; }.bar-fill.high { background: linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%); }.bar-fill.medium { background: linear-gradient(90deg, #ffa500 0%, #ff8c00 100%); }.bar-fill.low { background: linear-gradient(90deg, #4a90e2 0%, #357abd 100%); }</style></head><body><div class="container"><div class="section"><h2>Comprehensive Coach Report</h2><p><strong>Client:</strong> ${customerName}</p><p><strong>Email:</strong> ${customerEmail}</p><p><strong>Date:</strong> ${completionDate}</p><p><strong>High Priority:</strong> ${highPriorityPatterns.length} patterns</p><p><strong>Medium Priority:</strong> ${mediumPriorityPatterns.length} patterns</p><p><strong>Low Concern:</strong> ${lowPriorityPatterns.length} patterns</p><h3>Scoring Overview</h3><div class="bar-chart">${generateBarChart()}</div><p><strong>Results Link:</strong> <a href="${resultsUrl}">${resultsUrl}</a></p></div></div></body></html>`;
}
