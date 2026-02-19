import React, { useState } from 'react';
import TicketForm from '../TicketForm';
import { useNavigate } from 'react-router-dom';

function NewTicket() {
  const navigate = useNavigate();

  const handleTicketCreated = () => {
    // Navigate to all tickets after creating
    navigate('/tickets');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Ticket</h1>
          <p className="page-subtitle">Submit a support request with smart classification</p>
        </div>
      </div>

      <TicketForm onTicketCreated={handleTicketCreated} />
    </div>
  );
}

export default NewTicket;
