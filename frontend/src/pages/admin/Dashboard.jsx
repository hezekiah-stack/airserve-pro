import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/pages.css';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard').then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrap"><p className="muted">Loading dashboard...</p></div>;

  const s = stats?.stats || {};

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">System overview and key metrics.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total Bookings</div><div className="stat-val">{s.total_bookings}</div></div>
        <div className="stat-card"><div className="stat-label">Active Services</div><div className="stat-val">{s.active_services}</div></div>
        <div className="stat-card"><div className="stat-label">Monthly Revenue</div><div className="stat-val">₱{Number(s.monthly_revenue || 0).toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-label">Pending Approvals</div><div className="stat-val" style={{ color: 'var(--warn)' }}>{s.pending_approvals}</div></div>
        <div className="stat-card"><div className="stat-label">Customers</div><div className="stat-val">{s.total_customers}</div></div>
        <div className="stat-card"><div className="stat-label">Technicians Active</div><div className="stat-val">{s.active_technicians}</div></div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Monthly Bookings Trend</div>
          <div className="bar-chart">
            {(stats?.monthly_trend || []).map((m, i) => {
              const max = Math.max(...(stats?.monthly_trend || []).map(x => x.count), 1);
              return (
                <div key={i} className="bar-col">
                  <div className="bar" style={{ height: `${(m.count / max) * 100}%` }} title={`${m.count} bookings`} />
                  <div className="bar-label">{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Service Type Breakdown</div>
          {(stats?.service_breakdown || []).map(s => {
            const total = stats.service_breakdown.reduce((a, b) => a + b.count, 0);
            const pct   = total ? Math.round((s.count / total) * 100) : 0;
            return (
              <div key={s.name} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                  <span>{s.name}</span><span style={{ fontWeight: 600 }}>{pct}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill fill-blue" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
