import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { formatDateForInput } from '../utils/formatDate';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Not Started',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjectById(id);
        const p = res.data;
        setFormData({
          name: p.name || '',
          description: p.description || '',
          status: p.status || 'Not Started',
          startDate: formatDateForInput(p.startDate),
          endDate: formatDateForInput(p.endDate)
        });
      } catch (err) {
        setServerError(err.response?.data?.message || 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      };

      await projectService.updateProject(id, payload);
      navigate(`/projects/${id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details for editing..." size="large" />;
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={`/projects/${id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Project</span>
        </Link>
      </div>

      <div className="card">
        <h1 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Edit Project</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.75rem' }}>
          Update project specifications and deliverable schedule
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
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Project Status
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
            <Link to={`/projects/${id}`} className="btn btn-secondary">
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

export default EditProject;
