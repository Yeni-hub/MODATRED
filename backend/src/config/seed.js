require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db');

async function seed() {
  try {
    const hash         = await bcrypt.hash('Admin123!', 10);
    const hashVendedor = await bcrypt.hash('Vendedor1!', 10);

    await pool.query(`
      INSERT IGNORE INTO usuarios (nombre, email, password_hash, rol) VALUES
      ('Administrador', 'admin@modatrend.com', ?, 'admin'),
      ('Vendedora Ana',  'ana@modatrend.com',  ?, 'vendedor')
    `, [hash, hashVendedor]);

    console.log('✅ Usuarios creados:');
    console.log('   admin@modatrend.com  /  Admin123!');
    console.log('   ana@modatrend.com    /  Vendedor1!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();