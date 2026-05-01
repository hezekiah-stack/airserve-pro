const db = require('../config/db');

const getAllServices = async (req, res) => {
  try {
    const showAll = req.user?.role === 'admin';
    const [rows]  = await db.query(
      showAll ? 'SELECT * FROM services ORDER BY name'
              : 'SELECT * FROM services WHERE is_active = 1 ORDER BY name'
    );
    res.json({ success: true, services: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, service: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, base_price, duration_hours } = req.body;
    const [r] = await db.query(
      'INSERT INTO services (name, description, base_price, duration_hours) VALUES (?,?,?,?)',
      [name, description, base_price, duration_hours || 1]
    );
    res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { name, description, base_price, duration_hours, is_active } = req.body;
    await db.query(
      'UPDATE services SET name=?,description=?,base_price=?,duration_hours=?,is_active=? WHERE id=?',
      [name, description, base_price, duration_hours, is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ success: true, message: 'Service updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    await db.query('UPDATE services SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Service deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
