import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ onShowHowItWorks }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <img src="/Support_System_Favicon.png" alt="Logo" className="sidebar-logo" />
        <h2 className="sidebar-title">Ticket System</h2>
      </div>
      
      <div className="sidebar-menu">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
        >
          <span className="sidebar-icon">📊</span>
          <span className="sidebar-label">Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/new-ticket" 
          className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
        >
          <span className="sidebar-icon">➕</span>
          <span className="sidebar-label">New Ticket</span>
        </NavLink>
        
        <NavLink 
          to="/tickets" 
          className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
        >
          <span className="sidebar-icon">🎫</span>
          <span className="sidebar-label">All Tickets</span>
        </NavLink>
      </div>
      
      <div className="sidebar-footer">
        <button className="sidebar-help-btn" onClick={onShowHowItWorks}>
          {/* <span className="sidebar-icon-small">❓</span> */}
          <span className="sidebar-label">❓ How It Works</span>
        </button>
        
        <div className="status-badge">
          <span className="status-dot"></span>
          <span className="status-label">System Online</span>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
