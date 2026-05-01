const router = require('express').Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET available slots for a date
router.get('/', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date required.' });
  const [booked] = await db.query(
    "SELECT scheduled_time FROM service_requests WHERE scheduled_date = ? AND status NOT IN ('cancelled')",
    [date]
  );
  const bookedTimes = booked.map(r => r.scheduled_time);
  const allSlots = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'];
  const slots = allSlots.map(t => ({ time: t, available: !bookedTimes.includes(t) }));
  res.json({ success: true, slots });
});

module.exports = router;
