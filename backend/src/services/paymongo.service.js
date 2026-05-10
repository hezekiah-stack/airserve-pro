const axios = require('axios');

const PAYMONGO_BASE = 'https://api.paymongo.com/v1';

const getAuthHeader = () => {
  const key = process.env.PAYMONGO_SECRET_KEY;
  return 'Basic ' + Buffer.from(key + ':').toString('base64');
};

const createPaymentIntent = async ({ amount, currency = 'PHP', description, metadata = {} }) => {
  const response = await axios.post(
    `${PAYMONGO_BASE}/payment_intents`,
    {
      data: {
        attributes: {
          amount: Math.round(amount * 100),
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

const createGCashSource = async ({ amount, currency = 'PHP', description, bookingId, redirectSuccess, redirectFailed, customerEmail, customerName }) => {
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
           billing: {
  name: 'AirServe Customer',
  email: 'airservepro@gmail.com',
},
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

const retrievePaymentIntent = async (paymentIntentId) => {
  const response = await axios.get(
    `${PAYMONGO_BASE}/payment_intents/${paymentIntentId}`,
    { headers: { Authorization: getAuthHeader() } }
  );
  return response.data.data;
};

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
