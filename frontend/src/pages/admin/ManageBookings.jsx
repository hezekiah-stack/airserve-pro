import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/pages.css';

const STATUS_BADGE = { pending:'badge-neutral', confirmed:'badge-info', in_progress:'badge-warn', completed:'badge-success', cancelled:'badge-danger' };

export default function ManageBookings() {
  const [bookings, setBookings]       = useState([]);
  const [techs, setTechs]             = useState([]);
  const [selected, setSelected]       = useState(null);
  const [assignTech, setAssignTech]   = useState('');
  const [newStatus, setNewStatus]     = useState('');
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    Promise.all([api.get('/bookings'), api.get('/users/technicians')])
      .then(([bRes, tRes]) => {
        setBookings(bRes.data.bookings || []);
        setTechs(tRes.data.technicians || []);
      }).finally(() => setLoading(false));
  }, []);

  const openModal = (b) => {
    setSelected(b);
    setAssignTech(b.technician_id || '');
    setNewStatus(b.status);
    setNotes(b.admin_notes || '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/bookings/${selected.id}/status`, {
        status: newStatus,
        technician_id: assignTech || null,
        notes,
      });
      setBookings(prev => prev.map(b => b.id === selected.id
        ? { ...b, status: newStatus, technician_id: assignTech, admin_notes: notes,
            technician_name: techs.find(t => t.id === parseInt(assignTech))?.full_name }
        : b));
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Manage Bookings</h1>
        <p className="page-sub">Review, approve, and assign technicians to service requests.</p>
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
          </select>
        </div>
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Customer</th><th>Service</th><th>Date</th><th>Technician</th><th>Status</th><th>Payment</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.booking_code}</strong></td>
                    <td>{b.customer_name}</td>
                    <td>{b.service_name}</td>
                    <td>{b.scheduled_date}</td>
                    <td>{b.technician_name || <span style={{ color: 'var(--warn)' }}>Unassigned</span>}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status.replace('_',' ')}</span></td>
                    <td><span className={`badge ${b.payment_status === 'paid' ? 'badge-success' : 'badge-warn'}`}>{b.payment_status}</span></td>
                    <td>
                      <button className={`btn btn-sm ${b.status === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => openModal(b)}>
                        {b.status === 'pending' ? 'Approve' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Manage — {selected.booking_code}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-row"><span>Customer</span><span>{selected.customer_name}</span></div>
            <div className="detail-row"><span>Service</span><span>{selected.service_name}</span></div>
            <div className="detail-row"><span>Date</span><span>{selected.scheduled_date} {selected.scheduled_time}</span></div>
            {selected.problem && <div className="detail-row"><span>Problem</span><span>{selected.problem}</span></div>}
            <div className="section-divider" />
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign Technician</label>
              <select className="form-control" value={assignTech} onChange={e => setAssignTech(e.target.value)}>
                <option value="">— Select Technician —</option>
                {techs.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Notes</label>
              <textarea className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex-end">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
