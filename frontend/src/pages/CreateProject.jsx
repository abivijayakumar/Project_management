import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Not Started',
    startDate: '',
    endDate: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    } else if (formData.name.trim().length > 150) {
      errors.name = 'Project name cannot exceed 150 characters';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = 'End date cannot be earlier than start date';
      }
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate })
      };

      const res = await projectService.createProject(payload);
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
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
          <span>Back to Projects</span>
        </Link>
      </div>

      <div className="card">
        <h1 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Create New Project</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.75rem' }}>
          Define project objectives, timelines, and execution status
        </p>

        {serverError && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Project Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Website Redesign & Migration"
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
              rows={4}
              className="form-control"
              placeholder="High-level description of objectives, deliverables, and dependencies..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Initial Status
            </label>
            <select
              id="status"
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="startDate">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="form-control"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="endDate">
                Target Completion Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="form-control"
                value={formData.endDate}
                onChange={handleChange}
              />
              {fieldErrors.endDate && <span className="form-error">{fieldErrors.endDate}</span>}
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
            <Link to="/projects" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save size={18} />
              <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
