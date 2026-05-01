require('dotenv').config({ path: '../.env' });
const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'airserve_db',
    multipleStatements: true,
  });

  try {
    console.log('🌱 Seeding database with sample data...');
    const sql = fs.readFileSync(path.join(__dirname, 'seeders/seed.sql'), 'utf8');
    await conn.query(sql);
    console.log('✅ Seed data inserted successfully.');
    console.log('');
    console.log('👤 Demo Accounts (password: demo1234)');
    console.log('   Admin:      admin@demo.com');
    console.log('   Customer:   customer@demo.com');
    console.log('   Technician: tech@demo.com');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await conn.end();
  }
}

seed();
