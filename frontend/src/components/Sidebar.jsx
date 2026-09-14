import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Plus, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
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

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <NavLink
            to="/projects/new"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '0.75rem' }}
            onClick={() => { if (window.innerWidth <= 900) onClose(); }}
          >
            <Plus size={18} />
            <span>New Project</span>
          </NavLink>

          <NavLink
            to="/tasks/new"
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => { if (window.innerWidth <= 900) onClose(); }}
          >
            <Plus size={18} />
            <span>New Task</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
