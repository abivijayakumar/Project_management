import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Calendar, CheckSquare, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const ProjectCard = ({ project, onDelete }) => {
  const progress = project.progressPercent || 0;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.3 }}>
          <Link to={`/projects/${project._id}`} style={{ color: 'var(--text-primary)' }}>
            {project.name}
          </Link>
        </h3>
        <StatusBadge status={project.status} />
      </div>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        marginBottom: '1.25rem',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '2.7rem'
      }}>
        {project.description || 'No description provided.'}
      </p>

      {/* Dates row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.825rem',
        color: 'var(--text-muted)',
        marginBottom: '1.25rem'
      }}>
        <Calendar size={15} />
        <span>
          {formatDate(project.startDate)} → {formatDate(project.endDate)}
        </span>
      </div>

      {/* Progress & Task Counts */}
      <div style={{ marginTop: 'auto', marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.825rem',
          marginBottom: '0.4rem'
        }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckSquare size={14} />
            {project.completedTasks || 0} / {project.totalTasks || 0} Tasks
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {progress}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.875rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <Link
          to={`/projects/${project._id}`}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>View</span>
          <ArrowRight size={14} />
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/projects/${project._id}/edit`}
            className="btn btn-secondary btn-sm btn-icon"
            title="Edit project"
          >
            <Edit3 size={15} />
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm btn-icon"
            onClick={() => onDelete(project)}
            title="Delete project"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
