import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PaymentCheckout from '../../components/payment/PaymentCheckout';
import '../../styles/pages.css';

const STEPS = ['Service', 'Diagnostics', 'Schedule', 'Payment', 'Confirm'];

const AC_TYPES    = ['Window Type', 'Split Type', 'Inverter AC', 'Portable AC', 'Central AC'];
const PROBLEMS    = ['Not cooling', 'Leaking water', 'Strange noise', 'Bad smell', 'Not turning on', 'Routine only'];
const YEARS_OWNED = ['Less than 1 year', '1–3 years', '3–5 years', '5+ years', 'New unit'];
const LOCATIONS   = ['Residential (Home)', 'Office', 'Commercial Building'];

export default function BookService() {
  const [step, setStep]         = useState(1);
  const [services, setServices] = useState([]);
  const [slots, setSlots]       = useState([]);
  const [booking, setBooking]   = useState(null); // created booking
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  // Form state
  const [selectedService, setSelectedService] = useState(null);
  const [diag, setDiag] = useState({
    ac_type: '', problem: '', years_owned: '', location_type: '', previously_repaired: false, notes: '',
  });
  const [schedule, setSchedule] = useState({ date: '', time: '', address: '' });

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.services));
  }, []);

  useEffect(() => {
    if (schedule.date) {
      api.get(`/schedules?date=${schedule.date}`).then(r => setSlots(r.data.slots));
    }
  }, [schedule.date]);

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const submitBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/bookings', {
        service_id:     selectedService.id,
        scheduled_date: schedule.date,
        scheduled_time: schedule.time,
        address:        schedule.address,
        diagnostic: {
          ac_type:             diag.ac_type,
          problem:             diag.problem,
          years_owned:         diag.years_owned,
          location_type:       diag.location_type,
          previously_repaired: diag.previously_repaired,
          notes:               diag.notes,
        },
      });
      setBooking(data);
      goNext(); // go to payment step
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Book a Service</h1>
        <p className="page-sub">Follow the steps to request an air conditioning service.</p>
      </div>

      {/* Wizard Steps */}
      <div className="wizard">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? 'done' : n === step ? 'active' : 'pending';
          return (
            <div key={label} className="wizard-step-wrap">
              <div className={`wizard-step ${state}`}>
                <div className="ws-num">{state === 'done' ? '✓' : n}</div>
                <div className="ws-label">{label}</div>
              </div>
              {i < STEPS.length - 1 && <div className={`ws-line ${n < step ? 'done' : ''}`} />}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Service Selection ── */}
      {step === 1 && (
        <div className="step-panel">
          <div className="card">
            <div className="card-title">Select Service Type</div>
            <div className="service-grid">
              {services.map(svc => (
                <div
                  key={svc.id}
                  className={`service-card${selectedService?.id === svc.id ? ' selected' : ''}`}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="svc-icon">🔧</div>
                  <div className="svc-name">{svc.name}</div>
                  <div className="svc-price">From ₱{Number(svc.base_price).toLocaleString()}</div>
                  <div className="svc-duration">~{svc.duration_hours} hrs</div>
                </div>
              ))}
            </div>
          </div>
          <div className="step-actions">
            <button className="btn btn-primary" onClick={goNext} disabled={!selectedService}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Diagnostics ── */}
      {step === 2 && (
        <div className="step-panel">
          <div className="alert alert-info">ℹ️ Answer these questions so our technician can prepare the right tools and parts.</div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-title">1. What type of air conditioner do you have?</div>
            <div className="diag-opts">
              {AC_TYPES.map(t => (
                <div key={t} className={`diag-opt${diag.ac_type === t ? ' selected' : ''}`}
                  onClick={() => setDiag({ ...diag, ac_type: t })}>{t}</div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-title">2. What is the main problem?</div>
            <div className="diag-opts">
              {PROBLEMS.map(p => (
                <div key={p} className={`diag-opt${diag.problem === p ? ' selected' : ''}`}
                  onClick={() => setDiag({ ...diag, problem: p })}>{p}</div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">How long have you owned the unit?</label>
                <select className="form-control" value={diag.years_owned}
                  onChange={e => setDiag({ ...diag, years_owned: e.target.value })}>
                  <option value="">Select...</option>
                  {YEARS_OWNED.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Where is the unit located?</label>
                <select className="form-control" value={diag.location_type}
                  onChange={e => setDiag({ ...diag, location_type: e.target.value })}>
                  <option value="">Select...</option>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Has the unit been repaired before?</label>
              <div className="diag-opts" style={{ marginTop: 6 }}>
                {['Yes', 'No'].map(v => (
                  <div key={v}
                    className={`diag-opt${diag.previously_repaired === (v === 'Yes') ? ' selected' : ''}`}
                    onClick={() => setDiag({ ...diag, previously_repaired: v === 'Yes' })}>{v}</div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-control" rows={3}
                placeholder="Describe the problem in more detail..."
                value={diag.notes}
                onChange={e => setDiag({ ...diag, notes: e.target.value })} />
            </div>
          </div>

          <div className="step-actions">
            <button className="btn btn-outline" onClick={goBack}>← Back</button>
            <button className="btn btn-primary" onClick={goNext}
              disabled={!diag.ac_type || !diag.problem}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Schedule ── */}
      {step === 3 && (
        <div className="step-panel">
          <div className="card">
            <div className="card-title">Select Date & Time</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input type="date" className="form-control" min={today}
                  value={schedule.date}
                  onChange={e => setSchedule({ ...schedule, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Service Address</label>
                <input className="form-control" placeholder="Street, City"
                  value={schedule.address}
                  onChange={e => setSchedule({ ...schedule, address: e.target.value })} />
              </div>
            </div>

            {schedule.date && (
              <>
                <div className="card-title" style={{ marginTop: '1rem' }}>Available Time Slots</div>
                <div className="slot-grid">
                  {slots.map(slot => (
                    <div key={slot.time}
                      className={`slot${!slot.available ? ' unavail' : ''}${schedule.time === slot.time ? ' selected' : ''}`}
                      onClick={() => slot.available && setSchedule({ ...schedule, time: slot.time })}>
                      {slot.time}
                    </div>
                  ))}
                </div>
                {slots.length === 0 && <p className="muted">Loading slots...</p>}
              </>
            )}
          </div>

          <div className="step-actions">
            <button className="btn btn-outline" onClick={goBack}>← Back</button>
            <button className="btn btn-primary" onClick={submitBooking}
              disabled={!schedule.date || !schedule.time || !schedule.address || loading}>
              {loading ? 'Submitting...' : 'Confirm Booking →'}
            </button>
          </div>
          {error && <div className="pay-error">⚠️ {error}</div>}
        </div>
      )}

      {/* ── Step 4: Payment ── */}
      {step === 4 && booking && (
        <div className="step-panel">
          <PaymentCheckout
            bookingId={booking.booking_id}
            bookingCode={booking.booking_code}
            amount={selectedService.base_price}
            onSuccess={goNext}
          />
          <div className="step-actions" style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline btn-sm" onClick={goNext}>
              Skip — Pay Later
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Confirmation ── */}
      {step === 5 && (
        <div className="step-panel">
          <div className="card confirm-card">
            <div className="confirm-icon">✅</div>
            <h2 className="confirm-title">Booking Confirmed!</h2>
            <p className="confirm-sub">Your service request has been submitted. You'll receive a confirmation shortly.</p>
            <div className="confirm-detail">
              <div className="cd-row"><span>Booking ID</span><strong>{booking?.booking_code}</strong></div>
              <div className="cd-row"><span>Service</span><strong>{selectedService?.name}</strong></div>
              <div className="cd-row"><span>Date</span><strong>{schedule.date} at {schedule.time}</strong></div>
              <div className="cd-row"><span>Status</span><span className="badge badge-info">Pending Approval</span></div>
            </div>
            <div className="confirm-actions">
              <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
              <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
