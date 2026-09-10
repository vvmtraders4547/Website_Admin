// admin/src/components/Sidebar/Sidebar.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'products',  icon: '🌶️', label: 'Products' },
  { key: 'enquiries', icon: '📬', label: 'Enquiries', badgeKey: 'pendingEnquiries' },
  { key: 'orders',    icon: '📦', label: 'Orders' },
  { key: 'analytics', icon: '📈', label: 'Analytics' },
  { key: 'content',   icon: '📝', label: 'Content' },
  { key: 'settings',  icon: '⚙️', label: 'Settings' },
];

function Sidebar({ active, setActive, badges = {}, isOpen, onClose }) {
  const { admin, logout } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">✕</button>

        <img 
          src="/logo.png" 
          alt="VVM Logo" 
          style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%',
            backgroundColor: '#fff',
            padding: '2px',
            objectFit: 'contain',
            border: '1.5px solid var(--gold)',
            flexShrink: 0
          }} 
        />
        <div>
          <span className="sidebar-logo-text">VVM TRADERS</span>
          <span className="sidebar-logo-sub">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV.map(item => (
          <div key={item.key}
            className={`sidebar-item ${active === item.key ? 'active' : ''}`}
            onClick={() => setActive(item.key)}>
            <span className="s-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badgeKey && badges[item.badgeKey] > 0 && (
              <span className="s-badge">{badges[item.badgeKey]}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{admin?.username?.[0]?.toUpperCase() || 'A'}</div>
          <div>
            <div className="sidebar-user-name">{admin?.name || 'Admin'}</div>
            <div className="sidebar-user-role">{admin?.role || 'admin'}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          <span>🚪</span><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
