import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/pages.css';

const STATUS_BADGE = {
  pending:     'badge-neutral',
  confirmed:   'badge-info',
  in_progress: 'badge-warn',
  completed:   'badge-success',
  cancelled:   'badge-danger',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-sub">Track all your service requests and appointments.</p>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <select className="form-control" style={{ width: 160 }} value={filter}
            onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/book-service')}>
            + New Booking
          </button>
        </div>

        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th><th>Service</th><th>Date</th>
                  <th>Technician</th><th>Status</th><th>Payment</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--txt3)', padding: '2rem' }}>No bookings found.</td></tr>
                )}
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.booking_code}</strong></td>
                    <td>{b.service_name}</td>
                    <td>{b.scheduled_date}</td>
                    <td>{b.technician_name || <span style={{ color: 'var(--txt3)' }}>TBA</span>}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status.replace('_',' ')}</span></td>
                    <td>
                      <span className={`badge ${b.payment_status === 'paid' ? 'badge-success' : 'badge-warn'}`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => navigate(`/my-bookings/${b.id}`)}>Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
