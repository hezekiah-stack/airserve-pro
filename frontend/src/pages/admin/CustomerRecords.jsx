import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/pages.css';

export default function CustomerRecords() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users || []))
      .finally(() => setLoading(false));
  }, []);

  const customers = users.filter(u => u.role === 'customer' &&
    (u.full_name.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase())));

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Customer Records</h1>
        <p className="page-sub">View and manage all registered customer accounts.</p>
      </div>
      <div className="card">
        <div className="table-toolbar">
          <input className="form-control" style={{ maxWidth: 280 }} placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {customers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar-sm" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>{initials(u.full_name)}</div>
                        {u.full_name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
