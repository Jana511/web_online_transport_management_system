import { useCallback, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';
import './Manage.css';

const emptyForm = { fullName: '', email: '', phone: '', password: '' };

function DriversPage() {
  const request = useApi();
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // READ: load all drivers
  const loadDrivers = useCallback(async () => {
    try {
      const data = await request('/admin/drivers');
      setDrivers(data.drivers);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE: add a new driver
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await request('/admin/drivers', { method: 'POST', body: form });
      setMessage({
        type: 'success',
        text: `${data.message} for ${data.driver.fullName}. Share the login details with the driver privately.`,
      });
      setForm(emptyForm);
      loadDrivers(); // refresh the table
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // UPDATE: activate or deactivate a driver
  const toggleStatus = async (driver) => {
    try {
      const data = await request(`/admin/drivers/${driver._id}/status`, {
        method: 'PATCH',
        body: { isActive: !driver.isActive },
      });
      setMessage({ type: 'success', text: data.message });
      loadDrivers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Administrator</span>
        <h1>Drivers</h1>
        <p>Create driver accounts and manage their access.</p>
      </div>

      <AdminNav />

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* ===== Add driver form ===== */}
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Add a Driver</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required minLength={3} placeholder="e.g. Sunil Fernando" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="driver@example.com" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} required pattern="0[0-9]{9}" title="10 digits starting with 0" placeholder="0712345678" />
          </div>
          <div className="field">
            <label htmlFor="password">Temporary Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Create Driver'}
          </button>
        </div>
      </form>

      {/* ===== Drivers table ===== */}
      <div className="table-card">
        <div className="table-card-header">
          <h2>All Drivers ({drivers.length})</h2>
        </div>

        {drivers.length === 0 ? (
          <p className="empty-state">No drivers yet. Add one above.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Van</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver._id}>
                    <td><strong>{driver.fullName}</strong></td>
                    <td>
                      {driver.email}
                      <small>{driver.phone}</small>
                    </td>
                    <td>{driver.vanNumber || '—'}</td>
                    <td>
                      <span className={`badge ${driver.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {driver.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${driver.isActive ? 'btn-light' : 'btn-primary'}`}
                        onClick={() => toggleStatus(driver)}
                      >
                        {driver.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default DriversPage;