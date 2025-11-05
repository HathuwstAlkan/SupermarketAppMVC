const db = require('../db');

const ProductModel = {
    async getAll() {
        const sql = 'SELECT id, productName, quantity, price, image FROM products';
        const [rows] = await db.query(sql);
        return rows;
    },

    async getById(id) {
        const sql = 'SELECT id, productName, quantity, price, image FROM products WHERE id = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    },

    async add(product) {
        const sql = 'INSERT INTO products (productName, quantity, price, image) VALUES (?, ?, ?, ?)';
        const params = [product.productName, product.quantity, product.price, product.image];
        const [result] = await db.query(sql, params);
        return { insertId: result.insertId };
    },

    async update(id, product) {
        const sql = 'UPDATE products SET productName = ?, quantity = ?, price = ?, image = ? WHERE id = ?';
        const params = [product.productName, product.quantity, product.price, product.image, id];
        const [result] = await db.query(sql, params);
        return result.affectedRows > 0;
    },

    async remove(id) {
        const sql = 'DELETE FROM products WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = ProductModel;