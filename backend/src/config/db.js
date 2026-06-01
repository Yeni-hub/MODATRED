require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

console.log('Variables de conexión:');
console.log('HOST:', process.env.DB_HOST);
console.log('USER:', process.env.DB_USER);
console.log('DB:  ', process.env.DB_NAME);

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             process.env.DB_PORT     || 3306,
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'modatrend',
  waitForConnections: true,
  connectionLimit:  10,
});

pool.getConnection()
  .then(conn => {
    console.log(' MySQL conectado correctamente');
    conn.release();
  })
  .catch(err => {
    console.error(' Error conectando a MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;