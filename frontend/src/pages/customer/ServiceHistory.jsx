import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/pages.css';

export default function ServiceHistory() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings').then(r => {
      setBookings((r.data.bookings || []).filter(b => b.status === 'completed'));
    });
  }, []);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Service History</h1>
        <p className="page-sub">Complete record of all your completed services.</p>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Service</th><th>Technician</th><th>Amount</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--txt3)', padding: '2rem' }}>No completed services yet.</td></tr>
              )}
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.scheduled_date}</td>
                  <td>{b.service_name}</td>
                  <td>{b.technician_name || '—'}</td>
                  <td>{b.total_amount ? `₱${Number(b.total_amount).toLocaleString()}` : '—'}</td>
                  <td><span className={`badge ${b.payment_status === 'paid' ? 'badge-success' : 'badge-warn'}`}>{b.payment_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
