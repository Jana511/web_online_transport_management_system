import { useCallback, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { useApi } from '../../hooks/useApi';
import { formatMoney, formatMonth, currentMonth, paymentMethodLabels } from '../../utils/format';
import './Dashboard.css';
import './Manage.css';

function PaymentsPage() {
  const request = useApi();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, collected: 0, outstanding: 0 });
  const [month, setMonth] = useState(currentMonth()); // filter: which month
  const [status, setStatus] = useState('all'); // filter: all / pending / paid
  const [generate, setGenerate] = useState({ month: currentMonth(), amount: '' });
  const [methods, setMethods] = useState({}); // { paymentId: "cash" }
  const [message, setMessage] = useState({ type: '', text: '' });

  // READ: load fee records for the chosen month and status
  const loadPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (month) params.set('month', month);
      if (status !== 'all') params.set('status', status);
      const data = await request(`/payments?${params.toString()}`);
      setPayments(data.payments);
      setSummary(data.summary);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }, [request, month, status]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // CREATE: generate fees for every assigned student
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const data = await request('/payments/generate', {
        method: 'POST',
        body: { month: generate.month, amount: Number(generate.amount) },
      });
      setMessage({ type: 'success', text: data.message });
      setMonth(generate.month); // show the month that was just generated
      loadPayments();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // UPDATE: record a payment
  const markPaid = async (payment) => {
    const method = methods[payment._id];
    if (!method) {
      setMessage({ type: 'error', text: `Please choose how ${payment.student?.fullName}'s fee was paid.` });
      return;
    }
    try {
      const data = await request(`/payments/${payment._id}/pay`, {
        method: 'PATCH',
        body: { method },
      });
      setMessage({ type: 'success', text: data.message });
      loadPayments();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <section className="container dashboard">
      <div className="dashboard-header">
        <span className="role-badge">Administrator</span>
        <h1>Payments</h1>
        <p>Create monthly van fees and record payments from parents.</p>
      </div>

      <AdminNav />

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* ===== Generate monthly fees ===== */}
      <form className="form-card" onSubmit={handleGenerate}>
        <h2>Generate Monthly Fees</h2>
        <p className="trip-date" style={{ marginBottom: '12px' }}>
          Creates a fee for every student currently assigned to a van. Students who already have a fee for that month are skipped.
        </p>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="genMonth">Month</label>
            <input id="genMonth" type="month" required value={generate.month} onChange={(e) => setGenerate({ ...generate, month: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="genAmount">Monthly Fee (LKR)</label>
            <input id="genAmount" type="number" min="1" max="100000" required value={generate.amount} onChange={(e) => setGenerate({ ...generate, amount: e.target.value })} placeholder="e.g. 5000" />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Generate Fees</button>
        </div>
      </form>

      {/* ===== Summary ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Billed</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatMoney(summary.total)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#22c55e' }}>
          <div className="stat-label">Collected</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatMoney(summary.collected)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#dc2626' }}>
          <div className="stat-label">Outstanding</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatMoney(summary.outstanding)}</div>
        </div>
      </div>

      {/* ===== Fee records ===== */}
      <div className="table-card">
        <div className="table-card-header">
          <h2>Fee Records ({payments.length})</h2>
          <div className="filter-bar">
            <div className="field">
              <label htmlFor="filterMonth">Month</label>
              <input id="filterMonth" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="filterStatus">Status</label>
              <select id="filterStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="empty-state">No fee records for this month. Use "Generate Monthly Fees" above.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Parent</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <strong>{payment.student?.fullName || 'Removed student'}</strong>
                      <small>{payment.student?.grade}</small>
                    </td>
                    <td>
                      {payment.parent?.fullName}
                      <small>📞 {payment.parent?.phone}</small>
                    </td>
                    <td>{formatMonth(payment.month)}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td>
                      <span className={`badge badge-${payment.status}`}>{payment.status}</span>
                      {payment.receiptNumber && <small>{payment.receiptNumber}</small>}
                    </td>
                    <td>
                      {payment.status === 'pending' ? (
                        <div className="btn-group">
                          <select
                            value={methods[payment._id] || ''}
                            onChange={(e) => setMethods({ ...methods, [payment._id]: e.target.value })}
                            aria-label="Payment method"
                          >
                            <option value="">Method</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank transfer</option>
                            <option value="card">Card</option>
                          </select>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => markPaid(payment)}>
                            Mark Paid
                          </button>
                        </div>
                      ) : (
                        <small>
                          {paymentMethodLabels[payment.method]} · {new Date(payment.paidAt).toLocaleDateString()}
                        </small>
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

export default PaymentsPage;