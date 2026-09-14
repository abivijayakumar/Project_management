import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { formatDateForInput } from '../utils/formatDate';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTaskAndProjects = async () => {
      try {
        setLoading(true);
        const [taskRes, projRes] = await Promise.all([
          taskService.getTaskById(id),
          projectService.getProjects()
        ]);

        const task = taskRes.data;
        setProjects(projRes.data || []);
        setFormData({
          projectId: task.projectId?._id || task.projectId || '',
          name: task.name || '',
          description: task.description || '',
          priority: task.priority || 'Medium',
          status: task.status || 'Pending',
          dueDate: formatDateForInput(task.dueDate)
        });
      } catch (err) {
        setServerError(err.response?.data?.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    loadTaskAndProjects();
  }, [id]);

  const validate = () => {
    const errors = {};
    if (!formData.projectId) {
      errors.projectId = 'Please select a project';
    }

    if (!formData.name.trim()) {
      errors.name = 'Task name is required';
    } else if (formData.name.trim().length > 150) {
      errors.name = 'Task name cannot exceed 150 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setServerError(null);

      const payload = {
        projectId: formData.projectId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null
      };

      await taskService.updateTask(id, payload);
      navigate('/tasks');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task editor..." size="large" />;
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/tasks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </Link>
      </div>

      <div className="card">
        <h1 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Edit Task</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.75rem' }}>
          Update task priority, state, or reassign to another project
        </p>

        {serverError && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="projectId">
              Target Project *
            </label>
            <select
              id="projectId"
              name="projectId"
              className="form-control"
              value={formData.projectId}
              onChange={handleChange}
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            {fieldErrors.projectId && <span className="form-error">{fieldErrors.projectId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Task Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
            />
            {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="form-control"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dueDate">
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                className="form-control"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <Link to="/tasks" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save size={18} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
