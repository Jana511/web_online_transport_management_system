import { useCallback, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { useApi } from '../../hooks/useApi';
import { categoryLabel, reportStatusLabels } from '../../utils/reportLabels';
import './Dashboard.css';
import './Manage.css';

const statusFilters = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
];

function ReportsPage() {
  const request = useApi();
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [typeFilter, setTypeFilter] = useState('all');
  const [edits, setEdits] = useState({}); // unsaved changes: { reportId: { status, adminResponse } }
  const [message, setMessage] = useState({ type: '', text: '' });

  // READ: reports with the chosen filters
  const loadReports = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const data = await request(`/reports?${params.toString()}`);
      setReports(data.reports);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request, statusFilter, typeFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // The values shown in a report's edit fields (unsaved changes, or the saved values)
  const getEdit = (report) =>
    edits[report._id] || { status: report.status, adminResponse: report.adminResponse || '' };

  const changeEdit = (report, field, value) => {
    setEdits({ ...edits, [report._id]: { ...getEdit(report), [field]: value } });
  };

  // UPDATE: save status + response
  const saveReport = async (report) => {
    try {
      const data = await request(`/reports/${report._id}`, {
        method: 'PATCH',
        body: getEdit(report),
      });
      setMessage({ type: 'success', text: data.message });
      const remaining = { ...edits };
      delete remaining[report._id];
      setEdits(remaining);
      loadReports();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Administrator</span>
        <h1>Emergencies & Complaints</h1>
        <p>Respond to emergencies from drivers and complaints from parents.</p>
      </div>

      <AdminNav />

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* ===== Filters ===== */}
      <div className="table-card">
        <div className="table-card-header">
          <div className="filter-tabs">
            {statusFilters.map((f) => (
              <button key={f.value} type="button" className={statusFilter === f.value ? 'active' : ''} onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="btn-group">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Report type">
              <option value="all">All types</option>
              <option value="emergency">🚨 Emergencies</option>
              <option value="complaint">💬 Complaints</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== Report cards ===== */}
      {reports.length === 0 ? (
        <div className="panel">
          <p>No reports in this list.</p>
        </div>
      ) : (
        <div className="report-list">
          {reports.map((report) => {
            const edit = getEdit(report);
            return (
              <div className="report-card" key={report._id}>
                <div className="report-card-header">
                  <div className="btn-group">
                    <span className={`badge badge-${report.type}`}>{report.type}</span>
                    <strong>{categoryLabel(report.category, report.type)}</strong>
                  </div>
                  <span className={`badge badge-${report.status}`}>{reportStatusLabels[report.status]}</span>
                </div>

                <p className="report-meta">
                  From {report.reportedBy?.fullName} ({report.reportedBy?.role}) · 📞 {report.reportedBy?.phone} ·{' '}
                  {new Date(report.createdAt).toLocaleString()}
                  {report.van && ` · Van ${report.van.vanNumber}`}
                  {report.student && ` · Child: ${report.student.fullName}`}
                </p>

                <p>{report.description}</p>

                {/* ===== Admin actions ===== */}
                <div className="report-actions">
                  <div className="field">
                    <label htmlFor={`status-${report._id}`}>Status</label>
                    <select id={`status-${report._id}`} value={edit.status} onChange={(e) => changeEdit(report, 'status', e.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`response-${report._id}`}>Response to the sender</label>
                    <input
                      id={`response-${report._id}`}
                      maxLength={500}
                      value={edit.adminResponse}
                      onChange={(e) => changeEdit(report, 'adminResponse', e.target.value)}
                      placeholder="e.g. A replacement van is on the way."
                    />
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => saveReport(report)}>
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ReportsPage;