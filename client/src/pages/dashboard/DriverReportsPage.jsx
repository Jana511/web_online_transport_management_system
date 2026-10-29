import DriverNav from '../../components/DriverNav';
import ReportCenter from '../../components/ReportCenter';
import './Dashboard.css';
import './Manage.css';

function DriverReportsPage() {
  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Driver</span>
        <h1>Report a Problem</h1>
        <p>Report breakdowns, accidents or absences. The administrator and parents will be alerted.</p>
      </div>

      <DriverNav />

      <ReportCenter role="driver" />
    </section>
  );
}

export default DriverReportsPage;