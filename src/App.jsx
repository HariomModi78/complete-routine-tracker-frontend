import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Activity, Menu, X, Calendar } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Routines from './pages/Routines';
import History from './pages/History';
import { RoutineProvider } from './context/RoutineContext';
import './index.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/routines', label: 'My Routines', icon: <ListTodo size={20} /> },
    { path: '/history', label: 'Daily History', icon: <Calendar size={20} /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="mobile-overlay" 
          onClick={toggleSidebar}
        />
      )}
      
      <div className={`sidebar glass ${isOpen ? 'open' : ''}`} style={{ borderRadius: '0' }}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '10px', borderRadius: '12px' }}>
              <Activity size={24} color="white" />
            </div>
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>RoutineX</h2>
          </div>
          
          <button className="mobile-close-btn" onClick={toggleSidebar}>
            <X size={24} color="var(--text-main)" />
          </button>
        </div>

        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={() => { if(window.innerWidth <= 768) toggleSidebar(); }}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: location.pathname === item.path ? 'white' : 'var(--text-muted)',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontWeight: location.pathname === item.path ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', textAlign: 'center', padding: '20px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <h4 style={{ marginBottom: '8px', color: 'white' }}>Stay Consistent!</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Building habits takes time.</p>
        </div>
      </div>
    </>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <RoutineProvider>
        <div className="app-container">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          
          <main className="main-content">
            <div className="mobile-topbar">
              <button onClick={toggleSidebar} className="hamburger-btn">
                <Menu size={24} color="var(--text-main)" />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--accent-primary)" />
                <h2 className="gradient-text" style={{ fontSize: '1.2rem', margin: 0 }}>RoutineX</h2>
              </div>
            </div>
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/routines" element={<Routines />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
        </div>
      </RoutineProvider>
    </Router>
  );
}

export default App;
