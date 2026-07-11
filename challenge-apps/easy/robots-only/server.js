const express = require('express');
const app = express();

const FLAG = process.env.FLAG || 'CGS{test-flag}';
const PORT = process.env.PORT || 3000;
const HIDDEN_SLUG = 'hidden-admin-9f2';

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SecureDash Analytics</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; color: #333; }
header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 2rem 0; text-align: center; }
header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
header p { font-size: 1.1rem; opacity: 0.8; }
.container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
.card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.card h3 { color: #1a1a2e; margin-bottom: 0.5rem; }
.card .value { font-size: 2rem; font-weight: bold; color: #16213e; }
footer { text-align: center; padding: 2rem; color: #666; font-size: 0.9rem; }
</style>
</head>
<body>
<header>
<h1>SecureDash Analytics</h1>
<p>Enterprise-grade dashboard for your business metrics</p>
</header>
<div class="container">
<div class="stats">
<div class="card">
<h3>Active Users</h3>
<div class="value">12,847</div>
<p>+3.2% this week</p>
</div>
<div class="card">
<h3>Revenue</h3>
<div class="value">$48,293</div>
<p>+12.5% this month</p>
</div>
<div class="card">
<h3>Page Views</h3>
<div class="value">1.2M</div>
<p>+8.7% vs last month</p>
</div>
</div>
<section style="margin: 3rem 0;">
<h2>Platform Overview</h2>
<p style="margin: 1rem 0; line-height: 1.6;">SecureDash provides real-time analytics, user tracking, and conversion optimization for modern businesses. Our platform is trusted by over 5,000 companies worldwide.</p>
<p style="line-height: 1.6;">This is a restricted platform. Unauthorized access is prohibited. All activities are monitored and logged.</p>
</section>
</div>
<footer>&copy; 2026 SecureDash Analytics. All rights reserved.</footer>
</body>
</html>`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /${HIDDEN_SLUG}
Disallow: /admin
Disallow: /internal`);
});

app.get(`/${HIDDEN_SLUG}`, (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Admin Panel</title>
<style>
body { font-family: monospace; background: #0d0d0d; color: #00ff00; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
pre { background: #1a1a1a; padding: 2rem; border: 1px solid #00ff00; border-radius: 4px; }
</style>
</head>
<body>
<pre>
  ___    _    __  __  ___  _   _
 / _ \\  / \\  |  \\/  |/ _ \\| \\ | |
| | | |/ _ \\ | |\\/| | | | |  \\| |
| |_| / ___ \\| |  | | |_| | |\\  |
 \\___/_/   \\_\\_|  |_|\\___/|_| \\_|

Access Granted.
FLAG: ${FLAG}
</pre>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
