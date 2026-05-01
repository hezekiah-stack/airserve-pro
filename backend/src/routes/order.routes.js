const router = require('express').Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET my orders (customer)
router.get('/', authenticate, async (req, res) => {
  let query = `
    SELECT o.*, u.full_name AS customer_name
    FROM orders o JOIN users u ON o.customer_id = u.id
  `;
  const params = [];
  if (req.user.role === 'customer') {
    query += ' WHERE o.customer_id = ?';
    params.push(req.user.id);
  }
  query += ' ORDER BY o.created_at DESC';
  const [rows] = await db.query(query, params);
  res.json({ success: true, orders: rows });
});

// GET order with items
router.get('/:id', authenticate, async (req, res) => {
  const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found.' });
  const [items] = await db.query(
    'SELECT oi.*, p.name, p.sku FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
    [req.params.id]
  );
  res.json({ success: true, order: { ...orders[0], items } });
});

// POST create order
router.post('/', authenticate, authorize('customer'), async (req, res) => {
  const { items } = req.body; // [{ product_id, quantity }]
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const enriched = [];
    for (const item of items) {
      const [[product]] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product?.name || item.product_id}`);
      }
      total += product.price * item.quantity;
      enriched.push({ ...item, price: product.price, name: product.name });
      await conn.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]);
    }
    const [order] = await conn.query(
      'INSERT INTO orders (customer_id, total_amount, status, payment_status) VALUES (?,?,?,?)',
      [req.user.id, total, 'pending', 'unpaid']
    );
    const orderId = order.insertId;
    for (const item of enriched) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    await conn.commit();
    res.status(201).json({ success: true, order_id: orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
