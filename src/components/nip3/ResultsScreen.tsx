import React from 'react';
import { useAssessment } from './AssessmentContext';
import { Mail, CheckCircle, FileText, Clock } from 'lucide-react';
import './ResultsScreen.css';

interface ResultsScreenProps {
  onRestart: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ onRestart }) => {
  const { results, email, customerName } = useAssessment();

  if (!results) {
    return <div>Loading results...</div>;
  }

  const completionDate = results.completedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="results-screen">
      <div className="results-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="results-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={48} color="white" />
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#0A2A5E',
            marginBottom: '12px'
          }}>
            Assessment Complete!
          </h2>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>
            Thank you, {customerName || 'valued client'}
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Completed on {completionDate}
          </p>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Mail size={24} color="#3b82f6" />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#0A2A5E', margin: 0 }}>
              Your Reports Are On The Way
            </h3>
          </div>

          <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
            We've sent your comprehensive Neural Imprint Pattern analysis to:
          </p>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="#64748b" />
              <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: '500' }}>
                {email}
              </span>
            </div>
          </div>

          <div style={{
            borderLeft: '3px solid #3b82f6',
            paddingLeft: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
              <FileText size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  Client Report (PDF)
                </h4>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Your personal assessment with visual charts, score tables, and actionable insights
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde047',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            gap: '12px'
          }}>
            <Clock size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '14px', color: '#92400e', margin: 0, lineHeight: '1.5' }}>
                <strong>Please allow 5-10 minutes</strong> for the email to arrive. Check your spam folder if you don't see it in your inbox.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '2px solid #e0f2fe',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#0A2A5E', marginBottom: '16px' }}>
            What Happens Next?
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <span style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>1</span>
              <span style={{ fontSize: '15px', color: '#475569', paddingTop: '2px' }}>
                Review your client report to understand your neural imprint patterns
              </span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <span style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>2</span>
              <span style={{ fontSize: '15px', color: '#475569', paddingTop: '2px' }}>
                Your coach will receive a comprehensive analysis report
              </span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <span style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>3</span>
              <span style={{ fontSize: '15px', color: '#475569', paddingTop: '2px' }}>
                Your coach will reach out to schedule a debrief session to discuss your results
              </span>
            </li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onRestart}
            style={{
              background: 'white',
              border: '2px solid #e2e8f0',
              color: '#64748b',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = 'white';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
