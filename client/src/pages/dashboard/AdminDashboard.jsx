import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import AdminNav from '../../components/AdminNav';
import './Dashboard.css';
import './Manage.css';

function AdminDashboard() {
  const { user } = useAuth();
  const request = useApi();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // Load the numbers when the page opens
  useEffect(() => {
    request('/admin/stats')
      .then((data) => setStats(data.stats))
      .catch((err) => setError(err.message));
  }, [request]);

  // Show "..." until the numbers arrive
  const show = (key) => (stats ? stats[key] : '...');

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Administrator</span>
        <h1>Welcome, {user.fullName}</h1>
        <p>Here is an overview of the SchoolRide system.</p>
      </div>

      <AdminNav />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid stats-5">
        <div className={`stat-card ${stats?.pendingRequests > 0 ? 'highlight' : ''}`}>
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value">{show('pendingRequests')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Students</div>
          <div className="stat-value">{show('students')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Parents</div>
          <div className="stat-value">{show('parents')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drivers</div>
          <div className="stat-value">{show('drivers')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Vans</div>
          <div className="stat-value">{show('vans')}</div>
        </div>
      </div>

      <div className="quick-links">
        <Link to="/admin/students" className="quick-link">
          <h3>🎒 Assign Students</h3>
          <p>Review van requests and assign students to vans.</p>
        </Link>
        <Link to="/admin/vans" className="quick-link">
          <h3>🚐 Manage Vans</h3>
          <p>Add vans, set seats, and choose a driver and route.</p>
        </Link>
        <Link to="/admin/drivers" className="quick-link">
          <h3>🧑‍✈️ Manage Drivers</h3>
          <p>Create driver accounts and control their access.</p>
        </Link>
        <Link to="/admin/routes" className="quick-link">
          <h3>🗺️ Manage Routes</h3>
          <p>Create routes and set the order of pickup stops.</p>
        </Link>
      </div>
    </section>
  );
}

export default AdminDashboard;