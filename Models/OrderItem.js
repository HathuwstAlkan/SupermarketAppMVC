const db = require('../db');

const OrderItem = {
  async add(orderId, productId, quantity, unitPrice) {
    const sql = 'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [orderId, productId, quantity, unitPrice]);
    return result.insertId;
  },

  async getByOrder(orderId) {
    const sql = `SELECT oi.*, p.productName, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`;
    const [rows] = await db.query(sql, [orderId]);
    return rows;
  }
};

module.exports = OrderItem;
