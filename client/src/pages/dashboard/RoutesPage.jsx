import { useCallback, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';
import './Manage.css';

const emptyStop = { name: '', pickupTime: '' };

function RoutesPage() {
  const request = useApi();
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ name: '', school: '' });
  const [stops, setStops] = useState([{ ...emptyStop }]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // READ: load all routes
  const loadRoutes = useCallback(async () => {
    try {
      const data = await request('/routes');
      setRoutes(data.routes);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  // ===== Stop editor helpers =====
  const updateStop = (index, field, value) => {
    setStops(stops.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)));
  };

  const addStop = () => setStops([...stops, { ...emptyStop }]);

  const removeStop = (index) => setStops(stops.filter((_, i) => i !== index));

  // Move a stop up (-1) or down (+1) to change the pickup order
  const moveStop = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= stops.length) return;
    const copy = [...stops];
    [copy[index], copy[target]] = [copy[target], copy[index]]; // swap the two stops
    setStops(copy);
  };

  // CREATE: save the route
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Keep only stops with a name, and number them 1, 2, 3... in the current order
    const cleanStops = stops
      .filter((stop) => stop.name.trim())
      .map((stop, index) => ({
        name: stop.name.trim(),
        order: index + 1,
        pickupTime: stop.pickupTime || undefined,
      }));

    if (cleanStops.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one stop.' });
      return;
    }

    setSaving(true);
    try {
      const data = await request('/routes', {
        method: 'POST',
        body: { ...form, stops: cleanStops },
      });
      setMessage({ type: 'success', text: `${data.message}: ${data.route.name}` });
      setForm({ name: '', school: '' });
      setStops([{ ...emptyStop }]);
      loadRoutes();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // DELETE: remove a route (the backend blocks this if a van uses it)
  const deleteRoute = async (route) => {
    if (!window.confirm(`Delete the route "${route.name}"?`)) return;
    try {
      const data = await request(`/routes/${route._id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: data.message });
      loadRoutes();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Administrator</span>
        <h1>Routes</h1>
        <p>Create van routes and set the order of pickup stops.</p>
      </div>

      <AdminNav />

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* ===== Add route form ===== */}
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Create a Route</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Route Name</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Galle Town Route" />
          </div>
          <div className="field">
            <label htmlFor="school">School</label>
            <input id="school" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} required placeholder="e.g. Southlands College" />
          </div>
        </div>

        <h2 style={{ marginTop: '24px' }}>Pickup Stops (in order)</h2>
        {stops.map((stop, index) => (
          <div className="stop-row" key={index}>
            <span className="stop-number">{index + 1}</span>
            <input
              value={stop.name}
              onChange={(e) => updateStop(index, 'name', e.target.value)}
              placeholder="Stop name, e.g. Galle Bus Stand"
              aria-label={`Stop ${index + 1} name`}
            />
            <input
              type="time"
              value={stop.pickupTime}
              onChange={(e) => updateStop(index, 'pickupTime', e.target.value)}
              aria-label={`Stop ${index + 1} pickup time`}
            />
            <div className="btn-group">
              <button type="button" className="btn btn-sm btn-light" onClick={() => moveStop(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
              <button type="button" className="btn btn-sm btn-light" onClick={() => moveStop(index, 1)} disabled={index === stops.length - 1} aria-label="Move down">↓</button>
              <button type="button" className="btn btn-sm btn-light" onClick={() => removeStop(index)} disabled={stops.length === 1} aria-label="Remove stop">✕</button>
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="button" className="btn btn-light" onClick={addStop}>+ Add Stop</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Route'}
          </button>
        </div>
      </form>

      {/* ===== Routes table ===== */}
      <div className="table-card">
        <div className="table-card-header">
          <h2>All Routes ({routes.length})</h2>
        </div>

        {routes.length === 0 ? (
          <p className="empty-state">No routes yet. Create one above.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Stops</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route._id}>
                    <td>
                      <strong>{route.name}</strong>
                      <small>🏫 {route.school}</small>
                    </td>
                    <td>
                      <ul className="stop-list">
                        {route.stops.map((stop) => (
                          <li key={stop._id}>
                            {stop.order}. {stop.name}
                            {stop.pickupTime && <small style={{ display: 'inline' }}> · {stop.pickupTime}</small>}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => deleteRoute(route)}>
                        Delete
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

export default RoutesPage;