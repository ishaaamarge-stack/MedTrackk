import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import PharmacistTerminal from './PharmacistTerminal';
import DistributorPortal from './DistributorPortal';
import AdminConsole from './AdminConsole';

function Nav() {
  const location = useLocation();
  return (
    <nav className="glass-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--primary-color)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#000', fontWeight: 'bold' }}>M</span>
        </div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'white', WebkitBackgroundClip: 'text' }}>MedTrack</h2>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Pharmacist Terminal</Link>
        <Link to="/distributor" className={`nav-link ${location.pathname === '/distributor' ? 'active' : ''}`}>Distributor Portal</Link>
        <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin Console</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div className="container animate-slide-in">
        <Routes>
          <Route path="/" element={<PharmacistTerminal />} />
          <Route path="/distributor" element={<DistributorPortal />} />
          <Route path="/admin" element={<AdminConsole />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
