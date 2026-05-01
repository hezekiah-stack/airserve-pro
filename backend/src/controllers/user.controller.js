const db      = require('../config/db');
const bcrypt  = require('bcryptjs');

// GET /api/users — all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, role, phone, address, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/technicians — active technicians list
const getTechnicians = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone FROM users WHERE role = 'technician' AND status = 'active' ORDER BY full_name"
    );
    res.json({ success: true, technicians: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, role, phone, address, status, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id — update profile
const updateUser = async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;
    // Users can only update their own profile; admins can update anyone
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, req.params.id]
    );
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/users/:id/status — admin deactivate/activate
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active','inactive','suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'User status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users — admin creates new staff account
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, role, phone, address } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role, phone, address) VALUES (?,?,?,?,?,?)',
      [full_name, email, hashed, role || 'customer', phone, address]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'User created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllUsers, getTechnicians, getUserById, updateUser, updateUserStatus, createUser };
