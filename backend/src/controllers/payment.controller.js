const db = require('../config/db');
const paymongoService = require('../services/paymongo.service');

/**
 * POST /api/payments/gcash/create
 * Creates a GCash payment source and returns the redirect URL.
 * Customer is redirected to GCash to complete payment.
 */
const createGCashPayment = async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    // Verify booking belongs to this customer
    const [bookings] = await db.query(
      'SELECT * FROM service_requests WHERE id = ? AND customer_id = ?',
      [booking_id, req.user.id]
    );
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];
    const redirectSuccess = `${process.env.FRONTEND_URL}/payment/success?booking=${booking_id}`;
    const redirectFailed  = `${process.env.FRONTEND_URL}/payment/failed?booking=${booking_id}`;

    // Create GCash source via PayMongo
    const source = await paymongoService.createGCashSource({
      amount,
      description: `AirServe Pro - Booking #${booking.booking_code}`,
      bookingId: booking_id,
      redirectSuccess,
      redirectFailed,
    });

    // Save pending payment record in DB
    await db.query(
      `INSERT INTO payments (booking_id, customer_id, amount, currency, method, status, paymongo_source_id, paymongo_checkout_url)
       VALUES (?, ?, ?, 'PHP', 'gcash', 'pending', ?, ?)`,
      [booking_id, req.user.id, amount, source.id, source.attributes.redirect.checkout_url]
    );

    res.json({
      success: true,
      checkout_url: source.attributes.redirect.checkout_url,
      source_id: source.id,
    });
  } catch (err) {
    console.error('GCash payment error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to create GCash payment.' });
  }
};

/**
 * POST /api/payments/card/create
 * Creates a PaymentIntent + attaches card payment method.
 */
const createCardPayment = async (req, res) => {
  try {
    const { booking_id, amount, billing, card } = req.body;

    const [bookings] = await db.query(
      'SELECT * FROM service_requests WHERE id = ? AND customer_id = ?',
      [booking_id, req.user.id]
    );
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    const booking = bookings[0];

    // Step 1: Create PaymentIntent
    const intent = await paymongoService.createPaymentIntent({
      amount,
      description: `AirServe Pro - Booking #${booking.booking_code}`,
      metadata: { booking_id: String(booking_id), customer_id: String(req.user.id) },
    });

    // Step 2: Create PaymentMethod (card)
    const method = await paymongoService.createPaymentMethod({ type: 'card', billing, card });

    // Step 3: Attach method to intent
    const returnUrl = `${process.env.FRONTEND_URL}/payment/success?booking=${booking_id}`;
    const attached = await paymongoService.attachPaymentMethod({
      paymentIntentId: intent.id,
      paymentMethodId: method.id,
      returnUrl,
    });

    const status = attached.attributes.status;

    // Save payment record
    await db.query(
      `INSERT INTO payments (booking_id, customer_id, amount, currency, method, status, paymongo_intent_id)
       VALUES (?, ?, ?, 'PHP', 'card', ?, ?)`,
      [booking_id, req.user.id, amount, status === 'succeeded' ? 'paid' : 'pending', intent.id]
    );

    // If 3D Secure required
    if (status === 'awaiting_next_action') {
      return res.json({
        success: true,
        requires_action: true,
        redirect_url: attached.attributes.next_action?.redirect?.url,
      });
    }

    if (status === 'succeeded') {
      await db.query(
        'UPDATE service_requests SET payment_status = ? WHERE id = ?',
        ['paid', booking_id]
      );
    }

    res.json({ success: true, status, intent_id: intent.id });
  } catch (err) {
    console.error('Card payment error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Card payment failed.' });
  }
};

/**
 * POST /api/payments/webhook
 * PayMongo calls this URL when payment events happen.
 * Set webhook URL in PayMongo dashboard: https://yourserver.com/api/payments/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['paymongo-signature'];
    const rawBody   = JSON.stringify(req.body);

    // Verify signature
    const isValid = paymongoService.verifyWebhookSignature(
      rawBody,
      signature,
      process.env.PAYMONGO_WEBHOOK_SECRET
    );
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body.data;
    const type  = event.attributes.type;
    const data  = event.attributes.data;

    console.log('PayMongo Webhook:', type);

    if (type === 'source.chargeable') {
      // GCash source is now chargeable — create the actual payment charge
      const sourceId  = data.id;
      const amount    = data.attributes.amount;
      const currency  = data.attributes.currency;
      const bookingId = data.attributes.metadata?.booking_id;

      const payment = await paymongoService.createPayment({
        amount: amount / 100,
        currency,
        description: `AirServe Pro Booking #${bookingId}`,
        sourceId,
        metadata: { booking_id: bookingId },
      });

      // Update DB
      await db.query(
        'UPDATE payments SET status = ?, paymongo_payment_id = ? WHERE paymongo_source_id = ?',
        ['paid', payment.id, sourceId]
      );
      await db.query(
        'UPDATE service_requests SET payment_status = ? WHERE id = ?',
        ['paid', bookingId]
      );
    }

    if (type === 'payment.paid') {
      const intentId = data.attributes.payment_intent_id;
      if (intentId) {
        await db.query(
          'UPDATE payments SET status = ? WHERE paymongo_intent_id = ?',
          ['paid', intentId]
        );
      }
    }

    if (type === 'payment.failed') {
      const intentId = data.attributes.payment_intent_id;
      if (intentId) {
        await db.query(
          'UPDATE payments SET status = ? WHERE paymongo_intent_id = ?',
          ['failed', intentId]
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false });
  }
};

/**
 * GET /api/payments/booking/:bookingId
 * Get payment details for a booking
 */
const getPaymentByBooking = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.params.bookingId]
    );
    res.json({ success: true, payment: rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/payments (Admin only)
 */
const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.full_name AS customer_name, sr.booking_code
      FROM payments p
      JOIN users u ON p.customer_id = u.id
      JOIN service_requests sr ON p.booking_id = sr.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, payments: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createGCashPayment,
  createCardPayment,
  handleWebhook,
  getPaymentByBooking,
  getAllPayments,
};
