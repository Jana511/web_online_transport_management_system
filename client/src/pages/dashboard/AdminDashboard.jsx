import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import './Dashboard.css';

function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // useEffect runs after the page appears - a good place to load data
  useEffect(() => {
    apiRequest('/admin/stats', { token })
      .then((data) => setStats(data.stats))
      .catch((err) => {
        if (err.status === 401) {
          logout(); // token expired -> log out (ProtectedRoute sends them to login)
        } else {
          setError(err.message);
        }
      });
  }, [token, logout]);

  // Show "..." until the numbers arrive
  const show = (value) => (stats ? value : '...');

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Administrator</span>
        <h1>Welcome, {user.fullName}</h1>
        <p>Here is an overview of the SchoolRide system.</p>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Registered Parents</div>
          <div className="stat-value">{show(stats?.parents)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drivers</div>
          <div className="stat-value">{show(stats?.drivers)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Students</div>
          <div className="stat-value">{show(stats?.students)}</div>
        </div>
      </div>

      <div className="panel">
        <h2>Coming next</h2>
        <ul>
          <li>🚐 Manage vans and drivers</li>
          <li>🗺️ Manage routes and pickup points</li>
          <li>🪑 Assign students to vans</li>
        </ul>
      </div>
    </section>
  );
}

export default AdminDashboard;