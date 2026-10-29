import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/roles';
import './AuthPages.css';

// Text and icon for each login type
const roleConfig = {
  parent: {
    icon: '👨‍👩‍👧',
    title: 'Parent Login',
    subtitle: "Log in to follow your child's school journey",
    button: 'Log In as Parent',
  },
  driver: {
    icon: '🧑‍✈️',
    title: 'Driver Login',
    subtitle: "Log in to view today's pickup list",
    button: 'Log In as Driver',
  },
  admin: {
    icon: '🛠️',
    title: 'Administrator Login',
    subtitle: 'Log in to manage the SchoolRide system',
    button: 'Log In as Administrator',
  },
};

const emptyForm = { email: '', password: '' };

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('parent');
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const config = roleConfig[role];

  // Switch login type and start with a clean form
  const switchRole = (newRole) => {
    setRole(newRole);
    setFormData(emptyForm);
    setErrors({});
    setServerError('');
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const loggedInUser = await login(formData.email, formData.password, role);
      navigate(getDashboardPath(loggedInUser.role));
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className={`auth-card auth-card-${role}`}>
        {/* ===== Parent / Driver tabs (hidden for admin) ===== */}
        {role !== 'admin' && (
          <div className="login-tabs" role="group" aria-label="Choose login type">
            <button
              type="button"
              className={`login-tab ${role === 'parent' ? 'active' : ''}`}
              aria-pressed={role === 'parent'}
              onClick={() => switchRole('parent')}
            >
              👨‍👩‍👧 Parent
            </button>
            <button
              type="button"
              className={`login-tab ${role === 'driver' ? 'active' : ''}`}
              aria-pressed={role === 'driver'}
              onClick={() => switchRole('driver')}
            >
              🧑‍✈️ Driver
            </button>
          </div>
        )}

        <div className="auth-header">
          <div className="auth-icon">{config.icon}</div>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>

        {serverError && <div className="form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : config.button}
          </button>
        </form>

        {/* ===== Different footer for each login type ===== */}
        {role === 'parent' && (
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register as a parent</Link>
          </p>
        )}
        {role === 'driver' && (
          <p className="auth-footer">
            New driver? <Link to="/register?type=driver">Register as a driver</Link>
          </p>
        )}

        <p className="auth-footer">
          {role === 'admin' ? (
            <button type="button" className="link-button" onClick={() => switchRole('parent')}>
              ← Back to parent / driver login
            </button>
          ) : (
            <button type="button" className="link-button" onClick={() => switchRole('admin')}>
              Administrator login
            </button>
          )}
        </p>
      </div>
    </section>
  );
}

export default LoginPage;