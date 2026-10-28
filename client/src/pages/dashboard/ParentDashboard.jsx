import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function ParentDashboard() {
  const { user } = useAuth();

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Parent</span>
        <h1>Welcome, {user.fullName}</h1>
        <p>Manage your children's school transport here.</p>
      </div>

      <div className="panel">
        <h2>My Details</h2>
        <ul>
          <li>📧 {user.email}</li>
          <li>📞 {user.phone}</li>
        </ul>
      </div>

      <div className="panel">
        <h2>My Children</h2>
        <p>You will be able to add your children and request van service here soon.</p>
      </div>
    </section>
  );
}

export default ParentDashboard;