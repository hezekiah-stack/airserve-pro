const db = require('../config/db');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const showAll = req.user?.role === 'admin';
    const query   = showAll
      ? 'SELECT * FROM products ORDER BY category, name'
      : 'SELECT * FROM products WHERE is_active = 1 ORDER BY category, name';
    const [rows]  = await db.query(query);
    res.json({ success: true, products: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, sku, category, price, stock_quantity, low_stock_threshold } = req.body;
    const [existing] = await db.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'SKU already exists.' });
    }
    const [result] = await db.query(
      'INSERT INTO products (name, description, sku, category, price, stock_quantity, low_stock_threshold) VALUES (?,?,?,?,?,?,?)',
      [name, description, sku, category, price, stock_quantity || 0, low_stock_threshold || 5]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Product created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity, low_stock_threshold, category, is_active } = req.body;
    await db.query(
      'UPDATE products SET name=?, description=?, price=?, stock_quantity=?, low_stock_threshold=?, category=?, is_active=? WHERE id=?',
      [name, description, price, stock_quantity, low_stock_threshold || 5, category, is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ success: true, message: 'Product updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id — soft delete
const deleteProduct = async (req, res) => {
  try {
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/products/:id/stock — restock
const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' | 'set'
    const op = operation === 'set'
      ? 'UPDATE products SET stock_quantity = ? WHERE id = ?'
      : 'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?';
    await db.query(op, [quantity, req.params.id]);
    res.json({ success: true, message: 'Stock updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock };
