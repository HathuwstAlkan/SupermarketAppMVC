const db = require('../db');

const ShippingDetails = {
  async create(orderId, details) {
    const sql = `INSERT INTO shipping_details (order_id, recipient_name, address_line1, address_line2, city, region, postal_code, country, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [orderId, details.recipient_name, details.address_line1, details.address_line2 || null, details.city || null, details.region || null, details.postal_code || null, details.country || null, details.phone || null, details.status || 'pending'];
    const [result] = await db.query(sql, params);
    return result.insertId;
  },

  async update(orderId, details) {
    const sql = `UPDATE shipping_details SET recipient_name = ?, address_line1 = ?, address_line2 = ?, city = ?, region = ?, postal_code = ?, country = ?, phone = ?, status = ? WHERE order_id = ?`;
    const params = [details.recipient_name, details.address_line1, details.address_line2 || null, details.city || null, details.region || null, details.postal_code || null, details.country || null, details.phone || null, details.status || 'pending', orderId];
    const [result] = await db.query(sql, params);
    return result.affectedRows > 0;
  },

  async getByOrder(orderId) {
    const sql = 'SELECT * FROM shipping_details WHERE order_id = ?';
    const [rows] = await db.query(sql, [orderId]);
    return rows[0] || null;
  }
};

module.exports = ShippingDetails;
