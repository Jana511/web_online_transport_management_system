import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function DriverDashboard() {
  const { user } = useAuth();

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Driver</span>
        <h1>Welcome, {user.fullName}</h1>
        <p>View your route and today's pickup list here.</p>
      </div>

      <div className="panel">
        <h2>Today's Pickup List</h2>
        <p>Your assigned van, route and student list will appear here soon.</p>
      </div>
    </section>
  );
}

export default DriverDashboard;