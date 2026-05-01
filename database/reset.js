/**
 * database/reset.js
 * Drops and recreates the database + re-seeds with sample data.
 * WARNING: This deletes ALL data. Only use in development.
 */
require('dotenv').config({ path: '../.env' });
const fs    = require('fs');
const path  = require('path');
const mysql = require('mysql2/promise');

async function reset() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('⚠️  Resetting database — all data will be deleted...');
    const dbName = process.env.DB_NAME || 'airserve_db';

    await conn.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`✅ Dropped database: ${dbName}`);

    const schema = fs.readFileSync(path.join(__dirname, 'schema/schema.sql'), 'utf8');
    await conn.query(schema);
    console.log('✅ Schema recreated.');

    await conn.query(`USE ${dbName}`);
    const seed = fs.readFileSync(path.join(__dirname, 'seeders/seed.sql'), 'utf8');
    await conn.query(seed);
    console.log('✅ Seed data inserted.');

    console.log('');
    console.log('🎉 Database reset complete!');
    console.log('👤 Demo accounts (password: demo1234):');
    console.log('   admin@demo.com | customer@demo.com | tech@demo.com');
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
  } finally {
    await conn.end();
  }
}

reset();
