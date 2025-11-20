const db = require('../db');

const AdminController = {
  async dashboard(req, res) {
    // Render a simple admin dashboard page; charts will be populated via /admin/stats
    res.render('admin/dashboard', { user: req.session.user });
  },

  async stats(req, res) {
    try {
      const results = {};

      // Basic counts
      const [u] = await db.query('SELECT COUNT(*) as cnt FROM users');
      results.totalUsers = u[0] ? u[0].cnt : 0;

      const [p] = await db.query('SELECT COUNT(*) as cnt FROM products');
      results.totalProducts = p[0] ? p[0].cnt : 0;

      const [o] = await db.query('SELECT COUNT(*) as cnt, COALESCE(SUM(total_amount),0) as revenue FROM orders');
      results.totalOrders = o[0] ? o[0].cnt : 0;
      results.totalRevenue = o[0] ? o[0].revenue : 0;

      const [low] = await db.query('SELECT COUNT(*) as cnt FROM products WHERE quantity < 10');
      results.lowStockCount = low[0] ? low[0].cnt : 0;

      // Recent orders per day (last 7 days) if created_at exists
      try {
        const [recent] = await db.query("SELECT DATE(created_at) as dt, COUNT(*) as cnt, COALESCE(SUM(total_amount),0) as total FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC");
        results.recentOrders = recent.map(r => ({ date: r.dt, count: r.cnt, total: r.total }));
      } catch (e) {
        results.recentOrders = [];
      }

      res.json({ success: true, data: results });
    } catch (err) {
      console.error('Admin stats error', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = AdminController;
