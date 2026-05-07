/**
 * PayMongo Service
 * ─────────────────────────────────────────────────────────────────────────
 * Handles all PayMongo API calls for GCash and Card payments.
 *
 * HOW IT WORKS:
 * 1. Create a PaymentIntent (amount + currency)
 * 2. Attach a PaymentMethod (gcash, card, etc.)
 * 3. Redirect customer to checkout_url (for GCash)
 * 4. PayMongo calls your webhook when payment is done
 * 5. Update booking status in DB
 *
 * DOCS: https://developers.paymongo.com
 */

const axios = require('axios');

const PAYMONGO_BASE = 'https://api.paymongo.com/v1';

// Base64 encode the secret key (PayMongo uses HTTP Basic Auth)
const getAuthHeader = () => {
  const key = process.env.PAYMONGO_SECRET_KEY;
  return 'Basic ' + Buffer.from(key + ':').toString('base64');
};

/**
 * Create a PaymentIntent
 * Used for card payments (attach method separately)
 */
const createPaymentIntent = async ({ amount, currency = 'PHP', description, metadata = {} }) => {
  const response = await axios.post(
    `${PAYMONGO_BASE}/payment_intents`,
    {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // PayMongo uses centavos
          currency,
          description,
          metadata,
          payment_method_allowed: ['card', 'gcash', 'paymaya'],
          capture_type: 'automatic',
        },
      },
    },
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data;
};

/**
 * Create a PaymentMethod
 * For card: pass billing details + card details
 * For GCash: just type = 'gcash', no card needed
 */
const createPaymentMethod = async ({ type, billing, card }) => {
  const attributes = { type, billing };
  if (type === 'card' && card) {
    attributes.details = card;
  }

  const response = await axios.post(
    `${PAYMONGO_BASE}/payment_methods`,
    { data: { attributes } },
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data;
};

/**
 * Attach PaymentMethod to PaymentIntent
 * Returns the PaymentIntent with updated status.
 * For GCash: status becomes 'awaiting_payment_method' + redirect URL
 */
const attachPaymentMethod = async ({ paymentIntentId, paymentMethodId, returnUrl }) => {
  const response = await axios.post(
    `${PAYMONGO_BASE}/payment_intents/${paymentIntentId}/attach`,
    {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: returnUrl,
          client_key: process.env.PAYMONGO_PUBLIC_KEY,
        },
      },
    },
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data;
};

/**
 * Create a Source (for GCash — alternative simpler flow)
 * Returns a redirect URL — customer pays on GCash app/web
 * Recommended for GCash payments
 */
const createGCashSource = async ({ amount, currency = 'PHP', description, bookingId, redirectSuccess, redirectFailed }) => {
  try {
    const response = await axios.post(
      `${PAYMONGO_BASE}/sources`,
      {
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            currency,
            type: 'gcash',
            description,
            redirect: {
              success: redirectSuccess,
              failed: redirectFailed,
            },
            metadata: { booking_id: String(bookingId) },
            billing: { name: 'AirServe Pro Customer', email: 'customer@airserve.com', phone: '09171234567' },
          },
        },
      },
      {
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (err) {
    console.error('PayMongo GCash full error:', JSON.stringify(err.response?.data, null, 2));
    throw err;
  }
};
    `${PAYMONGO_BASE}/sources`,
    {
      data: {
        attributes: {
          amount: Math.round(amount * 100),
          currency,
          type: 'gcash',
          description,
          redirect: {
            success: redirectSuccess,
            failed: redirectFailed,
          },
          metadata: { booking_id: String(bookingId) },
         billing: { name: 'AirServe Pro Customer', email: 'customer@airserve.com', phone: '09171234567' },
        },
      },
    },
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data;
};

/**
 * Create a Payment (charge a Source after it's chargeable)
 * Called after webhook confirms source.chargeable
 */
const createPayment = async ({ amount, currency = 'PHP', description, sourceId, metadata = {} }) => {
  const response = await axios.post(
    `${PAYMONGO_BASE}/payments`,
    {
      data: {
        attributes: {
          amount: Math.round(amount * 100),
          currency,
          description,
          source: { id: sourceId, type: 'source' },
          metadata,
        },
      },
    },
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data;
};

/**
 * Retrieve a PaymentIntent by ID
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  const response = await axios.get(
    `${PAYMONGO_BASE}/payment_intents/${paymentIntentId}`,
    { headers: { Authorization: getAuthHeader() } }
  );
  return response.data.data;
};

/**
 * Verify PayMongo webhook signature
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expected === signature;
};

module.exports = {
  createPaymentIntent,
  createPaymentMethod,
  attachPaymentMethod,
  createGCashSource,
  createPayment,
  retrievePaymentIntent,
  verifyWebhookSignature,
};
