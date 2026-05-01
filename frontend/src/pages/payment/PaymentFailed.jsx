import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../styles/auth.css';

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const bookingId = params.get('booking');
  const navigate  = useNavigate();

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: '1rem' }}>❌</div>
        <div className="auth-logo-name">Payment Failed</div>
        <p style={{ color: 'var(--txt3)', margin: '0.75rem 0 1.5rem' }}>
          Your payment was not completed. Please try again or choose a different payment method.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {bookingId && (
            <button className="btn btn-primary" onClick={() => navigate(`/my-bookings/${bookingId}`)}>
              Try Again
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
