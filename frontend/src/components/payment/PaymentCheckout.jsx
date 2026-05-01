import { useState } from 'react';
import api from '../../utils/api';
import '../../styles/payment.css';

export default function PaymentCheckout({ bookingId, amount, bookingCode, onSuccess }) {
  const [method, setMethod]   = useState('gcash');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Card form fields
  const [card, setCard] = useState({
    number: '', exp_month: '', exp_year: '', cvc: '',
  });
  const [billing, setBilling] = useState({
    name: '', email: '', phone: '',
    address: { line1: '', city: '', state: '', postal_code: '', country: 'PH' },
  });

  // ─── GCash Payment ───────────────────────────────────────────
  const handleGCash = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/payments/gcash/create', {
        booking_id: bookingId,
        amount,
      });
      // Redirect to GCash checkout page
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err.response?.data?.message || 'GCash payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Card Payment ─────────────────────────────────────────────
  const handleCard = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/payments/card/create', {
        booking_id: bookingId,
        amount,
        billing,
        card: {
          number:    card.number.replace(/\s/g, ''),
          exp_month: parseInt(card.exp_month),
          exp_year:  parseInt(card.exp_year),
          cvc:       card.cvc,
        },
      });

      if (data.requires_action && data.redirect_url) {
        // 3D Secure redirect
        window.location.href = data.redirect_url;
      } else if (data.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Card payment failed. Check card details.');
    } finally {
      setLoading(false);
    }
  };

  const formatCard = (val) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  return (
    <div className="payment-wrap">
      <div className="payment-summary">
        <div className="pay-sum-title">Order Summary</div>
        <div className="pay-sum-row"><span>Booking</span><span>{bookingCode}</span></div>
        <div className="pay-sum-row pay-sum-total"><span>Total Amount</span><span>₱{Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
      </div>

      {/* Payment Method Selector */}
      <div className="pay-methods">
        <div className="pay-methods-label">Select Payment Method</div>
        <div className="pay-method-grid">
          {[
            { id: 'gcash', icon: '📱', name: 'GCash',        sub: 'Filipino mobile wallet' },
            { id: 'card',  icon: '💳', name: 'Credit / Debit Card', sub: 'Visa, Mastercard' },
          ].map(m => (
            <div
              key={m.id}
              className={`pay-method-btn${method === m.id ? ' selected' : ''}`}
              onClick={() => setMethod(m.id)}
            >
              <span className="pay-method-icon">{m.icon}</span>
              <div>
                <div className="pay-method-name">{m.name}</div>
                <div className="pay-method-sub">{m.sub}</div>
              </div>
              <div className={`pay-radio${method === m.id ? ' checked' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {/* ─── GCash Instructions ─── */}
      {method === 'gcash' && (
        <div className="gcash-panel">
          <div className="gcash-logo">
            <span style={{ fontSize: 32 }}>📱</span>
            <div>
              <div className="gcash-title">Pay via GCash</div>
              <div className="gcash-sub">You will be redirected to GCash to complete your payment securely.</div>
            </div>
          </div>
          <ol className="gcash-steps">
            <li>Click <strong>Pay with GCash</strong> below</li>
            <li>You'll be redirected to the GCash payment page</li>
            <li>Log in to your GCash account and confirm the payment</li>
            <li>You'll be returned here automatically after payment</li>
          </ol>
          <div className="gcash-note">
            Powered by <strong>PayMongo</strong> — your payment is secure and encrypted.
          </div>
        </div>
      )}

      {/* ─── Card Form ─── */}
      {method === 'card' && (
        <div className="card-form">
          <div className="card-form-title">Card Details</div>
          <div className="form-group">
            <label className="form-label">Cardholder Name</label>
            <input
              className="form-control"
              placeholder="Name as on card"
              value={billing.name}
              onChange={e => setBilling({ ...billing, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input
              className="form-control"
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={e => setCard({ ...card, number: formatCard(e.target.value) })}
              maxLength={19}
            />
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Exp. Month</label>
              <input className="form-control" placeholder="MM" maxLength={2}
                value={card.exp_month} onChange={e => setCard({ ...card, exp_month: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Exp. Year</label>
              <input className="form-control" placeholder="YYYY" maxLength={4}
                value={card.exp_year} onChange={e => setCard({ ...card, exp_year: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">CVC</label>
              <input className="form-control" placeholder="123" maxLength={4}
                value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} />
            </div>
          </div>
          <div className="card-form-title" style={{ marginTop: '1rem' }}>Billing Details</div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="your@email.com"
              value={billing.email} onChange={e => setBilling({ ...billing, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-control" placeholder="09XX-XXX-XXXX"
              value={billing.phone} onChange={e => setBilling({ ...billing, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-control" placeholder="Street address"
              value={billing.address.line1}
              onChange={e => setBilling({ ...billing, address: { ...billing.address, line1: e.target.value } })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-control" placeholder="Quezon City"
                value={billing.address.city}
                onChange={e => setBilling({ ...billing, address: { ...billing.address, city: e.target.value } })} />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input className="form-control" placeholder="1100"
                value={billing.address.postal_code}
                onChange={e => setBilling({ ...billing, address: { ...billing.address, postal_code: e.target.value } })} />
            </div>
          </div>
        </div>
      )}

      {error && <div className="pay-error">⚠️ {error}</div>}

      <button
        className="btn btn-pay"
        onClick={method === 'gcash' ? handleGCash : handleCard}
        disabled={loading}
      >
        {loading
          ? 'Processing...'
          : `Pay ₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })} via ${method === 'gcash' ? 'GCash' : 'Card'}`}
      </button>

      <div className="pay-secure-note">
        🔒 Payments are secured by <strong>PayMongo</strong>. We do not store your card details.
      </div>
    </div>
  );
}
