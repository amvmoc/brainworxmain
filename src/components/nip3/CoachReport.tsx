import React from 'react';
import { getPatternDetails } from '../../data/nip3/patternDetails';
import './CoachReport.css';

// COACH REPORT COMPONENT - TYPESCRIPT VERSION
// Starts with SAME chart/table as client, then detailed analysis of ALL 20 NIPs

interface NIPResult {
  nipGroup: string;
  score: number;
  maxScore: number;
  percentage: number;
  count: number;
}

interface CoachReportProps {
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

const CoachReport: React.FC<CoachReportProps> = ({ 
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
    <div className="coach-report">
      <div className="coach-report-container">
        
        {/* Header */}
        <div className="report-header">
          <h1 className="report-title">🧠 Neural Imprint Patterns</h1>
          <p className="report-subtitle">Comprehensive Coach Assessment Report</p>
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
            📊 Client Neural Imprint Pattern Scores
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
                  <th>Questions</th>
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
                      <td>{result.count}</td>
                      <td>{result.score}/{result.maxScore}</td>
                      <td className="percentage-col"><strong>{result.percentage}%</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clinical Analysis Section */}
          <div className="clinical-analysis">
            <h2 className="analysis-title">
              🎯 Detailed Clinical Analysis - All 20 Patterns
            </h2>
            <p className="analysis-intro">
              This section provides comprehensive clinical analysis of all 20 Neural Imprint Pattern 
              categories. Each pattern includes detailed clinical description, typical manifestations, root causes and 
              development, five evidence-based interventions, and personalized coaching notes based on this client's 
              specific scores. This report is designed to support a thorough 45-minute coaching or clinical session.
            </p>

            {/* All 20 Pattern Details */}
            <div className="pattern-details">
              {results.map((result, index) => {
                const nipInfo = NIP_PATTERNS[result.nipGroup];
                const details = getPatternDetails(result.nipGroup, result.percentage);
                
                return (
                  <div 
                    key={result.nipGroup} 
                    className="pattern-card"
                    style={{ borderLeftColor: nipInfo.color }}
                  >
                    {/* Pattern Header */}
                    <div className="pattern-header">
                      <div className="pattern-info">
                        <h3 className="pattern-title">
                          #{index + 1}. {nipInfo.code} - {nipInfo.name}
                        </h3>
                        <div className="pattern-badges">
                          <span className="category-badge">
                            {nipInfo.category}
                          </span>
                          <span className={`impact-badge ${getImpactStyle(nipInfo.impact)}`}>
                            {nipInfo.impact} Impact
                          </span>
                          <span className="questions-badge">
                            {result.count} Questions
                          </span>
                        </div>
                      </div>
                      <div className="pattern-score-box">
                        <div className="score-percentage">{result.percentage}%</div>
                        <div className="score-details">{result.score}/{result.maxScore} points</div>
                      </div>
                    </div>

                    {/* Clinical Description */}
                    <div className="pattern-section">
                      <h4 className="section-heading">📋 Clinical Description</h4>
                      <p className="section-text">{details.description}</p>
                    </div>

                    {/* Typical Manifestations */}
                    <div className="pattern-section">
                      <h4 className="section-heading">🔍 Typical Manifestations</h4>
                      <p className="section-text">{details.manifestations}</p>
                    </div>

                    {/* Root Causes & Development */}
                    <div className="pattern-section">
                      <h4 className="section-heading">🌱 Root Causes & Development</h4>
                      <p className="section-text">{details.causes}</p>
                    </div>

                    {/* Evidence-Based Interventions */}
                    <div className="pattern-section">
                      <h4 className="section-heading">💊 Evidence-Based Interventions</h4>
                      <ul className="intervention-list">
                        {details.interventions.map((intervention, idx) => (
                          <li key={idx} className="intervention-item">
                            {intervention}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Coaching Notes */}
                    <div className="coaching-notes">
                      <p>
                        <strong>💡 Coaching Notes:</strong> {details.notes}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p className="footer-title">Neural Imprint Patterns™</p>
          <p className="footer-brand">Developed by BrainWorx™ • Comprehensive 45-Minute Coach Assessment</p>
          <p className="footer-disclaimer">
            This report is confidential and intended for professional coaching and clinical use only.
          </p>
          <p className="footer-details">
            Assessment completed on {completionDate} | All 20 NIP categories with complete clinical analysis
          </p>
          <p className="footer-copyright">
            © BrainWorx™ • All Rights Reserved • Not affiliated with any other commercial profiling system
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoachReport;
