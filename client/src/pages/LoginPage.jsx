import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

function LoginPage() {
  // Form values (what the user types)
  const [formData, setFormData] = useState({ email: '', password: '' });
  // Error messages for each field
  const [errors, setErrors] = useState({});
  // Show or hide the password
  const [showPassword, setShowPassword] = useState(false);
  // Success message after a valid submit
  const [message, setMessage] = useState('');

  // Runs every time the user types in any input box
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // clear that field's error while typing
  };

  // Checks the form and returns any errors
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

  // Runs when the Login button is clicked
  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setMessage('');
      return; // stop here if there are errors
    }

    // Day 7: we will send the email and password to the backend here.
    // Never print passwords with console.log - they are private.
    setMessage('Form is valid! Login will work after we connect the backend.');
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🚐</div>
          <h1>Welcome Back</h1>
          <p>Log in to your SchoolRide account</p>
        </div>

        {message && <div className="form-success">{message}</div>}

        {/* noValidate = use our own validation instead of the browser's */}
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
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Log In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register as a parent</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;