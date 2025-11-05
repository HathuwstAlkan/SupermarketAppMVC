require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
    connection.release();
}

module.exports = {
    pool,
    query: (...args) => pool.query(...args),
    initializeDatabase
};
