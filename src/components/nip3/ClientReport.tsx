import React from 'react';
import './ClientReport.css';

// CLIENT REPORT COMPONENT - TYPESCRIPT VERSION
// Shows stacked bar chart and complete table of all 20 NIPs

interface NIPResult {
  nipGroup: string;
  score: number;
  maxScore: number;
  percentage: number;
  count: number;
}

interface ClientReportProps {
  results: NIPResult[];
  completionDate?: string;
}

interface NIPPattern {
  code: string;
  name: string;
  color: string;
  category: string;
  impact: 'Critical' | 'High' | 'Medium';
}

const ClientReport: React.FC<ClientReportProps> = ({ 
  results, 
  completionDate = "December 08, 2025" 
}) => {
  
  // NIP Pattern definitions
  const NIP_PATTERNS: Record<string, NIPPattern> = {
    'NIP01': { code: 'TRAP', name: 'Home/Work', color: '#FFB800', category: 'Environmental', impact: 'High' },
    'NIP02': { code: 'SHT', name: 'Shattered Worth', color: '#FF6B6B', category: 'Trauma', impact: 'Critical' },
    'NIP03': { code: 'ORG', name: 'Time & Order', color: '#DAA520', category: 'Executive Function', impact: 'High' },
    'NIP04': { code: 'NEGP', name: 'Unmet Needs', color: '#90C695', category: 'Developmental', impact: 'High' },
    'NIP05': { code: 'HYP', name: 'High Gear', color: '#B0B0E0', category: 'Arousal', impact: 'High' },
    'NIP06': { code: 'DOG', name: 'Dogmatic Chains', color: '#87CEEB', category: 'Cognitive', impact: 'Medium' },
    'NIP07': { code: 'IMP', name: 'Impulse Rush', color: '#FFD700', category: 'Impulse Control', impact: 'Medium' },
    'NIP08': { code: 'NUH', name: 'Numb Heart', color: '#FFB6C1', category: 'Emotional', impact: 'Critical' },
    'NIP09': { code: 'DIS', name: 'Mind In Distress', color: '#4A90E2', category: 'Mental Health', impact: 'Critical' },
    'NIP10': { code: 'ANG', name: 'Anchored Anger', color: '#DC143C', category: 'Emotional', impact: 'High' },
    'NIP11': { code: 'INFL', name: 'Inside Out', color: '#2C3E50', category: 'Locus of Control', impact: 'High' },
    'NIP12': { code: 'BULLY', name: 'Victim Loops', color: '#9370DB', category: 'Behavioral', impact: 'Medium' },
    'NIP13': { code: 'LACK', name: 'Lack State', color: '#696969', category: 'Scarcity Mindset', impact: 'Medium' },
    'NIP14': { code: 'DIM', name: 'Detail/Big Picture', color: '#B0C4DE', category: 'Attention', impact: 'Medium' },
    'NIP15': { code: 'FOC', name: 'Scatter Focus', color: '#CD5C5C', category: 'Attention', impact: 'High' },
    'NIP16': { code: 'RES', name: 'Attitude', color: '#9ACD32', category: 'Attitude', impact: 'Medium' },
    'NIP17': { code: 'INWF', name: 'Inward Focus', color: '#D2691E', category: 'Self-Perception', impact: 'Medium' },
    'NIP18': { code: 'CPL', name: 'Addictive Loops', color: '#DC143C', category: 'Addiction', impact: 'Critical' },
    'NIP19': { code: 'BURN', name: 'Burned Out', color: '#A9A9A9', category: 'Depletion', impact: 'High' },
    'NIP20': { code: 'DEC', name: 'Deceiver', color: '#4B0082', category: 'Interpersonal', impact: 'High' }
  };

  // Get impact badge styling
  const getImpactStyle = (impact: string): string => {
    const styles: Record<string, string> = {
      Critical: 'impact-critical',
      High: 'impact-high',
      Medium: 'impact-medium'
    };
    return styles[impact] || styles.Medium;
  };

  return (
    <div className="client-report">
      <div className="client-report-container">
        
        {/* Header */}
        <div className="report-header">
          <h1 className="report-title">🧠 Neural Imprint Patterns</h1>
          <p className="report-subtitle">Personal Assessment Report</p>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-value">344</div>
              <div className="stat-label">Questions Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value-date">{completionDate}</div>
              <div className="stat-label">Assessment Date</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">20</div>
              <div className="stat-label">NIP Categories</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="report-content">
          <h2 className="section-title">
            📊 Your Neural Imprint Pattern Scores
          </h2>

          {/* Stacked Bar Chart */}
          <div className="chart-section">
            <h3 className="chart-title">
              All 20 Neural Imprint Patterns - Percentage Scores
            </h3>
            <div className="bar-chart">
              {results.map((result) => {
                const nipInfo = NIP_PATTERNS[result.nipGroup];
                return (
                  <div key={result.nipGroup} className="bar-row">
                    <div className="bar-label">
                      {nipInfo.code} - {nipInfo.name}
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${result.percentage}%`, 
                          backgroundColor: nipInfo.color 
                        }}
                      >
                        <span className="bar-percentage">{result.percentage}%</span>
                      </div>
                    </div>
                    <div className="bar-score">
                      {result.score}/{result.maxScore}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Score Table */}
          <div className="table-section">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>NIP Code</th>
                  <th>Pattern Name</th>
                  <th>Category</th>
                  <th>Impact</th>
                  <th>Score</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
                  const nipInfo = NIP_PATTERNS[result.nipGroup];
                  return (
                    <tr key={result.nipGroup}>
                      <td><strong>#{index + 1}</strong></td>
                      <td className="nip-code">{nipInfo.code}</td>
                      <td>{nipInfo.name}</td>
                      <td>{nipInfo.category}</td>
                      <td>
                        <span className={`impact-badge ${getImpactStyle(nipInfo.impact)}`}>
                          {nipInfo.impact}
                        </span>
                      </td>
                      <td>{result.score}/{result.maxScore}</td>
                      <td className="percentage-col"><strong>{result.percentage}%</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Next Steps */}
          <div className="next-steps">
            <h2 className="next-steps-title">🎯 Next Steps</h2>
            <p className="next-steps-intro">
              This report shows your scores across all 20 Neural Imprint Pattern categories. Your highest-scoring 
              patterns (shown at the top) indicate areas where focused attention and specific interventions could 
              provide the most significant benefit.
            </p>
            <p className="top-patterns-label">Your Top 3 Patterns:</p>
            <ul className="top-patterns-list">
              {results.slice(0, 3).map((result, index) => {
                const nipInfo = NIP_PATTERNS[result.nipGroup];
                return (
                  <li key={result.nipGroup}>
                    {index + 1}. {nipInfo.name} - {result.percentage}%
                  </li>
                );
              })}
            </ul>
            <ul className="action-list">
              <li>
                <span className="checkmark">✓</span>
                <span>Review the detailed Coach Assessment Report for comprehensive analysis of all patterns</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span>Focus initial attention on your top 3-5 highest-scoring patterns</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span>Consider scheduling a consultation with a qualified mental health professional or coach</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span>Begin implementing small changes in your highest-scoring pattern areas</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span>Track your progress over time and consider reassessment in 3-6 months</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p className="footer-title">Neural Imprint Patterns™</p>
          <p className="footer-brand">Developed by BrainWorx™</p>
          <p className="footer-disclaimer">
            This report is confidential and intended for personal development purposes only.
          </p>
          <p className="footer-note">
            Not affiliated with any other commercial profiling system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientReport;
