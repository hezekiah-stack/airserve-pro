import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/layout.css';

const NAV_LINKS = {
  customer: [
    { to: '/dashboard',       icon: '🏠', label: 'Dashboard' },
    { to: '/book-service',    icon: '➕', label: 'Book a Service' },
    { to: '/my-bookings',     icon: '📋', label: 'My Bookings' },
    { to: '/shop',            icon: '🛒', label: 'Shop Products' },
    { to: '/service-history', icon: '📜', label: 'Service History' },
    { to: '/notifications',   icon: '🔔', label: 'Notifications' },
    { to: '/profile',         icon: '👤', label: 'My Profile' },
  ],
  admin: [
    { to: '/admin/dashboard',     icon: '📊', label: 'Dashboard' },
    { to: '/admin/bookings',      icon: '📋', label: 'Manage Bookings' },
    { to: '/admin/customers',     icon: '👥', label: 'Customers' },
    { to: '/admin/inventory',     icon: '📦', label: 'Inventory' },
    { to: '/admin/reports',       icon: '📈', label: 'Reports' },
    { to: '/admin/notifications', icon: '🔔', label: 'Notifications' },
    { to: '/admin/profile',       icon: '👤', label: 'My Profile' },
  ],
  technician: [
    { to: '/tech/dashboard',     icon: '🔧', label: 'My Tasks' },
    { to: '/tech/notifications', icon: '🔔', label: 'Notifications' },
    { to: '/tech/profile',       icon: '👤', label: 'My Profile' },
  ],
};

const ROLE_COLORS = {
  customer:   { bg: '#E3F5EC', color: '#1A7A4A', label: 'Customer' },
  admin:      { bg: '#E6F1FB', color: '#185FA5', label: 'Administrator' },
  technician: { bg: '#FFF3E0', color: '#B05800', label: 'Technician' },
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_LINKS[user?.role] || [];
  const badge = ROLE_COLORS[user?.role] || ROLE_COLORS.customer;
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Top Nav */}
      <header className="topnav">
        <div className="logo">
          <div className="logo-icon">❄️</div>
          <div>
            <div className="logo-name">AirServe Pro</div>
            <div className="logo-sub">Service Management</div>
          </div>
        </div>
        <div className="topnav-right">
          <NavLink to={`/${user?.role === 'admin' ? 'admin' : user?.role === 'technician' ? 'tech' : ''}/notifications`} className="notif-btn">
            🔔
          </NavLink>
          <div className="user-pill">
            <div className="avatar-sm">{initials}</div>
            <span>{user?.full_name?.split(' ')[0]}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="role-badge" style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </div>
          <nav className="sidebar-nav">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
