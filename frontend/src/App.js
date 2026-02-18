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
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Support Ticket System</h1>
        <p style={{ color: '#666' }}>
          AI-powered ticket management with intelligent classification
        </p>
      </header>

      {/* Statistics Dashboard */}
      <StatsDashboard refreshTrigger={refreshCounter} />

      {/* Create New Ticket Form */}
      <TicketForm onTicketCreated={handleTicketCreated} />

      {/* Ticket List with Filters */}
      <TicketList refreshTrigger={refreshCounter} />

      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#999', fontSize: '14px' }}>
        <p>Support Ticket System © 2026 | Built with Django + React + PostgreSQL + AI</p>
      </footer>
    </div>
  );
}

export default App;
