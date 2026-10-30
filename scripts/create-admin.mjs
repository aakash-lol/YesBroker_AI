// Usage: node --env-file=.env.local scripts/create-admin.mjs you@example.com 'a-long-password' "Your Name"
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const [, , email, password, name = 'Admin'] = process.argv;
if (!email || !password || password.length < 10) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password, 10+ chars> [name]');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const hash = await bcrypt.hash(password, 12);
await conn.query(
  `INSERT INTO admin_users (id, email, password_hash, name) VALUES (UUID(), ?, ?, ?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)`,
  [email.toLowerCase().trim(), hash, name]
);
console.log(`Admin ready: ${email}`);
await conn.end();
