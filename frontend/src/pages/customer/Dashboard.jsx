import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import '../../styles/pages.css';

const STATUS_BADGE = {
  pending:     'badge-neutral',
  confirmed:   'badge-info',
  in_progress: 'badge-warn',
  completed:   'badge-success',
  cancelled:   'badge-danger',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/bookings').then(r => {
      setBookings(r.data.bookings || []);
    }).finally(() => setLoading(false));
  }, []);

  const active    = bookings.filter(b => ['pending','confirmed','in_progress'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed').length;

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {firstName} 👋</h1>
        <p className="page-sub">Here's an overview of your service account.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Bookings</div>
          <div className="stat-val">{active.length}</div>
          <div className="stat-sub stat-warn">{active.filter(b => b.status === 'in_progress').length} in progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Services</div>
          <div className="stat-val">{completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Payment</div>
          <div className="stat-val">{bookings.filter(b => b.payment_status === 'unpaid' && b.status !== 'cancelled').length}</div>
          <div className="stat-sub stat-warn">invoice(s) due</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="qa-btn" onClick={() => navigate('/book-service')}>
          <span>➕</span><span>Book a Service</span>
        </button>
        <button className="qa-btn" onClick={() => navigate('/my-bookings')}>
          <span>📋</span><span>My Bookings</span>
        </button>
        <button className="qa-btn" onClick={() => navigate('/shop')}>
          <span>🛒</span><span>Shop Products</span>
        </button>
      </div>

      {/* Active Bookings */}
      <div className="card">
        <div className="card-title">Active Service Requests</div>
        {loading && <p className="muted">Loading...</p>}
        {!loading && active.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No active bookings. <button className="link-btn" onClick={() => navigate('/book-service')}>Book a service →</button></p>
          </div>
        )}
        {active.map(b => (
          <div key={b.id} className="booking-item" onClick={() => navigate(`/my-bookings/${b.id}`)}>
            <div className="bi-left">
              <div className="bi-code">{b.booking_code}</div>
              <div className="bi-service">{b.service_name}</div>
              <div className="bi-meta">
                <span>📅 {b.scheduled_date}</span>
                {b.technician_name && <span>🔧 {b.technician_name}</span>}
              </div>
            </div>
            <div className="bi-right">
              <span className={`badge ${STATUS_BADGE[b.status] || 'badge-neutral'}`}>
                {b.status.replace('_', ' ')}
              </span>
              {b.payment_status === 'unpaid' && b.status !== 'cancelled' && (
                <span className="badge badge-danger" style={{ marginTop: 4 }}>Unpaid</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
