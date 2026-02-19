import React from 'react';
import StatsDashboard from '../StatsDashboard';

function Dashboard() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time ticket analytics and system overview</p>
        </div>
      </div>

      <StatsDashboard />
    </div>
  );
}

export default Dashboard;
