const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SJVZCykn3iU6@ep-noisy-union-atq5vgfd.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function run() {
  try {
    const res = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\'');
    console.log('Tables:', res.rows.map(r => r.table_name));
    
    const countRes = await pool.query('SELECT COUNT(*) FROM "Product"');
    console.log('Product count:', countRes.rows[0].count);
    
    const productsRes = await pool.query('SELECT id, title, category FROM "Product"');
    console.log('Products:', productsRes.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
