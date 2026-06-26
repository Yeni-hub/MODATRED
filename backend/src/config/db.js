require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
  console.error('DB_PASSWORD no configurada en producción');
  process.exit(1);
}

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             process.env.DB_PORT     || 3306,
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'modatrend',
  waitForConnections: true,
  connectionLimit:  10,
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
});

pool.getConnection()
  .then(conn => {
    conn.release();
  })
  .catch(err => {
    console.error('Error conectando a MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;