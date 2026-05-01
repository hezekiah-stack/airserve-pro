import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/pages.css';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/payments'),
    ]).then(([rRes, pRes]) => {
      setStats(rRes.data);
      setPayments(pRes.data.payments || []);
    });
  }, []);

  const s = stats?.stats || {};
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-sub">Revenue, service performance, and transaction history.</p>
      </div>

      <div className="three-col">
        <div className="card">
          <div className="card-title">Total Revenue (All Time)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>
            ₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Completed Services</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{s.total_bookings || 0}</div>
        </div>
        <div className="card">
          <div className="card-title">Active Technicians</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{s.active_technicians || 0}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-title">Payment Transactions</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Booking</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--txt3)', padding: '2rem' }}>No transactions yet.</td></tr>
              )}
              {payments.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>{p.booking_code || '—'}</td>
                  <td>{p.customer_name}</td>
                  <td style={{ textTransform: 'uppercase' }}>{p.method}</td>
                  <td>₱{Number(p.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td><span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'failed' ? 'badge-danger' : 'badge-warn'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
