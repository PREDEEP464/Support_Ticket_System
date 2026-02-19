import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './pages/Dashboard';
import NewTicket from './pages/NewTicket';
import AllTickets from './pages/AllTickets';
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-content">
          <img src="/Support_System_Favicon.png" alt="Logo" className="loading-logo" />
          <h1 className="loading-title">Support Ticket System</h1>
          <div className="loading-spinner-large"></div>
          <p className="loading-text">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar onShowHowItWorks={() => setShowHowItWorks(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-ticket" element={<NewTicket />} />
            <Route path="/tickets" element={<AllTickets />} />
          </Routes>
          
          <footer className="app-footer">
            <div className="footer-content">
              <p>Support Ticket System © 2026</p>
              <p className="tech-stack">Built with Django • React • PostgreSQL</p>
            </div>
          </footer>
        </main>
      </div>
      
      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-content how-it-works-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚀 How It Works</h2>
              <button className="modal-close" onClick={() => setShowHowItWorks(false)}>✕</button>
            </div>
            
            <div className="how-it-works-content">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>📝 Submit a Ticket</h3>
                  <p>Fill in the title and description of your issue. Our system will automatically analyze your description.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>🤖 Smart Classification</h3>
                  <p>The system automatically suggests the best category and priority based on your description using intelligent analysis.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>🔍 Track & Filter</h3>
                  <p>View all your tickets, filter by category/priority/status, and search through titles and descriptions.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>📊 Monitor Progress</h3>
                  <p>Check real-time statistics and update ticket status from Open → In Progress → Resolved → Closed.</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="primary-button" onClick={() => setShowHowItWorks(false)}>
                Got it! ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
