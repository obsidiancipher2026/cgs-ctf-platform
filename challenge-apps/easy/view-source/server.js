const express = require('express');
const app = express();

const FLAG = process.env.FLAG || 'CGS{test-flag}';
const PORT = process.env.PORT || 3000;

const encodedFlag = Buffer.from(FLAG).toString('base64');

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NexGen Technologies</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; color: #333; }
header { background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: white; padding: 3rem 0; text-align: center; }
header h1 { font-size: 3rem; letter-spacing: 2px; }
header p { font-size: 1.2rem; opacity: 0.8; margin-top: 0.5rem; }
nav { background: #203a43; padding: 1rem; text-align: center; }
nav a { color: white; text-decoration: none; margin: 0 1.5rem; font-weight: 500; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
.hero { text-align: center; padding: 4rem 0; }
.hero h2 { font-size: 2.5rem; color: #0f2027; }
.hero p { font-size: 1.1rem; color: #666; margin: 1rem 0; line-height: 1.6; }
.badge { display: inline-block; background: #e74c3c; color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin-bottom: 1rem; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin: 3rem 0; }
.feature { text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; }
.feature h3 { margin-bottom: 0.5rem; color: #203a43; }
.feature p { color: #666; line-height: 1.5; }
footer { text-align: center; padding: 2rem; background: #0f2027; color: white; font-size: 0.9rem; }
.construction { display: inline-block; background: #f39c12; color: #333; padding: 0.3rem 0.8rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
</style>
</head>
<body>
<header>
<h1>NexGen Technologies</h1>
<p>Building the future of enterprise software</p>
</header>
<nav>
<a href="#">Home</a>
<a href="#">Products</a>
<a href="#">Solutions</a>
<a href="#">About</a>
<a href="#">Contact</a>
</nav>
<div class="container">
<div class="hero">
<span class="badge">NEW PLATFORM LAUNCHING</span>
<h2>Something Amazing Is Coming</h2>
<p>We're hard at work building our next-generation cloud platform. This page will be updated with more details soon.</p>
<p>Stay tuned for groundbreaking innovations in AI-driven analytics, real-time data processing, and scalable infrastructure solutions.</p>
</div>
<div class="features">
<div class="feature">
<h3>Cloud Platform</h3>
<p>Scalable infrastructure powered by cutting-edge technology.</p>
</div>
<div class="feature">
<h3>AI Analytics</h3>
<p>Harness the power of machine learning for your business data.</p>
</div>
<div class="feature">
<h3>Security First</h3>
<p>Enterprise-grade security built into every layer.</p>
</div>
</div>
</div>
<footer>
<p>&copy; 2026 NexGen Technologies, Inc. All rights reserved.</p>
</footer>
<!-- ${encodedFlag} -->
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
