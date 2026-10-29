import { useCallback, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';
import './Manage.css';

const emptyForm = { vanNumber: '', model: '', capacity: '', driver: '', route: '' };

function VansPage() {
  const request = useApi();
  const [vans, setVans] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // READ: load vans, drivers and routes at the same time
  const loadData = useCallback(async () => {
    try {
      const [vanData, driverData, routeData] = await Promise.all([
        request('/vans'),
        request('/admin/drivers'),
        request('/routes'),
      ]);
      setVans(vanData.vans);
      setDrivers(driverData.drivers);
      setRoutes(routeData.routes);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Only active drivers who do not already drive a van can be chosen
    const availableDrivers = drivers.filter(
    (driver) => driver.isActive && driver.isApproved !== false && !driver.vanNumber
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE: add a new van
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await request('/vans', {
        method: 'POST',
        body: {
          vanNumber: form.vanNumber,
          model: form.model,
          capacity: Number(form.capacity),
          driver: form.driver || null, // empty = no driver yet
          route: form.route || null, // empty = no route yet
        },
      });
      setMessage({ type: 'success', text: `${data.message}: ${data.van.vanNumber}` });
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // DELETE: remove a van (the backend blocks this if students are assigned)
  const deleteVan = async (van) => {
    if (!window.confirm(`Delete van ${van.vanNumber}?`)) return;
    try {
      const data = await request(`/vans/${van._id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: data.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Administrator</span>
        <h1>Vans</h1>
        <p>Register vans, set seating capacity, and choose a driver and route.</p>
      </div>

      <AdminNav />

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* ===== Add van form ===== */}
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Add a Van</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="vanNumber">Van Number</label>
            <input id="vanNumber" name="vanNumber" value={form.vanNumber} onChange={handleChange} required placeholder="e.g. NB-5678" />
          </div>
          <div className="field">
            <label htmlFor="model">Model</label>
            <input id="model" name="model" value={form.model} onChange={handleChange} placeholder="e.g. Toyota KDH" />
          </div>
          <div className="field">
            <label htmlFor="capacity">Seats (capacity)</label>
            <input id="capacity" name="capacity" type="number" min="1" max="60" value={form.capacity} onChange={handleChange} required placeholder="e.g. 15" />
          </div>
          <div className="field">
            <label htmlFor="driver">Driver</label>
            <select id="driver" name="driver" value={form.driver} onChange={handleChange}>
              <option value="">— No driver yet —</option>
              {availableDrivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="route">Route</label>
            <select id="route" name="route" value={form.route} onChange={handleChange}>
              <option value="">— No route yet —</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add Van'}
          </button>
        </div>
      </form>

      {/* ===== Vans table ===== */}
      <div className="table-card">
        <div className="table-card-header">
          <h2>All Vans ({vans.length})</h2>
        </div>

        {vans.length === 0 ? (
          <p className="empty-state">No vans yet. Add one above.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Van</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Seats Used</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vans.map((van) => {
                  const isFull = van.assignedCount >= van.capacity;
                  const percent = Math.min(100, (van.assignedCount / van.capacity) * 100);

                  return (
                    <tr key={van._id}>
                      <td>
                        <strong>{van.vanNumber}</strong>
                        <small>{van.model || '—'}</small>
                      </td>
                      <td>
                        {van.driver ? (
                          <>
                            {van.driver.fullName}
                            <small>{van.driver.phone}</small>
                          </>
                        ) : (
                          <small>Not assigned</small>
                        )}
                      </td>
                      <td>{van.route ? van.route.name : <small>Not assigned</small>}</td>
                      <td>
                        {van.assignedCount} / {van.capacity} {isFull && <strong style={{ color: '#dc2626' }}>FULL</strong>}
                        <div className="seat-bar">
                          <div className={`seat-bar-fill ${isFull ? 'full' : ''}`} style={{ width: `${percent}%` }} />
                        </div>
                      </td>
                      <td>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => deleteVan(van)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default VansPage;