const router = require('express').Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/booking/:bookingId', authenticate, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM diagnostics WHERE booking_id = ?', [req.params.bookingId]);
  res.json({ success: true, diagnostic: rows[0] || null });
});

router.post('/', authenticate, async (req, res) => {
  const { booking_id, ac_type, problem, years_owned, location_type, previously_repaired, notes } = req.body;
  const [r] = await db.query(
    `INSERT INTO diagnostics (booking_id, ac_type, problem, years_owned, location_type, previously_repaired, notes)
     VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE
     ac_type=VALUES(ac_type), problem=VALUES(problem), notes=VALUES(notes)`,
    [booking_id, ac_type, problem, years_owned, location_type, previously_repaired ? 1 : 0, notes]
  );
  res.status(201).json({ success: true, id: r.insertId });
});

module.exports = router;
