require('dotenv').config({path:'../.env'});
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://airserve-pro.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
 methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/services',      require('./routes/service.routes'));
app.use('/api/bookings',      require('./routes/booking.routes'));
app.use('/api/diagnostics',   require('./routes/diagnostic.routes'));
app.use('/api/schedules',     require('./routes/schedule.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));
app.use('/api/products',      require('./routes/product.routes'));
app.use('/api/orders',        require('./routes/order.routes'));
app.use('/api/reports',       require('./routes/report.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AirServe Pro API is running!', timestamp: new Date() });
});

app.get('/api/test-paymongo', async (req, res) => {
  const axios = require('axios');
  const key = process.env.PAYMONGO_SECRET_KEY;
  const auth = 'Basic ' + Buffer.from(key + ':').toString('base64');
  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/sources',
      {
        data: {
          attributes: {
            amount: 50000,
            currency: 'PHP',
            type: 'gcash',
            description: 'Test',
            redirect: {
              success: 'https://airserve-pro.vercel.app/payment/success',
              failed: 'https://airserve-pro.vercel.app/payment/failed',
            },
            billing: {
              name: 'Test Customer',
              email: 'test@test.com',
            },
          },
        },
      },
      { headers: { Authorization: auth, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.json({ success: false, error: err.response?.data });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ AirServe Pro API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
