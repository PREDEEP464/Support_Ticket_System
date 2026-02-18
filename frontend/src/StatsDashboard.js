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
      <div className="card stats-card">
        <div className="card-header">
          <h2>📊 Statistics Dashboard</h2>
          <p className="card-subtitle">Real-time ticket analytics</p>
        </div>
        <div className="loading">
          <div className="loader-spinner-large"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card stats-card">
        <div className="card-header">
          <h2>📊 Statistics Dashboard</h2>
          <p className="card-subtitle">Real-time ticket analytics</p>
        </div>
        <div className="error">⚠️ {error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="card stats-card">
      <div className="card-header">
        <h2>📊 Statistics Dashboard</h2>
        <p className="card-subtitle">Real-time ticket analytics and insights</p>
      </div>

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
      <div className="breakdowns-container">
        
        {/* Priority Breakdown */}
        <div className="breakdown-card">
          <h3 className="breakdown-title">📌 Priority Breakdown</h3>
          <div className="breakdown-table">
            <div className="table-header">
              <span>Priority</span>
              <span>Count</span>
            </div>
            {Object.entries(stats.priority_breakdown).length > 0 ? (
              Object.entries(stats.priority_breakdown).map(([priority, count]) => (
                <div key={priority} className="table-row">
                  <span className="table-cell">
                    <span className={`priority-dot priority-${priority}`}></span>
                    <span style={{textTransform: 'capitalize'}}>{priority}</span>
                  </span>
                  <span className="table-cell count-cell">{count}</span>
                </div>
              ))
            ) : (
              <div className="empty-data">No data available</div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="breakdown-card">
          <h3 className="breakdown-title">📂 Category Breakdown</h3>
          <div className="breakdown-table">
            <div className="table-header">
              <span>Category</span>
              <span>Count</span>
            </div>
            {Object.entries(stats.category_breakdown).length > 0 ? (
              Object.entries(stats.category_breakdown).map(([category, count]) => (
                <div key={category} className="table-row">
                  <span className="table-cell">
                    <span className="category-icon">{getCategoryIcon(category)}</span>
                    <span style={{textTransform: 'capitalize'}}>{category}</span>
                  </span>
                  <span className="table-cell count-cell">{count}</span>
                </div>
              ))
            ) : (
              <div className="empty-data">No data available</div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="breakdown-card">
          <h3 className="breakdown-title">🎯 Status Breakdown</h3>
          <div className="breakdown-table">
            <div className="table-header">
              <span>Status</span>
              <span>Count</span>
            </div>
            {Object.entries(stats.status_breakdown).length > 0 ? (
              Object.entries(stats.status_breakdown).map(([status, count]) => (
                <div key={status} className="table-row">
                  <span className="table-cell">
                    <span className={`status-indicator status-${status}`}></span>
                    <span style={{textTransform: 'capitalize'}}>{status.replace('_', ' ')}</span>
                  </span>
                  <span className="table-cell count-cell">{count}</span>
                </div>
              ))
            ) : (
              <div className="empty-data">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for category icons
const getCategoryIcon = (category) => {
  const icons = {
    billing: '💳',
    technical: '🔧',
    account: '👤',
    general: '📋'
  };
  return icons[category] || '📋';
};

export default StatsDashboard;
