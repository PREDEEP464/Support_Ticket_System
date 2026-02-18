import React, { useState, useEffect } from 'react';
import TicketForm from './TicketForm';
import TicketList from './TicketList';
import StatsDashboard from './StatsDashboard';
import './index.css';

function App() {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleTicketCreated = () => {
    // Trigger refresh for both stats and ticket list
    setRefreshCounter(prev => prev + 1);
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-content">
          <div className="loading-logo">🎫</div>
          <h1 className="loading-title">Support Ticket System</h1>
          <div className="loading-spinner-large"></div>
          <p className="loading-text">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div className="container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">🎫</div>
              <div>
                <h1 className="app-title">Support Ticket System</h1>
                <p className="app-subtitle">
                  🚀 Enterprise ticket management with intelligent classification
                </p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="how-it-works-btn"
                onClick={() => setShowHowItWorks(true)}
              >
                ❓ How It Works
              </button>
              <div className="header-badge">
                <span className="status-indicator"></span>
                <span className="status-text">System Online</span>
              </div>
            </div>
          </div>
        </header>

      {/* Statistics Dashboard */}
      <StatsDashboard refreshTrigger={refreshCounter} />

      {/* Create New Ticket Form */}
      <TicketForm onTicketCreated={handleTicketCreated} />

      {/* Ticket List with Filters */}
      <TicketList refreshTrigger={refreshCounter} />

      <footer className="app-footer">
        <div className="footer-content">
          <p>Support Ticket System © 2026</p>
          <p className="tech-stack">Built with Django • React • PostgreSQL</p>
        </div>
      </footer>
      
      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-content how-it-works-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚀 How It Works</h2>
              <button className="modal-close" onClick={() => setShowHowItWorks(false)}>✕</button>
            </div>
            
            <div className="how-it-works-content">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>📝 Submit a Ticket</h3>
                  <p>Fill in the title and description of your issue. Our system will automatically analyze your description.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>🤖 Smart Classification</h3>
                  <p>The system automatically suggests the best category and priority based on your description using intelligent analysis.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>🔍 Track & Filter</h3>
                  <p>View all your tickets, filter by category/priority/status, and search through titles and descriptions.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>📊 Monitor Progress</h3>
                  <p>Check real-time statistics and update ticket status from Open → In Progress → Resolved → Closed.</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="primary-button" onClick={() => setShowHowItWorks(false)}>
                Got it! ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default App;
