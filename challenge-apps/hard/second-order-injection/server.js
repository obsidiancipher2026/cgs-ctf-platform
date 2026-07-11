const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const users = {};

app.get('/', (req, res) => {
  res.send(`<h1>Second-Order Injection</h1>
    <a href="/profile">Profile</a> | <a href="/admin/search">Admin Search</a>`);
});

app.post('/update-profile', (req, res) => {
  const name = req.body.display_name || 'Anonymous';
  const safe = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  users['default'] = { display_name: name, safe_display: safe };
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  const u = users['default'] || { safe_display: 'Anonymous' };
  res.send(`<h1>Profile</h1>
    <p>Display name: ${u.safe_display}</p>
    <form method="POST" action="/update-profile">
      <input name="display_name" placeholder="Set display name"><button>Update</button>
    </form>`);
});

app.get('/admin/search', (req, res) => {
  const q = req.query.q || '';
  const u = users['default'];
  if (!u) return res.send('<h1>Admin Search</h1><p>No users yet.</p>');

  const name = u.display_name;
  const query = `SELECT * FROM users WHERE display_name LIKE '%${name}%' AND query_param = '${q}'`;

  let html = `<h1>Admin Search</h1>
    <p>Simulated SQL query: <code>${query.replace(/</g, '&lt;')}</code></p>
    <form><input name="q" placeholder="Search query"><button>Search</button></form>`;

  const lower = query.toLowerCase();
  if (lower.includes("' or '1'='1") || lower.includes("' or 1=1") || lower.includes("'--")) {
    html += `<p><b>SQL Injection detected!</b> All users leaked!</p>`;
    html += `<p><b>FLAG:</b> ${FLAG}</p>`;
  } else {
    html += `<p>No results found.</p>`;
  }
  res.send(html);
});

app.listen(PORT, () => console.log(`second-order-injection running on ${PORT}`));
