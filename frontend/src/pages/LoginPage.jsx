import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const DEMO_ACCOUNTS = [
  { email: 'customer@demo.com', name: 'Jane Dela Cruz', role: 'Customer',   initials: 'JD', color: '#1A7A4A', bg: '#E3F5EC' },
  { email: 'admin@demo.com',    name: 'Mark Gonzales',  role: 'Admin',       initials: 'MG', color: '#185FA5', bg: '#E6F1FB' },
  { email: 'tech@demo.com',     name: 'Rico Castillo',  role: 'Technician',  initials: 'RC', color: '#B05800', bg: '#FFF3E0' },
];

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin')      navigate('/admin/dashboard');
      else if (user.role === 'technician') navigate('/tech/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email) => {
    setForm({ email, password: 'demo1234' });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">❄️</div>
          <div className="auth-logo-name">AirServe Pro</div>
          <div className="auth-logo-sub">Air Conditioning Service Management</div>
        </div>

        <h2 className="auth-title">Sign in to your account</h2>
        <p className="auth-sub">Enter your credentials below to continue.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="demo-accounts">
          <div className="demo-label">Demo Accounts (password: demo1234)</div>
          {DEMO_ACCOUNTS.map(acc => (
            <div key={acc.email} className="demo-acc" onClick={() => quickLogin(acc.email)}>
              <div className="demo-avatar" style={{ background: acc.bg, color: acc.color }}>
                {acc.initials}
              </div>
              <div>
                <div className="demo-name">{acc.name}</div>
                <div className="demo-role">{acc.role}</div>
              </div>
              <span className="demo-badge" style={{ background: acc.bg, color: acc.color }}>
                {acc.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
