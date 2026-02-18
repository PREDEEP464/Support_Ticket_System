import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ticket API
export const ticketAPI = {
  // Get all tickets with optional filters
  getTickets: (params = {}) => {
    return api.get('/tickets/', { params });
  },

  // Create a new ticket
  createTicket: (data) => {
    return api.post('/tickets/', data);
  },

  // Update ticket (PATCH)
  updateTicket: (id, data) => {
    return api.patch(`/tickets/${id}/`, data);
  },

  // Get ticket statistics
  getStats: () => {
    return api.get('/tickets/stats/');
  },

  // Classify ticket description using LLM
  classifyTicket: (description) => {
    return api.post('/tickets/classify/', { description });
  },
};

export default api;
