
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { db, initSchema } = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());

initSchema();

const PORT = process.env.PORT || 8088;

// --- Middlewares ---
const auth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId && !['/api/login', '/api/health'].includes(req.path)) {
    return res.status(401).json({ error: 'Auth required' });
  }
  req.userId = userId;
  next();
};

app.use(auth);

// --- Auth Endpoints ---
app.post('/api/login', (req, res) => {
  const { username, pin } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'User not found' });
    if (bcrypt.compareSync(pin, user.pin_hash)) {
      res.json({ id: user.id, name: user.name, role: user.role, dept: user.dept });
    } else {
      res.status(401).json({ error: 'Invalid PIN' });
    }
  });
});

// --- Sync & Data ---
app.get('/api/bootstrap', (req, res) => {
  const data = {};
  db.all("SELECT * FROM months", (err, months) => {
    data.months = months;
    db.all("SELECT id, name, role, dept FROM users", (err, users) => {
      data.users = users;
      res.json(data);
    });
  });
});

app.get('/api/changes', (req, res) => {
  const since = req.query.since || '1970-01-01';
  const tables = ['kpi_entries', 'maintenance_tickets', 'leads', 'complaints'];
  const results = {};
  let count = 0;

  tables.forEach(table => {
    db.all(`SELECT * FROM ${table} WHERE updated_at > ?`, [since], (err, rows) => {
      results[table] = rows;
      count++;
      if (count === tables.length) res.json({ timestamp: new Date().toISOString(), data: results });
    });
  });
});

app.post('/api/upsert', (req, res) => {
  const { entity, record } = req.body;
  const ym = record.ym;

  // 1. Check Lock
  db.get("SELECT is_locked FROM months WHERE id = ?", [ym], (err, lock) => {
    if (lock && lock.is_locked) return res.status(403).json({ error: 'Month is locked' });

    // 2. Check Version
    db.get(`SELECT version FROM ${entity} WHERE id = ?`, [record.id], (err, current) => {
      if (current && record.version !== current.version) {
        return res.status(409).json({ error: 'Conflict', server_record: current });
      }

      const nextVersion = (current ? current.version : 0) + 1;
      const now = new Date().toISOString();
      const keys = Object.keys(record).filter(k => k !== 'version');
      const placeholders = keys.map(() => '?').join(',');
      const updates = keys.map(k => `${k}=?`).join(',');

      const sql = `
        INSERT INTO ${entity} (${keys.join(',')}, version, updated_at)
        VALUES (${placeholders}, ?, ?)
        ON CONFLICT(id) DO UPDATE SET ${updates}, version=?, updated_at=?
      `;

      const params = [
        ...keys.map(k => record[k]), nextVersion, now,
        ...keys.map(k => record[k]), nextVersion, now
      ];

      db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Audit
        db.run("INSERT INTO audit_log (user_id, action, entity, entity_id, payload_json) VALUES (?, ?, ?, ?, ?)",
          [req.userId, 'UPSERT', entity, record.id, JSON.stringify(record)]);
        
        res.json({ status: 'success', version: nextVersion });
      });
    });
  });
});

app.post('/api/lock-month', (req, res) => {
  const { ym, reason, lock } = req.body; // lock is 1 or 0
  db.run("INSERT INTO months (id, is_locked, locked_at, locked_by, lock_reason) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET is_locked=?, locked_at=?, locked_by=?, lock_reason=?",
    [ym, lock, new Date().toISOString(), req.userId, reason, lock, new Date().toISOString(), req.userId, reason], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: lock ? 'locked' : 'unlocked', ym });
    });
});

app.get('/api/health', (req, res) => res.json({ status: 'online' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Thassos Server listening on port ${PORT}`);
});
