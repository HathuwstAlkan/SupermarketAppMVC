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
    },

    async updateProfile(userId, { username, address, contact, avatar }) {
        // Update basic profile fields; update avatar only if column exists
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            const updateSql = 'UPDATE users SET username = ?, address = ?, contact = ? WHERE id = ?';
            await conn.query(updateSql, [username, address, contact, userId]);

            if (avatar) {
                // check if avatar column exists
                const [cols] = await conn.query("SHOW COLUMNS FROM users LIKE 'avatar'");
                if (cols && cols.length) {
                    await conn.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId]);
                }
            }

            await conn.commit();
            return true;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
};

module.exports = User;