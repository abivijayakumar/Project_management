import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskCard from '../components/TaskCard';
import { formatDate } from '../utils/formatDate';
import {
  Calendar,
  Edit3,
  Trash2,
  ArrowLeft,
  Plus,
  CheckSquare,
  Filter
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task Filter
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');

  // Delete Dialogs
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjectById(id);
      setProject(res.data);
      setTasks(res.data.tasks || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(taskToDelete._id);
      setTaskToDelete(null);
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteProjectConfirm = async () => {
    try {
      setIsDeleting(true);
      await projectService.deleteProject(id);
      navigate('/projects', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving project dossier..." size="large" />;
  }

  if (error || !project) {
    return (
      <div>
        <Link to="/projects" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </Link>
        <div className="alert-banner alert-danger">
          <span>{error || 'Project not found'}</span>
        </div>
      </div>
    );
  }

  // Filter project tasks locally
  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter && t.status !== taskStatusFilter) return false;
    if (taskPriorityFilter && t.priority !== taskPriorityFilter) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>All Projects</span>
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2rem' }}>{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '800px' }}>
              {project.description || 'No description provided for this project.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/projects/${project._id}/edit`} className="btn btn-secondary btn-sm">
              <Edit3 size={15} />
              <span>Edit Project</span>
            </Link>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setDeleteProjectOpen(true)}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Timeline Dates & Progress */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          alignItems: 'center',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Calendar size={16} />
            <span>Timeline: {formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '220px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Progress: {completedCount}/{tasks.length} ({progressPercent}%)
            </span>
            <div className="progress-bar-container" style={{ flex: 1 }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Tasks Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Project Tasks</h2>
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {filteredTasks.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '130px', padding: '0.5rem 0.75rem' }}
            value={taskStatusFilter}
            onChange={(e) => setTaskStatusFilter(e.target.value)}
          >
            <option value="">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '130px', padding: '0.5rem 0.75rem' }}
            value={taskPriorityFilter}
            onChange={(e) => setTaskPriorityFilter(e.target.value)}
          >
            <option value="">Priority: All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <Link to={`/tasks/new?projectId=${project._id}`} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Task</span>
          </Link>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
          <CheckSquare size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No tasks found in this project</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {taskStatusFilter || taskPriorityFilter
              ? 'Try clearing the task filters.'
              : 'Add your first task to start tracking actionable work items.'}
          </p>
          <Link to={`/tasks/new?projectId=${project._id}`} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Add First Task</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleStatus={handleToggleTaskStatus}
              onEdit={() => navigate(`/tasks/${task._id}/edit`)}
              onDelete={(t) => setTaskToDelete(t)}
            />
          ))}
        </div>
      )}

      {/* Delete Project Modal */}
      <ConfirmDialog
        isOpen={deleteProjectOpen}
        title="Delete Project?"
        message={`Deleting "${project.name}" will permanently erase this project and all ${tasks.length} associated task(s).`}
        confirmText="Delete Project"
        isLoading={isDeleting}
        onConfirm={handleDeleteProjectConfirm}
        onCancel={() => setDeleteProjectOpen(false)}
      />

      {/* Delete Task Modal */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete task "${taskToDelete?.name}"?`}
        confirmText="Delete Task"
        isLoading={isDeleting}
        onConfirm={handleDeleteTaskConfirm}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};

export default ProjectDetails;
