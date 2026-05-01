import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PaymentCheckout from '../../components/payment/PaymentCheckout';
import '../../styles/pages.css';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking]       = useState(null);
  const [payment, setPayment]       = useState(null);
  const [showPay, setShowPay]       = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get(`/payments/booking/${id}`),
    ]).then(([bRes, pRes]) => {
      setBooking(bRes.data.booking);
      setPayment(pRes.data.payment);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrap"><p className="muted">Loading...</p></div>;
  if (!booking) return <div className="page-wrap"><p>Booking not found.</p></div>;

  const canPay = booking.payment_status === 'unpaid' && booking.status !== 'cancelled';

  const TIMELINE = [
    { key: 'pending',     label: 'Booking Submitted',     done: true },
    { key: 'confirmed',   label: 'Booking Confirmed',     done: ['confirmed','in_progress','completed'].includes(booking.status) },
    { key: 'in_progress', label: 'Service In Progress',   done: ['in_progress','completed'].includes(booking.status) },
    { key: 'payment',     label: 'Payment Processed',     done: booking.payment_status === 'paid' },
    { key: 'completed',   label: 'Service Completed',     done: booking.status === 'completed' },
  ];

  return (
    <div className="page-wrap">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{booking.booking_code}</h1>
          <p className="page-sub">{booking.service_name}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/my-bookings')}>← Back</button>
      </div>

      <div className="two-col">
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-title">Booking Information</div>
            <div className="detail-row"><span>Status</span><span className={`badge badge-${booking.status === 'completed' ? 'success' : booking.status === 'in_progress' ? 'warn' : 'info'}`}>{booking.status.replace('_',' ')}</span></div>
            <div className="detail-row"><span>Service</span><span>{booking.service_name}</span></div>
            <div className="detail-row"><span>Date</span><span>{booking.scheduled_date} at {booking.scheduled_time}</span></div>
            <div className="detail-row"><span>Address</span><span>{booking.address}</span></div>
            <div className="detail-row"><span>Technician</span><span>{booking.technician_name || 'Not yet assigned'}</span></div>
            <div className="detail-row"><span>Payment</span><span className={`badge ${booking.payment_status === 'paid' ? 'badge-success' : 'badge-warn'}`}>{booking.payment_status}</span></div>
            {booking.total_amount && (
              <div className="detail-row"><span>Amount</span><strong>₱{Number(booking.total_amount).toLocaleString()}</strong></div>
            )}
          </div>

          {booking.ac_type && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-title">Diagnostic Information</div>
              <div className="detail-row"><span>AC Type</span><span>{booking.ac_type}</span></div>
              <div className="detail-row"><span>Problem</span><span>{booking.problem}</span></div>
              <div className="detail-row"><span>Years Owned</span><span>{booking.years_owned}</span></div>
              <div className="detail-row"><span>Location</span><span>{booking.location_type}</span></div>
              {booking.notes && <div className="detail-row"><span>Notes</span><span>{booking.notes}</span></div>}
            </div>
          )}

          {/* Payment Section */}
          {canPay && (
            <div className="card">
              <div className="card-title">Online Payment</div>
              {payment?.status === 'pending' ? (
                <div className="alert alert-warn">⏳ Payment is being processed...</div>
              ) : (
                <>
                  {!showPay ? (
                    <div>
                      <p className="muted" style={{ marginBottom: '1rem' }}>Pay securely online via GCash or credit/debit card.</p>
                      <button className="btn btn-gold" onClick={() => setShowPay(true)}>
                        💳 Pay Now
                      </button>
                    </div>
                  ) : (
                    <PaymentCheckout
                      bookingId={booking.id}
                      bookingCode={booking.booking_code}
                      amount={booking.total_amount || booking.base_price}
                      onSuccess={() => window.location.reload()}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {booking.payment_status === 'paid' && (
            <div className="alert alert-success">✅ Payment confirmed. Thank you!</div>
          )}
        </div>

        {/* Timeline */}
        <div className="card">
          <div className="card-title">Service Timeline</div>
          <ul className="timeline">
            {TIMELINE.map((item, i) => (
              <li key={item.key} className="tl-item">
                <div className={`tl-dot ${item.done ? 'done' : i === TIMELINE.findIndex(t => !t.done) ? 'active' : 'pending'}`}>
                  {item.done ? '✓' : '○'}
                </div>
                {i < TIMELINE.length - 1 && <div className={`tl-line ${item.done ? 'done' : ''}`} />}
                <div className="tl-content">
                  <div className="tl-label">{item.label}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
