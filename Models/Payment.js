const db = require('../db');

const Payment = {
  async create(orderId, userId, method, amount, currency = 'USD', metadata = null) {
    const sql = 'INSERT INTO payments (order_id, user_id, method, amount, currency, status, payment_metadata) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [orderId, userId, method, amount, currency, 'initiated', metadata ? JSON.stringify(metadata) : null]);
    return result.insertId;
  },

  async updateStatus(id, status, providerTransactionId = null, cardInfo = {}) {
    const sql = 'UPDATE payments SET status = ?, provider_transaction_id = ?, card_brand = ?, card_last4 = ?, card_expiry = ? WHERE id = ?';
    const [result] = await db.query(sql, [status, providerTransactionId, cardInfo.brand || null, cardInfo.last4 || null, cardInfo.expiry || null, id]);
    return result.affectedRows > 0;
  },

  async getById(id) {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }
};

module.exports = Payment;
