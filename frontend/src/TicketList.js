import React, { useState, useEffect } from 'react';
import { ticketAPI } from './api';

const TicketList = ({ refreshTrigger }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: '',
  });

  // Modal state for ticket detail/update
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [refreshTrigger, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Remove empty filters
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await ticketAPI.getTickets(params);
      setTickets(response.data);
    } catch (err) {
      setError('Failed to load tickets. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdatedStatus(ticket.status);
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
    setUpdatedStatus('');
  };

  const handleStatusUpdate = async () => {
    if (!selectedTicket || updatedStatus === selectedTicket.status) {
      closeTicketModal();
      return;
    }

    try {
      await ticketAPI.updateTicket(selectedTicket.id, { status: updatedStatus });
      closeTicketModal();
      fetchTickets(); // Refresh list
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const getPriorityClass = (priority) => {
    return `badge badge-priority-${priority}`;
  };

  const getStatusClass = (status) => {
    return `badge badge-status-${status}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card ticket-list-card">
      <div className="card-header">
        <h2>🎯 All Support Tickets</h2>
        <p className="card-subtitle">Filter and search through your tickets</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search title or description..."
          />
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priority</label>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="loader-spinner-large"></div>
          <p>Loading tickets...</p>
        </div>
      )}

      {/* Error State */}
      {error && <div className="error">⚠️ {error}</div>}

      {/* Tickets List */}
      {!loading && !error && (
        <div>
          {tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No tickets found</h3>
              <p>Create your first ticket above to get started!</p>
            </div>
          ) : (
            <div>
              <div className="ticket-count">
                <span className="count-badge">{tickets.length}</span>
                <span className="count-text">
                  ticket{tickets.length !== 1 ? 's' : ''} found
                </span>
              </div>
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="ticket-item"
                  onClick={() => openTicketModal(ticket)}
                >
                  <div className="ticket-header">
                    <div className="ticket-title">#{ticket.id} - {ticket.title}</div>
                  </div>
                  
                  <div className="ticket-meta">
                    <span className="badge badge-category">{ticket.category}</span>
                    <span className={getPriorityClass(ticket.priority)}>{ticket.priority}</span>
                    <span className={getStatusClass(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span style={{fontSize: '12px', color: '#999'}}>
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>

                  <p style={{marginTop: '10px', color: '#666', fontSize: '14px'}}>
                    {ticket.description.substring(0, 150)}
                    {ticket.description.length > 150 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeTicketModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Ticket #{selectedTicket.id}</h3>
            
            <div style={{marginBottom: '15px'}}>
              <strong>Title:</strong>
              <p>{selectedTicket.title}</p>
            </div>

            <div style={{marginBottom: '15px'}}>
              <strong>Description:</strong>
              <p>{selectedTicket.description}</p>
            </div>

            <div style={{marginBottom: '15px'}}>
              <strong>Category:</strong> {selectedTicket.category}
            </div>

            <div style={{marginBottom: '15px'}}>
              <strong>Priority:</strong> {selectedTicket.priority}
            </div>

            <div style={{marginBottom: '15px'}}>
              <strong>Created:</strong> {formatDate(selectedTicket.created_at)}
            </div>

            <div className="form-group">
              <label><strong>Update Status:</strong></label>
              <select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={handleStatusUpdate}>
                Update Status
              </button>
              <button onClick={closeTicketModal} style={{backgroundColor: '#6c757d'}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
