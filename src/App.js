// admin/src/App.js
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Enquiries from './components/Enquiries/Enquiries';
import Orders from './components/Orders/Orders';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';
import Content from './components/Content/Content';
import { ToastContainer } from './components/Toast/Toast';
import { getAnalytics } from './services/api';
import { useEscapeKey } from './hooks/useEscapeKey';
import './styles/global.css';
import './styles/components.css';
import './components/Login/Login.css';

function AdminApp() {
  const { admin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [badges, setBadges] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEscapeKey(() => setSidebarOpen(false), sidebarOpen);

  // Poll pending enquiry count for sidebar badge
  useEffect(() => {
    if (!admin) return;
    const load = () => {
      getAnalytics()
        .then(r => setBadges({ pendingEnquiries: r.data?.pendingEnquiries || 0 }))
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [admin]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F1A' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!admin) return <Login />;

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':  return <Dashboard setActive={setActiveTab} />;
      case 'products':   return <Products />;
      case 'enquiries':  return <Enquiries />;
      case 'orders':     return <Orders />;
      case 'analytics':  return <Analytics />;
      case 'settings':   return <Settings />;
      case 'content':    return <Content />;
      default:           return <Dashboard setActive={setActiveTab} />;
    }
  };

  return (
    <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu">
          ☰
        </button>
        <div className="mobile-header-logo">
          <img 
            src="/logo.png" 
            alt="VVM Logo" 
            style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%',
              backgroundColor: '#fff',
              padding: '1.5px',
              objectFit: 'contain',
              border: '1px solid var(--gold)',
              marginRight: '8px'
            }} 
          />
          <span>VVM TRADERS</span>
        </div>
        <div style={{ width: 36 }} /> {/* Spacer to balance header elements */}
      </header>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar 
        active={activeTab} 
        setActive={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} 
        badges={badges} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="admin-main">{renderPage()}</main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
