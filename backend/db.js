const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function getDb() {
  const db = await open({
    filename: './medtrack.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL,
      medicine_name TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      unit_count INTEGER NOT NULL,
      threshold_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dispensations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      patient_phone TEXT,
      medicine_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS restock_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_name TEXT NOT NULL,
      ordered_quantity INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      order_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      sla_deadline DATETIME
    );
  `);

  return db;
}

module.exports = { getDb };
