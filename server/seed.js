
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFile = path.join(__dirname, 'data', 'thassos.db');
const db = new sqlite3.Database(dbFile);

const pinHash = bcrypt.hashSync('1234', 10);

const users = [
  { id: 'u1', name: 'المدير العام', username: 'admin', pin: pinHash, role: 'admin', dept: 'executive' },
  { id: 'u2', name: 'معتز حلمي عثمان', username: 'moataz', pin: pinHash, role: 'manager', dept: 'operations' },
  { id: 'u3', name: 'عبدالرحمن تركي', username: 'turki', pin: pinHash, role: 'manager', dept: 'sales' }
];

db.serialize(() => {
  console.log('--- Starting Database Seeding ---');
  
  users.forEach(user => {
    db.run(
      `INSERT OR IGNORE INTO users (id, name, username, pin_hash, role, dept) VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.username, user.pin, user.role, user.dept],
      (err) => {
        if (err) console.error(`Error seeding user ${user.username}:`, err.message);
        else console.log(`User ${user.username} created successfully (PIN: 1234)`);
      }
    );
  });
  
  // Create current month if not exists
  const currentMonth = new Date().toISOString().slice(0, 7);
  db.run(`INSERT OR IGNORE INTO months (id, is_locked) VALUES (?, 0)`, [currentMonth]);
  
  console.log('--- Seeding Completed ---');
});
