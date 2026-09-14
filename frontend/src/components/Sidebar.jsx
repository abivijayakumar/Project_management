import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Plus, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
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
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Workspace
          </span>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: window.innerWidth <= 900 ? 'block' : 'none'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 900) onClose(); }}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 900) onClose(); }}
          >
            <FolderKanban size={19} />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 900) onClose(); }}
          >
            <CheckSquare size={19} />
            <span>Tasks</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          {/* User profile preview inside sidebar menu on mobile screens */}
          {user && (
            <div className="sidebar-user-mobile" style={{
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              padding: '0.65rem 0.85rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div className="user-avatar" style={{ flexShrink: 0, width: '32px', height: '32px' }}>
                {getInitials(user.fullName)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          <NavLink
            to="/projects/new"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '0.65rem' }}
            onClick={() => { if (window.innerWidth <= 900) onClose(); }}
          >
            <Plus size={18} />
            <span>New Project</span>
          </NavLink>

          <NavLink
            to="/tasks/new"
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '0.65rem' }}
            onClick={() => { if (window.innerWidth <= 900) onClose(); }}
          >
            <Plus size={18} />
            <span>New Task</span>
          </NavLink>

          {/* Logout button placed at menu (sidebar) only for below/mobile screen */}
          <button
            onClick={() => {
              if (window.innerWidth <= 900) onClose();
              logout();
            }}
            className="btn btn-secondary sidebar-logout-mobile"
            style={{
              width: '100%',
              color: '#b91c1c',
              borderColor: '#fca5a5',
              background: '#fef2f2',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
