const express = require('express');
const app = express();

const FLAG = process.env.FLAG || 'CGS{test-flag}';
const PORT = process.env.PORT || 3000;
const SECRET_UA = 'OldBrowser/1.0';

app.get('/', (req, res) => {
  const ua = req.headers['user-agent'] || '';

  if (ua.includes(SECRET_UA)) {
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RetroNet</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Courier New', monospace; background: #000; color: #33ff33; }
header { background: #000; border-bottom: 2px solid #33ff33; padding: 2rem; text-align: center; }
header h1 { font-size: 2.5rem; text-shadow: 0 0 10px #33ff33; letter-spacing: 4px; }
header p { color: #33ff33; opacity: 0.7; margin-top: 0.5rem; }
.container { max-width: 800px; margin: 2rem auto; padding: 2rem; }
.ascii-art { text-align: center; font-size: 0.7rem; line-height: 1.2; white-space: pre; margin: 2rem 0; color: #33ff33; }
.flag-box { border: 2px solid #33ff33; padding: 1.5rem; text-align: center; margin: 2rem 0; background: #0a0a0a; }
.flag-box h2 { font-size: 1rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px; }
</style>
</head>
<body>
<header>
<h1>RETRONET</h1>
<p>Welcome back, vintage user.</p>
</header>
<div class="container">
<div class="ascii-art">
╔══════════════════════════════════╗
║    ACCESS GRANTED                ║
║    You have found the truth.     ║
╚══════════════════════════════════╝
</div>
<div class="flag-box">
<h2>Decrypted Payload</h2>
<p style="font-size: 1.4rem; word-break: break-all;">${FLAG}</p>
</div>
<p style="text-align: center; margin-top: 2rem;">Your browser has been verified as authentic.</p>
</div>
</body>
</html>`);
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RetroNet</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Courier New', monospace; background: #1a1a2e; color: #ccc; }
header { background: #16213e; border-bottom: 2px solid #e94560; padding: 2rem; text-align: center; }
header h1 { font-size: 2.5rem; color: #e94560; letter-spacing: 4px; text-shadow: 0 0 5px rgba(233,69,96,0.5); }
header p { color: #aaa; margin-top: 0.5rem; }
.container { max-width: 800px; margin: 2rem auto; padding: 2rem; text-align: center; }
.card { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; padding: 3rem 2rem; margin: 2rem 0; }
.warning-icon { font-size: 3rem; margin-bottom: 1rem; }
.card h2 { color: #e94560; margin-bottom: 1rem; }
.card p { line-height: 1.6; color: #aaa; }
.hint { margin-top: 2rem; padding: 1rem; border: 1px dashed #555; color: #888; font-size: 0.85rem; }
.hint span { color: #e94560; }
footer { text-align: center; padding: 2rem; color: #555; font-size: 0.8rem; }
</style>
</head>
<body>
<header>
<h1>RETRONET</h1>
<p>Modern browser interface</p>
</header>
<div class="container">
<div class="card">
<div class="warning-icon">&#9888;</div>
<h2>Browser Not Supported</h2>
<p>Sorry, this content isn't available in your browser.</p>
<p style="margin-top: 0.5rem;">Only users with the most ancient browser can see the truth.</p>
<p style="margin-top: 0.5rem;">This site requires a legacy user-agent to unlock its secrets.</p>
</div>
<div class="hint">
&#9881; System note: <span>UA_WHITELIST</span> contains deprecated entries from the early 2000s era.
</div>
</div>
<footer>RetroNet Classic &copy; 2026 &mdash; Preserving the web of yesterday.</footer>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
