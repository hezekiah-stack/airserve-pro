const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { bookingRules, validate } = require('../middleware/validation.middleware');
const {
  getBookings, getBookingById, createBooking, updateBookingStatus, deleteBooking,
} = require('../controllers/booking.controller');

router.get('/',            authenticate, getBookings);
router.get('/:id',         authenticate, getBookingById);
router.post('/',           authenticate, authorize('customer'), bookingRules, validate, createBooking);
router.patch('/:id/status',authenticate, authorize('admin','technician'), updateBookingStatus);
router.delete('/:id',      authenticate, authorize('admin'), deleteBooking);

module.exports = router;
