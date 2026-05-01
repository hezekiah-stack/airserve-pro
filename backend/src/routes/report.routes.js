const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getDashboard, getPaymentReport } = require('../controllers/report.controller');

router.get('/dashboard', authenticate, authorize('admin'), getDashboard);
router.get('/payments',  authenticate, authorize('admin'), getPaymentReport);

module.exports = router;
