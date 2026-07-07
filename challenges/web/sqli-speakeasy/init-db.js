const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)').run('admin', 'real_password_here');

db.close();
console.log('Database initialized at ' + dbPath);
