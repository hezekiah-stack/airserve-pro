const db = require('../config/db');

// GET /api/reports/dashboard
const getDashboard = async (req, res) => {
  try {
    const [[{ total_bookings }]] = await db.query(
      'SELECT COUNT(*) AS total_bookings FROM service_requests'
    );
    const [[{ active_services }]] = await db.query(
      "SELECT COUNT(*) AS active_services FROM service_requests WHERE status IN ('confirmed','in_progress')"
    );
    const [[{ monthly_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(amount),0) AS monthly_revenue FROM payments WHERE status='paid' AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())"
    );
    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(amount),0) AS total_revenue FROM payments WHERE status='paid'"
    );
    const [[{ pending_approvals }]] = await db.query(
      "SELECT COUNT(*) AS pending_approvals FROM service_requests WHERE status='pending'"
    );
    const [[{ total_customers }]] = await db.query(
      "SELECT COUNT(*) AS total_customers FROM users WHERE role='customer'"
    );
    const [[{ active_technicians }]] = await db.query(
      "SELECT COUNT(*) AS active_technicians FROM users WHERE role='technician' AND status='active'"
    );
    const [[{ completed_this_month }]] = await db.query(
      "SELECT COUNT(*) AS completed_this_month FROM service_requests WHERE status='completed' AND MONTH(updated_at)=MONTH(NOW()) AND YEAR(updated_at)=YEAR(NOW())"
    );

    // Monthly bookings trend — last 6 months
    const [monthly_trend] = await db.query(`
      SELECT
        DATE_FORMAT(created_at,'%b %Y') AS month,
        DATE_FORMAT(created_at,'%Y-%m') AS month_key,
        COUNT(*) AS count
      FROM service_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month_key, month
      ORDER BY month_key ASC
    `);

    // Service type breakdown
    const [service_breakdown] = await db.query(`
      SELECT s.name, COUNT(sr.id) AS count
      FROM service_requests sr
      JOIN services s ON sr.service_id = s.id
      GROUP BY s.id, s.name
      ORDER BY count DESC
    `);

    // Top technicians by completed jobs
    const [top_technicians] = await db.query(`
      SELECT
        u.id, u.full_name,
        COUNT(sr.id) AS completed_jobs,
        ROUND(COUNT(sr.id) * 100.0 / GREATEST((SELECT COUNT(*) FROM service_requests WHERE status='completed'),1), 1) AS completion_pct
      FROM users u
      LEFT JOIN service_requests sr ON sr.technician_id = u.id AND sr.status = 'completed'
      WHERE u.role = 'technician'
      GROUP BY u.id, u.full_name
      ORDER BY completed_jobs DESC
      LIMIT 5
    `);

    // Recent payments
    const [recent_payments] = await db.query(`
      SELECT p.*, u.full_name AS customer_name, sr.booking_code
      FROM payments p
      JOIN users u ON p.customer_id = u.id
      LEFT JOIN service_requests sr ON p.booking_id = sr.id
      WHERE p.status = 'paid'
      ORDER BY p.paid_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        total_bookings, active_services, monthly_revenue, total_revenue,
        pending_approvals, total_customers, active_technicians, completed_this_month,
      },
      monthly_trend,
      service_breakdown,
      top_technicians,
      recent_payments,
    });
  } catch (err) {
    console.error('Dashboard report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reports/payments — payment summary
const getPaymentReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    let where = "WHERE p.status = 'paid'";
    const params = [];
    if (from) { where += ' AND DATE(p.paid_at) >= ?'; params.push(from); }
    if (to)   { where += ' AND DATE(p.paid_at) <= ?'; params.push(to); }

    const [payments] = await db.query(`
      SELECT p.*, u.full_name AS customer_name, sr.booking_code
      FROM payments p
      JOIN users u ON p.customer_id = u.id
      LEFT JOIN service_requests sr ON p.booking_id = sr.id
      ${where}
      ORDER BY p.paid_at DESC
    `, params);

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    res.json({ success: true, payments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getPaymentReport };
