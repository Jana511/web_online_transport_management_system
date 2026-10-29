import { useCallback, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';
import './Manage.css';

const filters = [
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'all', label: 'All' },
];

function StudentsPage() {
  const request = useApi();
  const [students, setStudents] = useState([]);
  const [vans, setVans] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedVan, setSelectedVan] = useState({}); // { studentId: vanId }
  const [message, setMessage] = useState({ type: '', text: '' });

  // READ: load students (filtered) and vans
  const loadData = useCallback(async () => {
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const [studentData, vanData] = await Promise.all([
        request(`/students${query}`),
        request('/vans'),
      ]);
      setStudents(studentData.students);
      setVans(vanData.vans);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request, filter]);

  // Runs when the page opens AND every time the filter changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // UPDATE: assign a student to the chosen van
  const assignVan = async (student) => {
    const vanId = selectedVan[student._id];
    if (!vanId) {
      setMessage({ type: 'error', text: `Please choose a van for ${student.fullName} first.` });
      return;
    }
    try {
      const data = await request(`/students/${student._id}/assign`, {
        method: 'PATCH',
        body: { vanId },
      });
      setMessage({ type: 'success', text: data.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message }); // e.g. "Van NB-1234 is full"
    }
  };

  // UPDATE: remove a student from their van
  const unassignVan = async (student) => {
    if (!window.confirm(`Remove ${student.fullName} from van ${student.van?.vanNumber}?`)) return;
    try {
      const data = await request(`/students/${student._id}/unassign`, { method: 'PATCH' });
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
        <h1>Students</h1>
        <p>Review van requests from parents and assign students to vans.</p>
      </div>

      <AdminNav />

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="table-card">
        <div className="table-card-header">
          <h2>Students ({students.length})</h2>
          <div className="filter-tabs">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={filter === f.value ? 'active' : ''}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {students.length === 0 ? (
          <p className="empty-state">No students in this list.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Parent</th>
                  <th>Pickup Address</th>
                  <th>Status</th>
                  <th>Van</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <strong>{student.fullName}</strong>
                      <small>{student.grade} · {student.school}</small>
                    </td>
                    <td>
                      {student.parent?.fullName}
                      <small>{student.parent?.phone}</small>
                    </td>
                    <td>{student.pickupAddress}</td>
                    <td>
                      <span className={`badge badge-${student.status}`}>{student.status}</span>
                    </td>
                    <td>{student.van ? student.van.vanNumber : '—'}</td>
                    <td>
                      {student.status === 'assigned' ? (
                        <button type="button" className="btn btn-sm btn-light" onClick={() => unassignVan(student)}>
                          Remove
                        </button>
                      ) : (
                        <div className="btn-group">
                          <select
                            value={selectedVan[student._id] || ''}
                            onChange={(e) => setSelectedVan({ ...selectedVan, [student._id]: e.target.value })}
                            aria-label={`Choose a van for ${student.fullName}`}
                          >
                            <option value="">Choose van</option>
                            {vans
                              .filter((van) => van.isActive)
                              .map((van) => {
                                const isFull = van.assignedCount >= van.capacity;
                                return (
                                  <option key={van._id} value={van._id} disabled={isFull}>
                                    {van.vanNumber} ({van.assignedCount}/{van.capacity}){isFull ? ' – Full' : ''}
                                  </option>
                                );
                              })}
                          </select>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => assignVan(student)}>
                            Assign
                          </button>
                        </div>
                      )}
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

export default StudentsPage;