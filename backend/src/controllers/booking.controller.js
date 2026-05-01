const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Generate booking code like SRQ-2024-001
const generateBookingCode = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `SRQ-${year}-${rand}`;
};

// GET /api/bookings (role-aware)
const getBookings = async (req, res) => {
  try {
    let query = `
      SELECT sr.*, 
        c.full_name AS customer_name, c.phone AS customer_phone,
        t.full_name AS technician_name,
        s.name AS service_name
      FROM service_requests sr
      LEFT JOIN users c ON sr.customer_id = c.id
      LEFT JOIN users t ON sr.technician_id = t.id
      LEFT JOIN services s ON sr.service_id = s.id
    `;
    const params = [];
    if (req.user.role === 'customer') {
      query += ' WHERE sr.customer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'technician') {
      query += ' WHERE sr.technician_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY sr.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, bookings: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sr.*, 
        c.full_name AS customer_name, c.phone AS customer_phone, c.address AS customer_address,
        t.full_name AS technician_name, t.phone AS technician_phone,
        s.name AS service_name, s.base_price,
        d.ac_type, d.problem, d.years_owned, d.location_type, d.previously_repaired, d.notes
      FROM service_requests sr
      LEFT JOIN users c ON sr.customer_id = c.id
      LEFT JOIN users t ON sr.technician_id = t.id
      LEFT JOIN services s ON sr.service_id = s.id
      LEFT JOIN diagnostics d ON sr.id = d.booking_id
      WHERE sr.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const {
      service_id, scheduled_date, scheduled_time,
      address, diagnostic,
    } = req.body;

    const booking_code = generateBookingCode();

    const [result] = await db.query(
      `INSERT INTO service_requests 
        (booking_code, customer_id, service_id, scheduled_date, scheduled_time, address, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
      [booking_code, req.user.id, service_id, scheduled_date, scheduled_time, address]
    );

    const bookingId = result.insertId;

    // Save diagnostic if provided
    if (diagnostic) {
      await db.query(
        `INSERT INTO diagnostics (booking_id, ac_type, problem, years_owned, location_type, previously_repaired, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          diagnostic.ac_type, diagnostic.problem, diagnostic.years_owned,
          diagnostic.location_type, diagnostic.previously_repaired ? 1 : 0,
          diagnostic.notes,
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking_id: bookingId,
      booking_code,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/status (Admin/Technician)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, technician_id, notes } = req.body;
    const allowed = ['pending','confirmed','in_progress','completed','cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    await db.query(
      'UPDATE service_requests SET status = ?, technician_id = COALESCE(?, technician_id), admin_notes = COALESCE(?, admin_notes) WHERE id = ?',
      [status, technician_id, notes, req.params.id]
    );

    res.json({ success: true, message: 'Booking updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/bookings/:id (Admin only)
const deleteBooking = async (req, res) => {
  try {
    await db.query('DELETE FROM service_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Booking deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBookings, getBookingById, createBooking, updateBookingStatus, deleteBooking };
