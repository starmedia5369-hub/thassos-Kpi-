
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const dbFile = path.join(dbDir, 'thassos.db');

const db = new sqlite3.Database(dbFile);

const initSchema = () => {
  db.serialize(() => {
    // Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      username TEXT UNIQUE,
      pin_hash TEXT,
      role TEXT, -- admin, manager, staff
      dept TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Months Locking
    db.run(`CREATE TABLE IF NOT EXISTS months (
      id TEXT PRIMARY KEY, -- YYYY-MM
      is_locked INTEGER DEFAULT 0,
      locked_at DATETIME,
      locked_by TEXT,
      lock_reason TEXT
    )`);

    // KPI Entries
    db.run(`CREATE TABLE IF NOT EXISTS kpi_entries (
      id TEXT PRIMARY KEY,
      ym TEXT,
      dept TEXT,
      employee_id TEXT,
      kpi_key TEXT,
      value REAL,
      version INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT
    )`);

    // Maintenance Tickets
    db.run(`CREATE TABLE IF NOT EXISTS maintenance_tickets (
      id TEXT PRIMARY KEY,
      ym TEXT,
      asset TEXT,
      type TEXT,
      downtime_hours REAL,
      status TEXT,
      description TEXT,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Complaints
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      ym TEXT,
      type TEXT,
      dept TEXT,
      employee_id TEXT,
      status TEXT,
      description TEXT,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME
    )`);

    // Leads
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      ym TEXT,
      source TEXT,
      customer_name TEXT,
      phone TEXT,
      assigned_employee_id TEXT,
      status TEXT,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Audit Log
    db.run(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT,
      action TEXT,
      entity TEXT,
      entity_id TEXT,
      reason TEXT,
      payload_json TEXT
    )`);
  });
};

module.exports = { db, initSchema };
