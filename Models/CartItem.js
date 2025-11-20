const db = require('../db');

const CartItem = {
  async getByUser(userId) {
    const sql = `SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, p.productName, p.price, p.image
                 FROM cart_items ci
                 JOIN products p ON ci.product_id = p.id
                 WHERE ci.user_id = ?`;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async getCountByUser(userId) {
    const sql = 'SELECT COUNT(*) AS cnt FROM cart_items WHERE user_id = ?';
    const [rows] = await db.query(sql, [userId]);
    return rows[0].cnt || 0;
  },

  async getItem(userId, productId) {
    const sql = 'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?';
    const [rows] = await db.query(sql, [userId, productId]);
    return rows[0] || null;
  },

  async addOrUpdate(userId, productId, quantity) {
    // if exists, update; else insert
    const existing = await this.getItem(userId, productId);
    if (existing) {
      const newQty = existing.quantity + quantity;
      const sql = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
      const [result] = await db.query(sql, [newQty, existing.id]);
      return result.affectedRows > 0;
    } else {
      const sql = 'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)';
      const [result] = await db.query(sql, [userId, productId, quantity]);
      return result.insertId;
    }
  },

  async updateQuantity(userId, productId, quantity) {
    const sql = 'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?';
    const [result] = await db.query(sql, [quantity, userId, productId]);
    return result.affectedRows > 0;
  },

  async remove(userId, productId) {
    const sql = 'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?';
    const [result] = await db.query(sql, [userId, productId]);
    return result.affectedRows > 0;
  },

  async clear(userId) {
    const sql = 'DELETE FROM cart_items WHERE user_id = ?';
    const [result] = await db.query(sql, [userId]);
    return result.affectedRows >= 0;
  }
};

module.exports = CartItem;
