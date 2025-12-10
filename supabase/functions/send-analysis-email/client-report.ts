export function generateClientReport(
  customerName: string,
  customerEmail: string,
  franchiseOwnerEmail: string | undefined,
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

  const getScoreClass = (score: number) => {
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const generateBarChart = () => {
    return sortedPatterns.map(pattern => `
      <div class="bar-item">
        <div class="bar-label">${pattern.code}</div>
        <div class="bar-container">
          <div class="bar-fill ${getScoreClass(pattern.score)}" style="width: ${pattern.score}%">${pattern.score}%</div>
        </div>
        <div class="bar-value">${pattern.score}%</div>
      </div>
    `).join('');
  };

  const contactEmail = franchiseOwnerEmail || 'info@brainworx.co.za';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Neural Imprint Patterns Report - ${customerName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }

            .container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .copyright-notice {
                background: #f8f9fa;
                padding: 10px 30px;
                text-align: center;
                font-size: 0.85em;
                color: #666;
                border-bottom: 1px solid #e0e0e0;
            }

            .header {
                background: white;
                color: #333;
                padding: 30px;
                text-align: center;
                border-bottom: 3px solid #667eea;
            }

            .header h1 {
                font-size: 2.2em;
                margin-bottom: 10px;
                color: #667eea;
                margin-top: 20px;
            }

            .header p {
                font-size: 1.1em;
                color: #666;
            }

            .content {
                padding: 40px 30px;
            }

            .user-info-box {
                background: white;
                border: 2px solid #667eea;
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 25px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            .user-info-box h3 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 1.4em;
            }

            .user-info-box p {
                color: #333;
                font-size: 1.1em;
                margin: 8px 0;
            }

            .user-info-box strong {
                color: #667eea;
                font-weight: 600;
            }

            .results-summary {
                background: linear-gradient(135deg, #e8f4f8 0%, #d4e6f1 100%);
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 30px;
            }

            .results-summary h2 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 1.8em;
            }

            .results-summary p {
                color: #555;
                line-height: 1.8;
                font-size: 1.05em;
                margin-bottom: 15px;
            }

            .booking-info {
                background: #fff3cd;
                border: 2px solid #ffc107;
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }

            .booking-info h3 {
                color: #856404;
                margin-bottom: 10px;
                font-size: 1.3em;
            }

            .booking-info p {
                color: #856404;
                margin-bottom: 10px;
            }

            .booking-info ul {
                margin-left: 20px;
                color: #856404;
            }

            .booking-info li {
                margin-bottom: 8px;
            }

            .chart-container {
                background: white;
                border-radius: 15px;
                padding: 30px;
                margin-top: 30px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }

            .chart-title {
                text-align: center;
                font-size: 1.6em;
                color: #333;
                margin-bottom: 30px;
                font-weight: 600;
            }

            .bar-chart {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .bar-item {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .bar-label {
                min-width: 120px;
                font-weight: 600;
                color: #333;
                font-size: 0.95em;
            }

            .bar-container {
                flex: 1;
                height: 40px;
                background: #f0f0f0;
                border-radius: 8px;
                position: relative;
                overflow: hidden;
            }

            .bar-fill {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding-right: 10px;
                color: white;
                font-weight: 600;
                border-radius: 8px;
            }

            .bar-fill.high {
                background: linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%);
            }

            .bar-fill.medium {
                background: linear-gradient(90deg, #ffa500 0%, #ff8c00 100%);
            }

            .bar-fill.low {
                background: linear-gradient(90deg, #4a90e2 0%, #357abd 100%);
            }

            .bar-value {
                min-width: 60px;
                text-align: right;
                font-weight: 600;
                color: #667eea;
                font-size: 1.1em;
            }

            .legend {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 25px;
                padding-top: 25px;
                border-top: 2px solid #e0e0e0;
                flex-wrap: wrap;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .legend-color {
                width: 20px;
                height: 20px;
                border-radius: 4px;
            }

            .legend-color.high {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            }

            .legend-color.medium {
                background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
            }

            .legend-color.low {
                background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
            }

            .confidential-notice {
                text-align: center;
                color: #999;
                font-size: 0.9em;
                margin-top: 30px;
                font-style: italic;
                padding: 20px;
            }

            .report-date {
                text-align: center;
                color: #666;
                font-size: 0.95em;
                margin-top: 10px;
            }

            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 15px 40px;
                font-size: 1.1em;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
            }

            @media (max-width: 768px) {
                .bar-label {
                    min-width: 80px;
                    font-size: 0.85em;
                }

                .legend {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="copyright-notice">
                © All copyrights of this program belong to BrainWorx™ | All information is confidential
            </div>

            <div class="header">
                <h1>Neural Imprint Patterns™</h1>
                <p>Professional Assessment Report</p>
            </div>

            <div class="content">
                <!-- User Information -->
                <div class="user-info-box">
                    <h3>📋 Assessment Report</h3>
                    <p><strong>Name:</strong> ${customerName}</p>
                    <p><strong>Email:</strong> ${customerEmail}</p>
                    <p class="report-date">Report Date: ${completionDate}</p>
                </div>

                <!-- Results Summary -->
                <div class="results-summary">
                    <h2>🎯 Your Neural Imprint Profile</h2>
                    <p>
                        Your assessment is complete! Below is your scoring graph showing your results across all ${neuralPatterns.length} Neural Imprint Patterns.
                    </p>

                    <div class="booking-info">
                        <h3>📅 Next Step: Book Your Coaching Session</h3>
                        <p>
                            To receive your <strong>comprehensive in-depth analysis</strong> including:
                        </p>
                        <ul>
                            <li>Detailed interpretation of your results</li>
                            <li>Personalized insights and recommendations</li>
                            <li>Strategies for resolution and growth</li>
                            <li>Advanced analytical graphs and charts</li>
                            <li>One-on-one professional guidance</li>
                        </ul>
                        <p style="font-weight: 600;">
                            Please contact BrainWorx at <span style="color: #667eea;">${contactEmail}</span> to schedule your <strong style="color: #28a745;">FREE</strong> 45-minute coaching session (included in your assessment).
                        </p>
                        ${bookingUrl !== siteUrl ? `
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="${bookingUrl}" class="cta-button">
                                📅 Book Your Session Now
                            </a>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Scoring Chart -->
                <div class="chart-container">
                    <h3 class="chart-title">Neural Imprint Patterns - Scoring Overview</h3>
                    <div class="bar-chart">
                        ${generateBarChart()}
                    </div>

                    <!-- Legend -->
                    <div class="legend">
                        <div class="legend-item">
                            <div class="legend-color high"></div>
                            <span><strong>High (60-100%)</strong> - Significant presence</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color medium"></div>
                            <span><strong>Medium (40-59%)</strong> - Moderate presence</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color low"></div>
                            <span><strong>Low (0-39%)</strong> - Minimal presence</span>
                        </div>
                    </div>
                </div>

                ${resultsUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resultsUrl}" class="cta-button">
                        📊 View Full Results Online
                    </a>
                </div>
                ` : ''}

                <div style="background: #f8f9fa; border-top: 2px solid #e0e0e0; padding: 20px; margin-top: 30px; border-radius: 10px;">
                    <p style="font-size: 0.9em; color: #666; text-align: center; line-height: 1.7; font-style: italic;">
                        <strong>Disclaimer:</strong> This assessment is for informational purposes only and is not a diagnostic tool. It does not replace professional psychological or medical evaluation. Consult qualified healthcare providers for mental health concerns.
                    </p>
                </div>

                <div class="confidential-notice">
                    This report is confidential and prepared for <strong>${customerName}</strong>. All copyrights belong to BrainWorx™
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}
