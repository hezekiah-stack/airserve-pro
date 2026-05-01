const { body, validationResult } = require('express-validator');

// Run validation and return errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Register validation rules
const registerRules = [
  body('full_name').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 150 }),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(['customer','admin','technician']).withMessage('Invalid role.'),
];

// Login validation rules
const loginRules = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

// Booking validation rules
const bookingRules = [
  body('service_id').isInt({ min: 1 }).withMessage('Valid service is required.'),
  body('scheduled_date').isDate().withMessage('Valid date is required.'),
  body('scheduled_time').notEmpty().withMessage('Time slot is required.'),
  body('address').trim().notEmpty().withMessage('Service address is required.'),
];

// Payment validation rules
const gcashPaymentRules = [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required.'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount is required.'),
];

const cardPaymentRules = [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required.'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount is required.'),
  body('billing.name').notEmpty().withMessage('Cardholder name is required.'),
  body('billing.email').isEmail().withMessage('Valid billing email is required.'),
  body('card.number').notEmpty().withMessage('Card number is required.'),
  body('card.exp_month').isInt({ min: 1, max: 12 }).withMessage('Valid expiry month is required.'),
  body('card.exp_year').isInt({ min: new Date().getFullYear() }).withMessage('Valid expiry year is required.'),
  body('card.cvc').isLength({ min: 3, max: 4 }).withMessage('Valid CVC is required.'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  bookingRules,
  gcashPaymentRules,
  cardPaymentRules,
};
