import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/pages.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm]     = useState({ full_name: user?.full_name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';
  const ROLE_COLORS = { customer: ['#E3F5EC','#1A7A4A'], admin: ['#E6F1FB','#185FA5'], technician: ['#FFF3E0','#B05800'] };
  const [bg, color] = ROLE_COLORS[user?.role] || ROLE_COLORS.customer;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-sub">Manage your account information.</p>
      </div>

      {saved && <div className="alert alert-success">✅ Profile updated successfully.</div>}

      <div className="two-col">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--txt3)', textTransform: 'capitalize' }}>{user?.role}</div>
              <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{user?.email}</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" value={user?.email} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-control" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="card">
          <div className="card-title">Account Information</div>
          <div className="detail-row"><span>Account Type</span><span style={{ textTransform:'capitalize' }}>{user?.role}</span></div>
          <div className="detail-row"><span>Email</span><span>{user?.email}</span></div>
          <div className="section-divider" />
          <div className="card-title">Notification Preferences</div>
          {['Email notifications', 'SMS updates', 'Promotional offers'].map((pref, i) => (
            <div key={pref} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
              <span>{pref}</span>
              <input type="checkbox" defaultChecked={i < 2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
