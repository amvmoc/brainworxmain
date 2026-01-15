import React from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="version-badge" style={{
          display: 'inline-block',
          backgroundColor: '#3DB3E3',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '16px',
          letterSpacing: '1px'
        }}>
          NIP
        </div>
        <h2>Welcome to the Neural Imprint Patterns Assessment</h2>
        
        <div className="intro-section">
          <p className="intro-text">
            This comprehensive 344-question assessment will help you understand the unconscious patterns 
            that shape your thoughts, feelings, and behaviors. Your results will provide personalized 
            insights and recommendations for growth.
          </p>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">⏱️</div>
            <h3>Time Required</h3>
            <p>Approximately 45-60 minutes</p>
          </div>

          <div className="info-card">
            <div className="info-icon">📊</div>
            <h3>344 Questions</h3>
            <p>Covering 20 Neural Imprint Patterns</p>
          </div>

          <div className="info-card">
            <div className="info-icon">💾</div>
            <h3>Auto-Save</h3>
            <p>Progress saved automatically</p>
          </div>

          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>Personalized Results</h3>
            <p>Detailed analysis and recommendations</p>
          </div>
        </div>

        <div className="instructions">
          <h3>Instructions</h3>
          <ul>
            <li>Read each statement carefully</li>
            <li>Answer honestly based on your actual experience, not how you wish to be</li>
            <li>Select one of four options for each question:
              <ul>
                <li><strong>Not at all true of me</strong> - This doesn't apply to you</li>
                <li><strong>A little true of me</strong> - This applies sometimes or in small ways</li>
                <li><strong>Often true of me</strong> - This applies regularly or significantly</li>
                <li><strong>Completely true of me</strong> - This describes you very accurately</li>
              </ul>
            </li>
            <li>There are no "right" or "wrong" answers</li>
            <li>Your first instinct is usually most accurate</li>
            <li>Take breaks as needed - your progress is saved</li>
          </ul>
        </div>

        <div className="privacy-note">
          <h3>🔒 Privacy & Confidentiality</h3>
          <p>
            Your responses are stored locally in your browser and are completely confidential. 
            No data is transmitted to external servers without your explicit consent.
          </p>
        </div>

        <button 
          className="start-button" 
          onClick={onStart}
        >
          Begin Assessment
        </button>

        <p className="disclaimer">
          <small>
            This assessment is for educational and self-discovery purposes only. It is not a diagnostic 
            tool and should not replace professional mental health care. If you're experiencing mental 
            health concerns, please consult a licensed professional.
          </small>
        </p>
      </div>
    </div>
  );
};
