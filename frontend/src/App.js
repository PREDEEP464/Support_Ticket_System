import React, { useState } from 'react';
import TicketForm from './TicketForm';
import TicketList from './TicketList';
import StatsDashboard from './StatsDashboard';
import './index.css';

function App() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleTicketCreated = () => {
    // Trigger refresh for both stats and ticket list
    setRefreshCounter(prev => prev + 1);
  };

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
            <div className="header-badge">
              <span className="status-indicator"></span>
              <span className="status-text">System Online</span>
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
    </div>
    </div>
  );
}

export default App;
