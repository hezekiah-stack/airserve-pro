import { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/pages.css';

const TYPE_ICON = { booking:'📋', payment:'💳', system:'⚙️', alert:'⚠️' };

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifs(r.data.notifications || []))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="page-wrap">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-sub">{unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      <div className="card">
        {loading && <p className="muted">Loading...</p>}
        {!loading && notifs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>No notifications yet.</p>
          </div>
        )}
        {notifs.map(n => (
          <div key={n.id} className={`notif-item${!n.is_read ? ' unread' : ''}`}>
            <div className="notif-icon">{TYPE_ICON[n.type] || '📢'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: 13 }}>{n.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--txt2)', lineHeight: 1.5, marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
            {!n.is_read && <div style={{ width: 8, height: 8, borderRadius:'50%', background:'var(--accent)', flexShrink:0, marginTop:4 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
