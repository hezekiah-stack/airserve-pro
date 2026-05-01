import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Shared Layout
import AppLayout from './components/shared/AppLayout';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import BookService       from './pages/customer/BookService';
import MyBookings        from './pages/customer/MyBookings';
import BookingDetail     from './pages/customer/BookingDetail';
import Shop              from './pages/customer/Shop';
import ServiceHistory    from './pages/customer/ServiceHistory';

// Admin Pages
import AdminDashboard    from './pages/admin/Dashboard';
import ManageBookings    from './pages/admin/ManageBookings';
import CustomerRecords   from './pages/admin/CustomerRecords';
import Inventory         from './pages/admin/Inventory';
import Reports           from './pages/admin/Reports';

// Technician Pages
import TechDashboard from './pages/technician/Dashboard';

// Shared Pages
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed  from './pages/payment/PaymentFailed';
import ProfilePage    from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

// ─── Protected Route ──────────────────────────────────────────
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// ─── Role-based home redirect ─────────────────────────────────
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')      return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'technician') return <Navigate to="/tech/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Payment result pages */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed"  element={<PaymentFailed />} />

      {/* Root redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Customer routes */}
      <Route path="/" element={<PrivateRoute roles={['customer']}><AppLayout /></PrivateRoute>}>
        <Route path="dashboard"         element={<CustomerDashboard />} />
        <Route path="book-service"      element={<BookService />} />
        <Route path="my-bookings"       element={<MyBookings />} />
        <Route path="my-bookings/:id"   element={<BookingDetail />} />
        <Route path="shop"              element={<Shop />} />
        <Route path="service-history"   element={<ServiceHistory />} />
        <Route path="notifications"     element={<NotificationsPage />} />
        <Route path="profile"           element={<ProfilePage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AppLayout /></PrivateRoute>}>
        <Route path="dashboard"         element={<AdminDashboard />} />
        <Route path="bookings"          element={<ManageBookings />} />
        <Route path="customers"         element={<CustomerRecords />} />
        <Route path="inventory"         element={<Inventory />} />
        <Route path="reports"           element={<Reports />} />
        <Route path="notifications"     element={<NotificationsPage />} />
        <Route path="profile"           element={<ProfilePage />} />
      </Route>

      {/* Technician routes */}
      <Route path="/tech" element={<PrivateRoute roles={['technician']}><AppLayout /></PrivateRoute>}>
        <Route path="dashboard"     element={<TechDashboard />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile"       element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
