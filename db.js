require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

async function getConnectionWithTimeout(ms = 10000) {
    const getConn = pool.getConnection();
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('db: getConnection timed out')), ms)
    );
    return Promise.race([getConn, timeout]);
}

async function initializeDatabase() {
    const connection = await getConnectionWithTimeout(10000);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``);
    await connection.query(`USE \`${process.env.DB_DATABASE}\``);
    // If a schema.sql file exists in the project root, execute it (helpful for dev environments)
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const sql = fs.readFileSync(schemaPath, 'utf8');
            if (sql && sql.trim()) {
                try {
                    await connection.query(sql);
                } catch (err) {
                    console.warn('Warning: executing schema.sql produced an error (continuing):', err.message);
                }
            }
        } else {
            // fallback: ensure products table exists
            const createTableSQL = `
              CREATE TABLE IF NOT EXISTS products (
                id INT NOT NULL AUTO_INCREMENT,
                productName VARCHAR(200) NOT NULL,
                quantity INT NOT NULL,
                price DOUBLE(10,2) NOT NULL,
                image VARCHAR(50),
                PRIMARY KEY (id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
            await connection.query(createTableSQL);
        }
    } catch (err) {
        console.warn('initializeDatabase warning:', err && err.message ? err.message : err);
    }
    connection.release();
}

module.exports = {
    pool,
    query: (...args) => pool.query(...args),
    initializeDatabase
};
