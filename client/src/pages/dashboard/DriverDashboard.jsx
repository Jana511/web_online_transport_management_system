import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { tripStatusLabels, formatTime } from '../../utils/tripStatus';
import './Dashboard.css';
import './Manage.css';

// The next step for each status, and its button text
const nextStep = {
  waiting: { status: 'picked_up', label: '✅ Picked Up' },
  picked_up: { status: 'at_school', label: '🏫 At School' },
  at_school: { status: 'dropped_off', label: '🏠 Dropped Off' },
};

// The time shown under each status badge
const stepTime = (entry) =>
  formatTime(entry.droppedOffAt || entry.arrivedAt || entry.pickedUpAt);

function DriverDashboard() {
  const { user } = useAuth();
  const request = useApi();
  const [van, setVan] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [delay, setDelay] = useState({ minutes: '', reason: '' });

  // READ: today's van, route and students
  const loadTrip = useCallback(async () => {
    try {
      const data = await request('/trips/today');
      setVan(data.van);
      setTrip(data.trip);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  // Helper: run an action, show its message, then reload the trip
  const runAction = async (endpoint, options) => {
    try {
      const data = await request(endpoint, options);
      setMessage({ type: 'success', text: data.message });
      loadTrip();
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      return false;
    }
  };

  const updateStatus = (studentId, status) =>
    runAction(`/trips/today/students/${studentId}`, { method: 'PATCH', body: { status } });

  const markAllArrived = () => runAction('/trips/today/arrived', { method: 'PATCH' });

  const reportDelay = async (e) => {
    e.preventDefault();
    const ok = await runAction('/trips/today/delay', {
      method: 'POST',
      body: { minutes: Number(delay.minutes), reason: delay.reason },
    });
    if (ok) setDelay({ minutes: '', reason: '' });
  };

  if (loading) {
    return (
      <section className="container dashboard">
        <p>Loading today's trip...</p>
      </section>
    );
  }

  // Count students in each state for the summary cards
  const entries = trip?.students || [];
  const count = (status) => entries.filter((s) => s.status === status).length;

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Driver</span>
        <h1>Welcome, {user.fullName}</h1>
        <p>Update each student's journey as it happens.</p>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {!van ? (
        <div className="panel">
          <h2>No van assigned</h2>
          <p>You do not have a van yet. Please contact the SchoolRide administrator.</p>
        </div>
      ) : (
        <>
          {/* ===== Summary ===== */}
          <div className="stats-grid stats-5">
            <div className="stat-card">
              <div className="stat-label">Students Today</div>
              <div className="stat-value">{entries.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">On Board</div>
              <div className="stat-value">{count('picked_up')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">At School</div>
              <div className="stat-value">{count('at_school')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Dropped Off</div>
              <div className="stat-value">{count('dropped_off')}</div>
            </div>
          </div>

          {/* ===== Van and route ===== */}
          <div className="panel">
            <h2>🚐 Van {van.vanNumber} {van.model && `(${van.model})`}</h2>
            <p className="trip-date">📅 Trip date: {trip?.date}</p>
            {van.route ? (
              <>
                <p><strong>Route:</strong> {van.route.name} → 🏫 {van.route.school}</p>
                <ul className="stop-list" style={{ marginTop: '8px' }}>
                  {van.route.stops.map((stop) => (
                    <li key={stop._id}>
                      {stop.order}. {stop.name} {stop.pickupTime && `· ${stop.pickupTime}`}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No route set for this van yet.</p>
            )}
          </div>

          {/* ===== Report a delay ===== */}
          <form className="form-card" onSubmit={reportDelay}>
            <h2>⏰ Report a Delay</h2>
            {trip?.delay?.minutes ? (
              <div className="alert alert-warning">
                Current delay: {trip.delay.minutes} min – {trip.delay.reason}
              </div>
            ) : null}
            <div className="form-grid">
              <div className="field">
                <label htmlFor="minutes">Delay (minutes)</label>
                <input id="minutes" type="number" min="1" max="180" required value={delay.minutes} onChange={(e) => setDelay({ ...delay, minutes: e.target.value })} placeholder="e.g. 15" />
              </div>
              <div className="field">
                <label htmlFor="reason">Reason</label>
                <input id="reason" required minLength={3} maxLength={200} value={delay.reason} onChange={(e) => setDelay({ ...delay, reason: e.target.value })} placeholder="e.g. Heavy traffic at Karapitiya" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-light">Notify Parents</button>
            </div>
          </form>

          {/* ===== Today's students ===== */}
          <div className="table-card">
            <div className="table-card-header">
              <h2>Today's Students ({entries.length})</h2>
              <button type="button" className="btn btn-sm btn-primary" onClick={markAllArrived} disabled={count('picked_up') === 0}>
                🏫 All On Board Arrived at School
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="empty-state">No students are assigned to your van yet.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Pickup Address</th>
                      <th>Parent</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => {
                      const student = entry.student;
                      if (!student) return null; // student was deleted
                      const next = nextStep[entry.status];

                      return (
                        <tr key={student._id}>
                          <td>
                            <strong>{student.fullName}</strong>
                            <small>{student.grade}</small>
                          </td>
                          <td>
                            {student.pickupAddress}
                            {student.notes && <small>📝 {student.notes}</small>}
                          </td>
                          <td>
                            {student.parent?.fullName}
                            <small>📞 {student.parent?.phone}</small>
                          </td>
                          <td>
                            <span className={`badge badge-${entry.status}`}>{tripStatusLabels[entry.status]}</span>
                            <small>{stepTime(entry)}</small>
                          </td>
                          <td>
                            <div className="btn-group">
                              {next && (
                                <button type="button" className="btn btn-sm btn-primary" onClick={() => updateStatus(student._id, next.status)}>
                                  {next.label}
                                </button>
                              )}
                              {entry.status === 'waiting' && (
                                <button type="button" className="btn btn-sm btn-light" onClick={() => updateStatus(student._id, 'absent')}>
                                  ❌ Absent
                                </button>
                              )}
                              {!next && entry.status !== 'waiting' && <small>Done ✓</small>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default DriverDashboard;