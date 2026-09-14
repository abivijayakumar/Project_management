import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';
import { Plus, Search, FolderKanban, Filter } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Delete Dialog State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const res = await projectService.getProjects(params);
      setProjects(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      await projectService.deleteProject(projectToDelete._id);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
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
          <h1 style={{ fontSize: '1.85rem' }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Organize work streams, deadlines, and milestone deliverables
          </p>
        </div>

        <Link to="/projects/new" className="btn btn-primary">
          <Plus size={18} />
          <span>New Project</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Loading projects catalog..." size="large" />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderKanban size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            {searchTerm || statusFilter ? 'No matching projects found' : 'No projects yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.925rem' }}>
            {searchTerm || statusFilter
              ? 'Try changing your search keywords or resetting your status filter.'
              : 'Create your first project to start organizing tasks, due dates, and tracking progress.'}
          </p>
          {searchTerm || statusFilter ? (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/projects/new" className="btn btn-primary">
              <Plus size={18} />
              <span>Create Project</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {projects.map((proj) => (
            <ProjectCard
              key={proj._id}
              project={proj}
              onDelete={(p) => setProjectToDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!projectToDelete}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${projectToDelete?.name}"? All associated tasks inside this project will also be deleted immediately.`}
        confirmText="Yes, Delete Project"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};

export default Projects;
