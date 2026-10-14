require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const email = process.argv[2] || "admin@boutique.com";
const password = process.argv[3] || "admin123";
const name = process.argv[4] || "Store Administrator";

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is missing in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createOrUpdateAdmin() {
  try {
    console.log(`⏳ Processing Admin user: ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const checkUser = await pool.query('SELECT id, email, role FROM "User" WHERE email = $1', [email.toLowerCase().trim()]);

    if (checkUser.rows.length > 0) {
      // Update existing user to ADMIN and set new password
      const userId = checkUser.rows[0].id;
      await pool.query(
        'UPDATE "User" SET role = $1, password = $2, name = $3, "updatedAt" = NOW() WHERE id = $4',
        ['ADMIN', hashedPassword, name, userId]
      );
      console.log(`\n✅ SUCCESS: Existing user updated to ADMIN!`);
    } else {
      // Create new admin user
      const { randomUUID } = require("crypto");
      const id = randomUUID();
      await pool.query(
        'INSERT INTO "User" (id, email, password, name, role, "updatedAt", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [id, email.toLowerCase().trim(), hashedPassword, name, 'ADMIN']
      );
      console.log(`\n✅ SUCCESS: New ADMIN user created successfully!`);
    }

    console.log("-----------------------------------------");
    console.log(`📧 Email:    ${email.toLowerCase().trim()}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👑 Role:     ADMIN`);
    console.log("-----------------------------------------");
    console.log("Aap ab https://vamikabhargavi.com/admin/login par login kar sakte hain!\n");
  } catch (error) {
    console.error("❌ Failed to create/update admin:", error.message);
  } finally {
    await pool.end();
  }
}

createOrUpdateAdmin();
