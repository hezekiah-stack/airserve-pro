import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages.css';

export default function TechDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [techNotes, setTechNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data.bookings || []));
  }, []);

  const today      = new Date().toISOString().split('T')[0];
  const todayTasks = bookings.filter(b => b.scheduled_date === today);
  const upcoming   = bookings.filter(b => b.scheduled_date > today);
  const completed  = bookings.filter(b => b.status === 'completed').length;

  const openUpdate = (b) => {
    setSelected(b);
    setNewStatus(b.status);
    setTechNotes(b.tech_notes || '');
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/bookings/${selected.id}/status`, { status: newStatus, notes: techNotes });
      setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, status: newStatus, tech_notes: techNotes } : b));
      setSelected(null);
    } catch (err) {
      alert('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_BADGE = { pending:'badge-neutral', confirmed:'badge-info', in_progress:'badge-warn', completed:'badge-success' };
  const BORDER_COLOR = { pending:'var(--border)', confirmed:'var(--accent)', in_progress:'var(--warn)', completed:'var(--success)' };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">My Work Queue</h1>
        <p className="page-sub">Today's assignments and upcoming tasks — {user?.full_name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Today's Tasks</div><div className="stat-val">{todayTasks.length}</div></div>
        <div className="stat-card"><div className="stat-label">Upcoming</div><div className="stat-val">{upcoming.length}</div></div>
        <div className="stat-card"><div className="stat-label">Completed Total</div><div className="stat-val">{completed}</div></div>
      </div>

      <div className="card-title" style={{ marginBottom: '0.75rem' }}>Today's Tasks</div>
      {todayTasks.length === 0 && <div className="alert alert-info">ℹ️ No tasks scheduled for today.</div>}
      {todayTasks.map(b => (
        <div key={b.id} className="task-card" style={{ borderLeftColor: BORDER_COLOR[b.status] }}>
          <div className="task-header">
            <span className="task-id">{b.booking_code}</span>
            <span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status.replace('_',' ')}</span>
          </div>
          <div className="task-title">{b.service_name} — {b.customer_name}</div>
          <div className="task-meta">
            <span>📅 {b.scheduled_date} {b.scheduled_time}</span>
            <span>📍 {b.address}</span>
          </div>
          {b.problem && <div className="alert alert-info" style={{ marginTop: '0.75rem' }}>ℹ️ Problem: {b.problem}</div>}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => openUpdate(b)}>Update Progress</button>
          </div>
        </div>
      ))}

      {upcoming.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem', marginTop: '1.5rem' }}>Upcoming Tasks</div>
          {upcoming.map(b => (
            <div key={b.id} className="task-card">
              <div className="task-header">
                <span className="task-id">{b.booking_code}</span>
                <span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status.replace('_',' ')}</span>
              </div>
              <div className="task-title">{b.service_name} — {b.customer_name}</div>
              <div className="task-meta">
                <span>📅 {b.scheduled_date} {b.scheduled_time}</span>
                <span>📍 {b.address}</span>
              </div>
            </div>
          ))}
        </>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Update Progress — {selected.booking_code}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="confirmed">Confirmed — En Route</option>
                <option value="in_progress">In Progress — Working</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Work Notes</label>
              <textarea className="form-control" rows={4}
                placeholder="Describe work performed, parts used..."
                value={techNotes} onChange={e => setTechNotes(e.target.value)} />
            </div>
            <div className="flex-end">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Save Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
