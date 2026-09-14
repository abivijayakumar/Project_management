import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';
import { Plus, Search, CheckSquare, Filter } from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Delete State
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user's projects for filter dropdown
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectService.getProjects();
        setProjects(res.data || []);
      } catch {
        // Projects filter optional
      }
    };
    loadProjects();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;

      const res = await taskService.getTasks(params);
      setTasks(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, projectFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(taskToDelete._id);
      setTaskToDelete(null);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Action items across all active and scheduled projects
          </p>
        </div>

        <Link to="/tasks/new" className="btn btn-primary">
          <Plus size={18} />
          <span>New Task</span>
        </Link>
      </div>

      {/* Toolbar with Search and Multiple Filters */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          {projects.length > 0 && (
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '130px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '130px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(searchTerm || statusFilter || priorityFilter || projectFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
                setProjectFilter('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Main Task List */}
      {loading ? (
        <LoadingSpinner text="Querying tasks..." size="large" />
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CheckSquare size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            {searchTerm || statusFilter || priorityFilter || projectFilter
              ? 'No matching tasks found'
              : 'No tasks scheduled yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.925rem' }}>
            {searchTerm || statusFilter || priorityFilter || projectFilter
              ? 'Adjust your search terms or filter criteria to view more tasks.'
              : 'Break down your projects into actionable tasks with priorities and due dates.'}
          </p>
          {projects.length === 0 ? (
            <Link to="/projects/new" className="btn btn-primary">
              <Plus size={18} />
              <span>Create a Project First</span>
            </Link>
          ) : (
            <Link to="/tasks/new" className="btn btn-primary">
              <Plus size={18} />
              <span>Create First Task</span>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onEdit={() => navigate(`/tasks/${task._id}/edit`)}
              onDelete={(t) => setTaskToDelete(t)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task?"
        message={`Are you sure you want to permanently delete task "${taskToDelete?.name}"?`}
        confirmText="Yes, Delete Task"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};

export default Tasks;
