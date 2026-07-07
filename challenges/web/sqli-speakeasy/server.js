const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.urlencoded({ extended: false }));

const db = new Database(path.join(__dirname, 'database.db'));
db.pragma('journal_mode = WAL');

const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
if (!row) {
  db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'real_password_here');
}

app.get('/', (req, res) => {
  res.send(`
    <html><body style="background:#111;color:#0f0;font-family:monospace;text-align:center;padding-top:4rem;">
      <h1>&#x1f3e1; Speakeasy Login</h1>
      <form method="POST" action="/login" style="display:inline-block;text-align:left;">
        <label>Username:<br><input type="text" name="username" style="width:100%;padding:4px;"></label><br><br>
        <label>Password:<br><input type="password" name="password" style="width:100%;padding:4px;"></label><br><br>
        <button type="submit" style="padding:6px 20px;cursor:pointer;">Login</button>
      </form>
    </body></html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  try {
    const user = db.prepare(query).get();
    if (user) {
      return res.send('CGS{uni0n_s3l3ct_y0ur_w4y_1n}');
    }
    return res.send('Invalid credentials');
  } catch (e) {
    return res.send('Error: ' + e.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
