const db = require('../db');

const User = {
    async authenticate(email, password) {
        const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
        const [rows] = await db.query(sql, [email, password]);
        return rows[0] || null;
    },

    async create({ username, email, password, address, contact, role }) {
        const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
        const [result] = await db.query(sql, [username, email, password, address, contact, role]);
        return result.insertId;
    }
};

module.exports = User;