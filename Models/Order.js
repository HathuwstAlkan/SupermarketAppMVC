const db = require('../db');

const Order = {
  async create(userId, totalAmount, status = 'pending') {
    const sql = 'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [userId, totalAmount, status]);
    return result.insertId;
  },

  async getById(id) {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  async getByUser(userId) {
    const sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async updateStatus(id, status) {
    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    const [result] = await db.query(sql, [status, id]);
    return result.affectedRows > 0;
  },

  async setPayment(id, paymentId) {
    const sql = 'UPDATE orders SET payment_id = ? WHERE id = ?';
    const [result] = await db.query(sql, [paymentId, id]);
    return result.affectedRows > 0;
  }
};

module.exports = Order;
