import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { reportCategories, categoryLabel, reportStatusLabels } from '../utils/reportLabels';

// role = "driver" (emergencies) or "parent" (complaints)
function ReportCenter({ role }) {
  const request = useApi();
  const isDriver = role === 'driver';
  const categories = reportCategories[role];
  const emptyForm = { category: categories[0].value, description: '', studentId: '' };

  const [form, setForm] = useState(emptyForm);
  const [reports, setReports] = useState([]);
  const [children, setChildren] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // READ: my reports (+ my children, for parents)
  const loadData = useCallback(async () => {
    try {
      const [reportData, childData] = await Promise.all([
        request('/reports/my'),
        role === 'parent' ? request('/students/my') : Promise.resolve({ children: [] }),
      ]);
      setReports(reportData.reports);
      setChildren(childData.children);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request, role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CREATE: send a report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDriver && !window.confirm('Send this emergency report? The administrator and parents will be alerted.')) {
      return;
    }

    setSaving(true);
    try {
      const data = await request('/reports', {
        method: 'POST',
        body: {
          category: form.category,
          description: form.description,
          studentId: form.studentId || undefined,
        },
      });
      setMessage({ type: 'success', text: data.message });
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* ===== Report form ===== */}
      <form className={`form-card ${isDriver ? 'form-card-emergency' : ''}`} onSubmit={handleSubmit}>
        <h2>{isDriver ? '🚨 Report an Emergency' : '💬 Submit a Complaint or Request'}</h2>
        <p className="trip-date" style={{ marginBottom: '12px' }}>
          {isDriver
            ? 'Use this for breakdowns, accidents, or if you cannot drive today. Parents of children in your van will see an alert.'
            : 'Tell the administrator about a problem. You can follow their response below.'}
        </p>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="category">Type of problem</label>
            <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Parents can choose which child the complaint is about */}
          {!isDriver && (
            <div className="field">
              <label htmlFor="studentId">About which child? (optional)</label>
              <select id="studentId" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                <option value="">General / not about one child</option>
                {children.map((child) => (
                  <option key={child._id} value={child._id}>{child.fullName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field field-full">
            <label htmlFor="description">Details</label>
            <textarea
              id="description"
              rows="3"
              required
              minLength={10}
              maxLength={1000}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={isDriver ? 'e.g. Engine problem near Karapitiya. Waiting for a mechanic.' : 'e.g. The van was 20 minutes late this morning.'}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className={`btn ${isDriver ? 'btn-danger' : 'btn-primary'}`} disabled={saving}>
            {saving ? 'Sending...' : isDriver ? 'Send Emergency Report' : 'Submit'}
          </button>
        </div>
      </form>

      {/* ===== My reports ===== */}
      <h2 style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>My Reports ({reports.length})</h2>

      {reports.length === 0 ? (
        <div className="panel">
          <p>You have not sent any reports yet.</p>
        </div>
      ) : (
        <div className="report-list">
          {reports.map((report) => (
            <div className="report-card" key={report._id}>
              <div className="report-card-header">
                <strong>{categoryLabel(report.category, report.type)}</strong>
                <span className={`badge badge-${report.status}`}>{reportStatusLabels[report.status]}</span>
              </div>
              <p className="report-meta">
                {new Date(report.createdAt).toLocaleString()}
                {report.van && ` · Van ${report.van.vanNumber}`}
                {report.student && ` · ${report.student.fullName}`}
              </p>
              <p>{report.description}</p>
              {report.adminResponse && (
                <div className="admin-response">
                  <strong>Administrator:</strong> {report.adminResponse}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ReportCenter;