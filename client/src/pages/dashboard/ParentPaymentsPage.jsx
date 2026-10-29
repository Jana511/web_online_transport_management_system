import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import ParentNav from '../../components/ParentNav';
import { formatMoney, formatMonth, paymentMethodLabels } from '../../utils/format';
import './Dashboard.css';
import './Manage.css';

function ParentPaymentsPage() {
  const { user } = useAuth();
  const request = useApi();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, collected: 0, outstanding: 0 });
  const [receipt, setReceipt] = useState(null); // the payment whose receipt is open
  const [error, setError] = useState('');

  // READ: this parent's payment history
  const loadPayments = useCallback(async () => {
    try {
      const data = await request('/payments/my');
      setPayments(data.payments);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    }
  }, [request]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <section className="container dashboard">
      <div className="dashboard-header no-print">
        <span className="role-badge">Parent</span>
        <h1>Payments</h1>
        <p>Your monthly van fees, payment history and receipts.</p>
      </div>

      <div className="no-print">
        <ParentNav />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ===== Summary ===== */}
      <div className="stats-grid no-print">
        <div className="stat-card" style={{ borderLeftColor: '#dc2626' }}>
          <div className="stat-label">Amount Due</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatMoney(summary.outstanding)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#22c55e' }}>
          <div className="stat-label">Total Paid</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatMoney(summary.collected)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Fee Records</div>
          <div className="stat-value">{payments.length}</div>
        </div>
      </div>

      {summary.outstanding > 0 && (
        <div className="alert alert-warning no-print">
          🔔 You have {formatMoney(summary.outstanding)} to pay. Please pay the van owner and ask them to record it.
        </div>
      )}

      {/* ===== Receipt (shown when "View Receipt" is clicked) ===== */}
      {receipt && (
        <div className="receipt">
          <div className="receipt-header">
            <h2>🚐 SchoolRide</h2>
            <p className="trip-date">Payment Receipt</p>
          </div>
          <div className="receipt-row"><span>Receipt No.</span><strong>{receipt.receiptNumber}</strong></div>
          <div className="receipt-row"><span>Parent</span><span>{user.fullName}</span></div>
          <div className="receipt-row"><span>Student</span><span>{receipt.student?.fullName}</span></div>
          <div className="receipt-row"><span>Month</span><span>{formatMonth(receipt.month)}</span></div>
          <div className="receipt-row"><span>Payment Method</span><span>{paymentMethodLabels[receipt.method]}</span></div>
          <div className="receipt-row"><span>Paid On</span><span>{new Date(receipt.paidAt).toLocaleDateString()}</span></div>
          <div className="receipt-row receipt-total"><span>Amount Paid</span><span>{formatMoney(receipt.amount)}</span></div>
          <div className="form-actions no-print">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨️ Print</button>
            <button type="button" className="btn btn-light btn-sm" onClick={() => setReceipt(null)}>Close</button>
          </div>
        </div>
      )}

      {/* ===== Payment history ===== */}
      <div className="table-card no-print">
        <div className="table-card-header">
          <h2>Payment History</h2>
        </div>

        {payments.length === 0 ? (
          <p className="empty-state">No fees yet. Fees appear here once your child is using a van.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Child</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td><strong>{formatMonth(payment.month)}</strong></td>
                    <td>{payment.student?.fullName}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td><span className={`badge badge-${payment.status}`}>{payment.status}</span></td>
                    <td>
                      {payment.status === 'paid' ? (
                        <button type="button" className="btn btn-sm btn-light" onClick={() => setReceipt(payment)}>
                          View Receipt
                        </button>
                      ) : (
                        <small>Not paid yet</small>
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

export default ParentPaymentsPage;