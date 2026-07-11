const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());

const FLAG = process.env.FLAG || 'CGS{test-flag}';
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const role = req.cookies.role || 'user';

  if (role === 'admin') {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #e8f5e9; color: #333; }
header { background: linear-gradient(135deg, #1b5e20, #2e7d32); color: white; padding: 2rem 0; text-align: center; }
header h1 { font-size: 2.2rem; }
nav { background: #2e7d32; padding: 0.8rem; text-align: center; }
nav a { color: white; text-decoration: none; margin: 0 1.5rem; font-weight: 500; }
.container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
.card { background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 1.5rem 0; }
.flag-box { background: #1b5e20; color: #fff; padding: 1.5rem; border-radius: 4px; font-family: monospace; font-size: 1.2rem; text-align: center; }
.badge { display: inline-block; background: #ffc107; color: #333; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
</style>
</head>
<body>
<header>
<h1>Admin Dashboard</h1>
</header>
<nav>
<a href="#">Home</a>
<a href="#">Users</a>
<a href="#">Settings</a>
<a href="#">Reports</a>
</nav>
<div class="container">
<div class="card">
<h2>Welcome, Administrator</h2>
<p style="margin-top: 0.5rem;">You are logged in with elevated privileges. Here is your secret access token:</p>
<div class="flag-box">${FLAG}</div>
</div>
<div class="card">
<h3>Recent Activity</h3>
<p>No recent activity to display.</p>
</div>
</div>
</body>
</html>`);
  } else {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; }
header { background: linear-gradient(135deg, #1565c0, #1976d2); color: white; padding: 2rem 0; text-align: center; }
header h1 { font-size: 2.2rem; }
nav { background: #1976d2; padding: 0.8rem; text-align: center; }
nav a { color: white; text-decoration: none; margin: 0 1.5rem; font-weight: 500; }
.container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
.card { background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 1.5rem 0; }
.warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; border-radius: 4px; }
</style>
</head>
<body>
<header>
<h1>Dashboard</h1>
</header>
<nav>
<a href="#">Home</a>
<a href="#">Profile</a>
<a href="#">Settings</a>
</nav>
<div class="container">
<div class="card">
<h2>Welcome, Guest!</h2>
<div class="warning">
<p><strong>Access Restricted.</strong> You are currently logged in as <strong>${role}</strong>.</p>
<p style="margin-top: 0.5rem;">Only users with the appropriate role can access administrative functions.</p>
</div>
</div>
<div class="card">
<h3>Your Dashboard</h3>
<p>This is your personal dashboard. Contact your administrator if you need elevated access.</p>
</div>
</div>
</body>
</html>`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
