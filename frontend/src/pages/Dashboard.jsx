import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  PlayCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  FolderPlus
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating workspace analytics..." size="large" />;
  }

  if (error) {
    return (
      <div className="alert-banner alert-danger">
        <span>{error}</span>
      </div>
    );
  }

  const {
    totalProjects = 0,
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    projectsInProgress = 0,
    recentProjects = [],
    recentTasks = []
  } = stats || {};

  const taskCompletionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return (
    <div>
      {/* Header with greeting and actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Real-time project tracking and performance telemetry
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/projects/new" className="btn btn-primary">
            <Plus size={18} />
            <span>Create Project</span>
          </Link>
          <Link to="/tasks/new" className="btn btn-secondary">
            <Plus size={18} />
            <span>Add Task</span>
          </Link>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid-stats">
        <div className="stat-card">
          <div>
            <div className="stat-value">{totalProjects}</div>
            <div className="stat-title">Total Projects</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <FolderKanban size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{projectsInProgress}</div>
            <div className="stat-title">Projects In Progress</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <PlayCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-title">Total Tasks</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <CheckSquare size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: '#047857' }}>{completedTasks}</div>
            <div className="stat-title">Completed Tasks</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#047857' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: '#475569' }}>{pendingTasks}</div>
            <div className="stat-title">Pending Tasks</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f1f5f9', color: '#64748b' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Productivity Progress Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Task Completion Rate</h3>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {taskCompletionRate}%
          </span>
        </div>
        <div className="progress-bar-container" style={{ height: '10px' }}>
          <div className="progress-bar-fill" style={{ width: `${taskCompletionRate}%` }} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>
          {completedTasks} of {totalTasks} total tasks completed across all projects
        </p>
      </div>

      {/* Split Recent Section: Recent Projects & Recent Tasks */}
      <div className="grid-dashboard-split">
        {/* Recent Projects Widget */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.15rem' }}>Recent Projects</h3>
            <Link to="/projects" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <FolderPlus size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>No projects created yet.</p>
              <Link to="/projects/new" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                Create First Project
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentProjects.map((p) => (
                <div
                  key={p._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    padding: '0.85rem 1.15rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color var(--transition-fast)'
                  }}
                >
                  <div style={{ minWidth: '150px', flex: '1 1 180px' }}>
                    <Link
                      to={`/projects/${p._id}`}
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontSize: '0.925rem',
                        lineHeight: 1.35,
                        display: 'block',
                        wordBreak: 'break-word'
                      }}
                    >
                      {p.name}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Created {formatDate(p.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks Widget */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.15rem' }}>Recent Tasks</h3>
            <Link to="/tasks" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <CheckSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>No tasks created yet.</p>
              <Link to="/tasks/new" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                Add First Task
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTasks.map((t) => (
                <div
                  key={t._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    padding: '0.85rem 1.15rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color var(--transition-fast)'
                  }}
                >
                  <div style={{ minWidth: '150px', flex: '1 1 180px' }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.925rem',
                      lineHeight: 1.35,
                      color: 'var(--text-primary)',
                      wordBreak: 'break-word',
                      marginBottom: '0.2rem'
                    }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {t.projectId?.name || 'Project'} • Due {formatDate(t.dueDate)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
