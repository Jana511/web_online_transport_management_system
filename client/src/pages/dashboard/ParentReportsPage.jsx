import ParentNav from '../../components/ParentNav';
import ReportCenter from '../../components/ReportCenter';
import './Dashboard.css';
import './Manage.css';

function ParentReportsPage() {
  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Parent</span>
        <h1>Complaints & Requests</h1>
        <p>Report a problem to the SchoolRide administrator and follow the response.</p>
      </div>

      <ParentNav />

      <ReportCenter role="parent" />
    </section>
  );
}

export default ParentReportsPage;