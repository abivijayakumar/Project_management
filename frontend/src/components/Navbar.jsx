import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-icon"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px'
          }}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Layers size={20} />
          </div>
          <span>Pulse</span>
        </Link>
      </div>

      <div className="nav-actions">
        {user && (
          <div className="user-profile-badge">
            <div className="user-avatar">
              {getInitials(user.fullName)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="user-name" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user.fullName}
              </span>
              <span className="user-email" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.email}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm navbar-logout-btn"
          title="Sign out"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
