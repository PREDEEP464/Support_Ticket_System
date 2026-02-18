import React, { useState } from 'react';
import { ticketAPI } from './api';

const TicketForm = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });

  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionBlur = async () => {
    // Auto-classify when user finishes typing description
    if (formData.description.trim().length > 10) {
      await classifyDescription();
    }
  };

  const classifyDescription = async () => {
    if (!formData.description.trim()) {
      return;
    }

    setIsClassifying(true);
    setError('');

    try {
      const response = await ticketAPI.classifyTicket(formData.description);
      
      // Pre-fill the dropdowns with smart suggestions
      setFormData(prev => ({
        ...prev,
        category: response.data.suggested_category,
        priority: response.data.suggested_priority,
      }));

    } catch (err) {
      console.error('Classification error:', err);
      // Graceful fallback - keep current values
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await ticketAPI.createTicket(formData);
      
      setSuccess('Ticket created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
      });

      // Notify parent component
      if (onTicketCreated) {
        onTicketCreated();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Submit New Ticket</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
            required
            placeholder="Brief description of your issue"
          />
          <small>{formData.title.length}/200 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleDescriptionBlur}
            required
            placeholder="Provide detailed information about your issue..."
          />
          {isClassifying && (
            <small style={{color: '#007bff'}}>
              ✓ Analyzing your description...
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category">
            Category * {isClassifying && '(Auto-detecting...)'}
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">
            Priority * {isClassifying && '(Auto-detecting...)'}
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button type="submit" disabled={isSubmitting || isClassifying}>
          {isSubmitting ? 'Creating...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
