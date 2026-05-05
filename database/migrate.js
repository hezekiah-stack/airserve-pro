require('dotenv').config({ path: '../.env' });
const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'airserve_db',
    multipleStatements: true,
  });

  try {
    console.log('🔄 Running database migration...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema/schema.sql'), 'utf8');
    await conn.query(sql);
    console.log('✅ Schema created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
