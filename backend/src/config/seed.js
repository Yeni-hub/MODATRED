require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const pool   = require('./db');

async function seed() {
  try {
    const adminPassword     = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
    const vendedorPassword  = process.env.SEED_VENDEDOR_PASSWORD || 'Vendedor1!';

    const hash         = await bcrypt.hash(adminPassword, 10);
    const hashVendedor = await bcrypt.hash(vendedorPassword, 10);

    await pool.query(`
      INSERT IGNORE INTO usuarios (nombre, email, password_hash, rol) VALUES
      ('Administrador', 'admin@modatrend.com', ?, 'admin'),
      ('Vendedora Ana',  'ana@modatrend.com',  ?, 'vendedor')
    `, [hash, hashVendedor]);

    console.log('✅ Usuarios creados:');
    console.log(`   admin@modatrend.com  /  ${adminPassword}`);
    console.log(`   ana@modatrend.com    /  ${vendedorPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();