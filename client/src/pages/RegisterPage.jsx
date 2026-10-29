import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

// Text and icon for each account type
const roleConfig = {
  parent: {
    icon: '👨‍👩‍👧',
    title: 'Create a Parent Account',
    subtitle: "Register to manage your child's school transport",
    button: 'Create Parent Account',
  },
  driver: {
    icon: '🧑‍✈️',
    title: 'Register as a Driver',
    subtitle: 'Your account will be active after the administrator approves it',
    button: 'Submit Driver Registration',
  },
};

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // /register?type=driver opens on the Driver tab
  const [role, setRole] = useState(searchParams.get('type') === 'driver' ? 'driver' : 'parent');
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const config = roleConfig[role];

  // Switch account type and start with a clean form
  const switchRole = (newRole) => {
    setRole(newRole);
    setFormData(initialForm);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a 10-digit number starting with 0';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain letters and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await register({ ...formData, role });

      if (role === 'parent') {
        navigate('/parent'); // parents are logged in straight away
      } else {
        // drivers must wait for approval - show the message and clear the form
        setSuccessMessage(data.message);
        setFormData(initialForm);
      }
    } catch (error) {
      setServerError(error.message); // e.g. "An account with this email already exists"
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className={`auth-card auth-card-wide auth-card-${role}`}>
        {/* ===== Parent / Driver tabs ===== */}
        <div className="login-tabs" role="group" aria-label="Choose account type">
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

        <div className="auth-header">
          <div className="auth-icon">{config.icon}</div>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>

        {serverError && <div className="form-error">{serverError}</div>}
        {successMessage && <div className="form-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder={role === 'driver' ? 'e.g. Sunil Fernando' : 'e.g. Kamala Perera'}
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'input-error' : ''}
              autoComplete="name"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-row">
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
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="0771234567"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'input-error' : ''}
                autoComplete="tel"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password ? (
                <span className="error-text">{errors.password}</span>
              ) : (
                <span className="form-hint">Use letters and numbers</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'input-error' : ''}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Please wait...' : config.button}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;