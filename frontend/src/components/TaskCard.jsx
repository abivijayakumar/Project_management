import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Calendar, CheckCircle, Clock, Edit3, Trash2, Folder } from 'lucide-react';
import { formatDate, isOverdue } from '../utils/formatDate';

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const overdue = isOverdue(task.dueDate, task.status);
  const isDone = task.status === 'Completed';

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      borderLeft: task.priority === 'High' 
        ? '4px solid #f43f5e' 
        : task.priority === 'Medium' 
          ? '4px solid #f59e0b' 
          : '4px solid #38bdf8'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
          <button
            type="button"
            onClick={() => onToggleStatus(task)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isDone ? '#10b981' : 'var(--text-muted)',
              padding: 0,
              marginTop: '3px'
            }}
            title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {isDone ? <CheckCircle size={20} /> : <Clock size={20} />}
          </button>
          <div>
            <h4 style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              textDecoration: isDone ? 'line-through' : 'none',
              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)'
            }}>
              {task.name}
            </h4>
            {task.description && (
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                lineHeight: 1.4
              }}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meta tags and Project link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: 'auto',
        paddingTop: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />

          {task.projectId && (
            <Link
              to={`/projects/${task.projectId._id || task.projectId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Folder size={12} />
              <span>{task.projectId.name || 'Project'}</span>
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {task.dueDate && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              color: overdue ? '#f87171' : 'var(--text-muted)',
              fontWeight: overdue ? 600 : 400
            }}>
              <Calendar size={13} />
              <span>{formatDate(task.dueDate)} {overdue && '(Overdue)'}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => onEdit(task)}
              title="Edit task"
            >
              <Edit3 size={14} />
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm btn-icon"
              onClick={() => onDelete(task)}
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
