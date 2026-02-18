import React, { useState, useEffect } from 'react';
import { ticketAPI } from './api';

const StatsDashboard = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await ticketAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Statistics Dashboard</h2>
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Statistics Dashboard</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="card">
      <h2>Statistics Dashboard</h2>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_tickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.open_tickets}</div>
          <div className="stat-label">Open Tickets</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.avg_tickets_per_day}</div>
          <div className="stat-label">Avg Tickets/Day</div>
        </div>
      </div>

      {/* Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        {/* Priority Breakdown */}
        <div>
          <h3 style={{fontSize: '16px', marginBottom: '10px'}}>Priority Breakdown</h3>
          <div className="breakdown">
            {Object.entries(stats.priority_breakdown).length > 0 ? (
              Object.entries(stats.priority_breakdown).map(([priority, count]) => (
                <div key={priority} className="breakdown-item">
                  <span style={{textTransform: 'capitalize'}}>{priority}</span>
                  <span style={{fontWeight: 'bold'}}>{count}</span>
                </div>
              ))
            ) : (
              <p style={{color: '#999', fontSize: '14px'}}>No data available</p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 style={{fontSize: '16px', marginBottom: '10px'}}>Category Breakdown</h3>
          <div className="breakdown">
            {Object.entries(stats.category_breakdown).length > 0 ? (
              Object.entries(stats.category_breakdown).map(([category, count]) => (
                <div key={category} className="breakdown-item">
                  <span style={{textTransform: 'capitalize'}}>{category}</span>
                  <span style={{fontWeight: 'bold'}}>{count}</span>
                </div>
              ))
            ) : (
              <p style={{color: '#999', fontSize: '14px'}}>No data available</p>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div>
          <h3 style={{fontSize: '16px', marginBottom: '10px'}}>Status Breakdown</h3>
          <div className="breakdown">
            {Object.entries(stats.status_breakdown).length > 0 ? (
              Object.entries(stats.status_breakdown).map(([status, count]) => (
                <div key={status} className="breakdown-item">
                  <span style={{textTransform: 'capitalize'}}>{status.replace('_', ' ')}</span>
                  <span style={{fontWeight: 'bold'}}>{count}</span>
                </div>
              ))
            ) : (
              <p style={{color: '#999', fontSize: '14px'}}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
