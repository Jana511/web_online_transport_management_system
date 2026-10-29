import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import ParentNav from '../../components/ParentNav';
import { tripStatusLabels, formatTime } from '../../utils/tripStatus';
import './Dashboard.css';
import './Manage.css';

const emptyChild = {
  fullName: '',
  grade: '',
  school: '',
  pickupAddress: '',
  emergencyName: '',
  emergencyPhone: '',
  notes: '',
};

// The three steps of a school day
const journeySteps = [
  { key: 'pickedUpAt', label: 'Picked up from home' },
  { key: 'arrivedAt', label: 'Arrived at school' },
  { key: 'droppedOffAt', label: 'Dropped off at home' },
];

function ParentDashboard() {
  const { user } = useAuth();
  const request = useApi();
  const [children, setChildren] = useState([]);
  const [statuses, setStatuses] = useState({}); // today's journey per child
  const [form, setForm] = useState(emptyChild);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // READ: this parent's children + today's journey status
  const loadData = useCallback(async () => {
    try {
      const [childData, tripData] = await Promise.all([
        request('/students/my'),
        request('/trips/my-children'),
      ]);
      setChildren(childData.children);
      setStatuses(tripData.statuses);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request]);

  // Load now, then refresh automatically every 30 seconds
  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer); // stop the timer when leaving the page
  }, [loadData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE: add a child = request van service
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await request('/students', {
        method: 'POST',
        body: {
          fullName: form.fullName,
          grade: form.grade,
          school: form.school,
          pickupAddress: form.pickupAddress,
          notes: form.notes,
          emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone },
        },
      });
      setMessage({ type: 'success', text: data.message });
      setForm(emptyChild);
      setShowForm(false);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Parent</span>
        <h1>Welcome, {user.fullName}</h1>
        <p>Manage your children's school transport and follow today's journey.</p>
      </div>
<ParentNav />
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* ===== Add child form ===== */}
      {showForm ? (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Add a Child & Request Van Service</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="fullName">Child's Full Name</label>
              <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required minLength={3} placeholder="e.g. Nimal Perera" />
            </div>
            <div className="field">
              <label htmlFor="grade">Grade</label>
              <input id="grade" name="grade" value={form.grade} onChange={handleChange} required placeholder="e.g. Grade 5" />
            </div>
            <div className="field">
              <label htmlFor="school">School</label>
              <input id="school" name="school" value={form.school} onChange={handleChange} required placeholder="e.g. Southlands College" />
            </div>
            <div className="field field-full">
              <label htmlFor="pickupAddress">Pickup Address</label>
              <input id="pickupAddress" name="pickupAddress" value={form.pickupAddress} onChange={handleChange} required placeholder="e.g. 12 Temple Road, Galle" />
            </div>
            <div className="field">
              <label htmlFor="emergencyName">Emergency Contact Name</label>
              <input id="emergencyName" name="emergencyName" value={form.emergencyName} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="field">
              <label htmlFor="emergencyPhone">Emergency Contact Phone</label>
              <input id="emergencyPhone" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} pattern="0[0-9]{9}" title="10 digits starting with 0" placeholder="Optional, e.g. 0761234567" />
            </div>
            <div className="field field-full">
              <label htmlFor="notes">Notes for the Driver</label>
              <textarea id="notes" name="notes" rows="2" maxLength={300} value={form.notes} onChange={handleChange} placeholder="Optional, e.g. wait at the side gate" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Submit Request'}
            </button>
            <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="form-actions" style={{ marginTop: 0, marginBottom: '24px' }}>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add a Child
          </button>
          <button type="button" className="btn btn-light" onClick={loadData}>
            🔄 Refresh Status
          </button>
        </div>
      )}

      {/* ===== Children cards ===== */}
      <h2 style={{ color: 'var(--color-secondary)' }}>My Children ({children.length})</h2>
      <p className="trip-date" style={{ marginBottom: '16px' }}>
        Updates automatically every 30 seconds {lastUpdated && `· last updated ${lastUpdated}`}
      </p>

      {children.length === 0 ? (
        <div className="panel">
          <p>You have not added any children yet. Click <strong>+ Add a Child</strong> to request van service.</p>
        </div>
      ) : (
        <div className="children-grid">
          {children.map((child) => {
            const today = statuses[child._id]; // undefined if the trip has not started

            return (
              <div className="child-card" key={child._id}>
                <div className="child-card-header">
                  <h3>{child.fullName}</h3>
                  <span className={`badge badge-${child.status}`}>{child.status}</span>
                </div>
                <p>{child.grade} · {child.school}</p>
                <p>📍 {child.pickupAddress}</p>

                {child.van ? (
                  <div className="van-info">
                    <p>🚐 <strong>Van {child.van.vanNumber}</strong> {child.van.model && `(${child.van.model})`}</p>
                    {child.van.driver && (
                      <p>🧑‍✈️ {child.van.driver.fullName} · 📞 {child.van.driver.phone}</p>
                    )}
                    {child.van.route && <p>🗺️ {child.van.route.name}</p>}
                  </div>
                ) : (
                  <div className="van-info">
                    <p>⏳ Waiting for the administrator to assign a van.</p>
                  </div>
                )}

                {/* ===== Today's journey ===== */}
                {child.status === 'assigned' && (
                  <>
                    {today?.delay ? (
                      <div className="alert alert-warning" style={{ marginTop: '12px', marginBottom: 0 }}>
                        ⏰ Van delayed by {today.delay.minutes} min: {today.delay.reason}
                      </div>
                    ) : null}

                    {today?.status === 'absent' ? (
                      <p style={{ marginTop: '12px' }}>
                        <span className="badge badge-absent">{tripStatusLabels.absent}</span>
                      </p>
                    ) : (
                      <ul className="trip-steps">
                        {journeySteps.map((step) => (
                          <li key={step.key} className={today?.[step.key] ? 'done' : ''}>
                            <span className="dot" />
                            {step.label}
                            {today?.[step.key] && <small>{formatTime(today[step.key])}</small>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ParentDashboard;