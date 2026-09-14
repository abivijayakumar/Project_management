import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LogIn, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);

  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clearError();
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      setSessionExpiredMsg(true);
    }
  }, [location.search, clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="brand-icon" style={{ width: '48px', height: '48px' }}>
              <Layers size={26} />
            </div>
          </div>
          <h1>Welcome to Pulse</h1>
          <p>Sign in to your project management workspace</p>
        </div>

        {sessionExpiredMsg && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="alex@company.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          </button>

          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px dashed rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={14} /> Quick Demo Accounts
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to autofill</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                onClick={() => {
                  setFormData({ email: 'alex@pulse.dev', password: 'Password123!' });
                  setFieldErrors({});
                }}
              >
                👤 Alex (Workspace Owner)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                onClick={() => {
                  setFormData({ email: 'sarah@pulse.dev', password: 'Password123!' });
                  setFieldErrors({});
                }}
              >
                👤 Sarah (Multi-tenant User)
              </button>
            </div>
          </div>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
