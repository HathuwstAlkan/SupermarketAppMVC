const db = require('../db');

// Simple in-memory OTP store for demo/admin reset flows
const otpStore = {};

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
,

  // Paginated recent signups: /admin/users?page=1&limit=20
  async users(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(200, Math.max(5, parseInt(req.query.limit || '20', 10)));
      const offset = (page - 1) * limit;
      const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
      const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM users');
      res.json({ success: true, data: { rows, total: cnt, page, limit } });
    } catch (err) {
      console.error('Admin users error', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Request a password reset (admin triggers OTP send to user's email)
  async requestReset(req, res) {
    try {
      const email = (req.body.email || '').toLowerCase();
      if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
      const [rows] = await db.query('SELECT id, email, username FROM users WHERE email = ?', [email]);
      if (!rows || !rows[0]) return res.status(404).json({ success: false, error: 'User not found' });
      
      const otp = genOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      // Store OTP in database
      await PasswordReset.create(email, otp, expiresAt);
      
      // Generate mock email content for UI display
      const mockEmail = {
        from: 'noreply@supermarketmvc.com',
        to: email,
        subject: 'Password Reset Request - Supermarket MVC',
        body: `Hello ${rows[0].username || 'User'},\\n\\nWe received a request to reset your password. Please use the following One-Time Password (OTP) to complete the process:\\n\\nYour OTP Code: ${otp}\\n\\nThis code will expire in 10 minutes.\\n\\nIf you did not request this password reset, please ignore this email.\\n\\nBest regards,\\nSupermarket MVC Team`,
        otp: otp,
        expiresAt: expiresAt.toISOString()
      };
      
      console.log(`[MOCK EMAIL] Password reset OTP for ${email}: ${otp}`);
      return res.json({ success: true, message: 'Password reset email sent (mock).', mockEmail });
    } catch (err) {
      console.error('Request reset error', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Confirm reset: verify OTP and set new password
  async confirmReset(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) return res.status(400).json({ success: false, error: 'Missing fields' });
      
      // Find valid OTP in database
      const otpRecord = await PasswordReset.findValid(email.toLowerCase(), otp);
      if (!otpRecord) {
        return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
      }
      
      // Update password
      await db.query('UPDATE users SET password = SHA1(?) WHERE email = ?', [newPassword, email.toLowerCase()]);
      
      // Mark OTP as used
      await PasswordReset.markUsed(email.toLowerCase(), otp);
      
      res.json({ success: true, message: 'Password reset successful.' });
    } catch (err) {
      console.error('Confirm reset error', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Revenue by day or by source: /admin/revenue?start=YYYY-MM-DD&end=YYYY-MM-DD
  async revenue(req, res) {
    try {
      const start = req.query.start || null;
      const end = req.query.end || null;
      // If orders has a `source` column use it, otherwise fallback to totals by date
      let stmt;
      if (start && end) {
        stmt = `SELECT DATE(created_at) as dt, COALESCE(SUM(total_amount),0) as total FROM orders WHERE created_at BETWEEN ? AND ? GROUP BY DATE(created_at) ORDER BY DATE(created_at)`;
        const [rows] = await db.query(stmt, [start + ' 00:00:00', end + ' 23:59:59']);
        return res.json({ success: true, data: rows });
      }

      // default: last 30 days
      stmt = `SELECT DATE(created_at) as dt, COALESCE(SUM(total_amount),0) as total FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at)`;
      const [rows] = await db.query(stmt);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Admin revenue error', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Engagement metrics (simple): active users (orders in last 30 days), cart-adds if tracked
  async engagement(req, res) {
    try {
      const [active] = await db.query("SELECT COUNT(DISTINCT user_id) as cnt FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
      const activeUsers = active[0] ? active[0].cnt : 0;
      // cart adds: fallback if cart_items has created_at
      let cartAdds = null;
      try {
        const [c] = await db.query('SELECT COUNT(*) as cnt FROM cart_items WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
        cartAdds = c[0] ? c[0].cnt : 0;
      } catch (e) {
        cartAdds = null;
      }
      res.json({ success: true, data: { activeUsers, cartAdds } });
    } catch (err) {
      console.error('Admin engagement error', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = AdminController;
