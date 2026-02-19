import React from 'react';
import TicketList from '../TicketList';

function AllTickets() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tickets</h1>
          <p className="page-subtitle">Browse, filter, and manage your support tickets</p>
        </div>
      </div>

      <TicketList />
    </div>
  );
}

export default AllTickets;
