const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { gcashPaymentRules, cardPaymentRules, validate } = require('../middleware/validation.middleware');
const {
  createGCashPayment, createCardPayment, handleWebhook,
  getPaymentByBooking, getAllPayments,
} = require('../controllers/payment.controller');

// Webhook — no auth (PayMongo server calls this)
router.post('/webhook', handleWebhook);

// Customer
router.post('/gcash/create', authenticate, authorize('customer'), gcashPaymentRules, validate, createGCashPayment);
router.post('/card/create',  authenticate, authorize('customer'), cardPaymentRules,  validate, createCardPayment);
router.get('/booking/:bookingId', authenticate, getPaymentByBooking);

// Admin
router.get('/', authenticate, authorize('admin'), getAllPayments);

module.exports = router;
