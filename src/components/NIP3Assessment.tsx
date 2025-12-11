import React, { useState } from 'react';
import { AssessmentProvider } from './nip3/AssessmentContext';
import { WelcomeScreen } from './nip3/WelcomeScreen';
import { QuestionScreen } from './nip3/QuestionScreen';
import { ProgressBar } from './nip3/ProgressBar';
import { ResultsScreen } from './nip3/ResultsScreen';
import { AdminPanel } from './nip3/AdminPanel';
import './nip3/NIP3Assessment.css';

type AppScreen = 'welcome' | 'assessment' | 'results' | 'admin';

interface NIP3AssessmentProps {
  onClose?: () => void;
  email?: string;
  customerName?: string;
  franchiseOwnerId?: string | null;
  couponId?: string | null;
}

export default function NIP3Assessment({
  onClose,
  email,
  customerName,
  franchiseOwnerId,
  couponId
}: NIP3AssessmentProps) {
  // Start directly at assessment if user has email/name (from coupon or coach link)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(
    email && customerName ? 'assessment' : 'welcome'
  );
  const [showAdmin, setShowAdmin] = useState(false);

  const handleStart = () => {
    setCurrentScreen('assessment');
  };

  const handleComplete = () => {
    setCurrentScreen('results');
  };

  const handleRestart = () => {
    setCurrentScreen('welcome');
  };

  const toggleAdmin = () => {
    setShowAdmin(!showAdmin);
  };

  return (
    <AssessmentProvider
      initialEmail={email}
      initialCustomerName={customerName}
      initialFranchiseOwnerId={franchiseOwnerId}
      initialCouponId={couponId}
    >
      <div className="app nip3-container">
        <header className="app-header">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <h1>Neural Imprint Patterns Assessment</h1>
                <p className="tagline">Discover Your Unconscious Patterns</p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="close-button"
                  aria-label="Close assessment"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            {currentScreen === 'assessment' && <ProgressBar />}

            {currentScreen === 'welcome' && (
              <WelcomeScreen onStart={handleStart} />
            )}

            {currentScreen === 'assessment' && (
              <QuestionScreen onComplete={handleComplete} />
            )}

            {currentScreen === 'results' && (
              <ResultsScreen onRestart={handleRestart} />
            )}

            {showAdmin && <AdminPanel onClose={toggleAdmin} />}
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <div className="footer-content">
              <p>&copy; 2025 Neural Imprint Patterns Assessment. All rights reserved.</p>
              <button
                onClick={toggleAdmin}
                className="admin-toggle"
                aria-label="Toggle admin panel"
              >
                ⚙️
              </button>
            </div>
          </div>
        </footer>
      </div>
    </AssessmentProvider>
  );
}
