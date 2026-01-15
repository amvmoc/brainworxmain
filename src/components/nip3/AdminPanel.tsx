import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

interface AdminPanelProps {
  onClose: () => void;
}

interface StoredResult {
  completedAt: string;
  totalQuestions: number;
  overallPercentage: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<StoredResult[]>([]);

  const ADMIN_PASSWORD = 'nip2025'; // Change this in production!

  useEffect(() => {
    if (isAuthenticated) {
      loadResults();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const loadResults = () => {
    const stored = localStorage.getItem('assessment-results');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setResults([data]);
      } catch (e) {
        console.error('Failed to load results:', e);
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all assessment data? This cannot be undone.')) {
      localStorage.removeItem('assessment-progress');
      localStorage.removeItem('assessment-results');
      setResults([]);
      alert('All data cleared');
    }
  };

  const handleExportAll = () => {
    const allData = {
      progress: localStorage.getItem('assessment-progress'),
      results: localStorage.getItem('assessment-results'),
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nip-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content admin-login" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <h2>Admin Panel</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-password-input"
              autoFocus
            />
            <button type="submit" className="admin-login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>🔧 Admin Panel</h2>

        <div className="admin-section">
          <h3>Stored Data</h3>
          {results.length > 0 ? (
            <div className="admin-results">
              <p><strong>Assessment Completed:</strong> {new Date(results[0].completedAt).toLocaleString()}</p>
              <p><strong>Total Questions:</strong> {results[0].totalQuestions}</p>
              <p><strong>Overall Score:</strong> {results[0].overallPercentage.toFixed(1)}%</p>
            </div>
          ) : (
            <p>No completed assessments found</p>
          )}
        </div>

        <div className="admin-section">
          <h3>Data Management</h3>
          <div className="admin-actions">
            <button 
              className="admin-button export"
              onClick={handleExportAll}
            >
              📤 Export All Data
            </button>
            <button 
              className="admin-button danger"
              onClick={handleClearData}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h3>System Info</h3>
          <div className="system-info">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Total Questions:</strong> 344</p>
            <p><strong>NIP Patterns:</strong> 20</p>
            <p><strong>Storage:</strong> LocalStorage</p>
          </div>
        </div>
      </div>
    </div>
  );
};
