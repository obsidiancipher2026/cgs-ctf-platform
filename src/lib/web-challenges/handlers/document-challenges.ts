import { ChallengeDef, type PlaygroundRequest, type PlaygroundResponse } from '../types'

const FLAG_NOVASEC = 'CGS{h3ad3rs_sp34k_l0ud3r_th4n_p4g3s}'
const FLAG_TIMEVAULT = 'CGS{css_v4r1abl3s_4r3_m0r3_th4n_c0l0rs}'
const FLAG_DEBUGMODE = 'CGS{c0ns0l3_l0gs_d0nt_l13_t0_y0u}'

function novasecPage(req: PlaygroundRequest): PlaygroundResponse {
  return {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'X-NovaSec-Secret': FLAG_NOVASEC,
    },
    body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>NovaSec Labs</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a1a;color:#e0e0e0;display:flex;flex-direction:column;align-items:center}
header{width:100%;padding:20px 40px;background:#12122a;border-bottom:1px solid #2a2a5a;display:flex;justify-content:space-between;align-items:center}
header h1{color:#6c63ff;font-size:24px;letter-spacing:2px}
nav a{color:#8888cc;text-decoration:none;margin-left:20px;font-size:14px}
.hero{text-align:center;padding:80px 20px 40px;max-width:800px}
.hero h2{font-size:42px;background:linear-gradient(135deg,#6c63ff,#ff6584);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px}
.hero p{color:#8888bb;font-size:18px;line-height:1.6}
.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;padding:40px;max-width:1000px;width:100%}
.card{background:#12122a;border:1px solid #2a2a5a;border-radius:12px;padding:24px;text-align:center}
.card h3{color:#6c63ff;margin-bottom:8px}
.card p{color:#6666aa;font-size:13px}
.transparency{background:#12122a;border:1px solid #2a2a5a;border-radius:12px;padding:30px;margin:40px;max-width:800px;width:calc(100% - 80px)}
.transparency h3{color:#6c63ff;margin-bottom:12px}
.transparency pre{background:#0a0a1a;padding:16px;border-radius:8px;color:#66ff99;overflow-x:auto;font-size:13px}
footer{padding:20px;color:#444477;font-size:12px}
</style>
</head>
<body>
<header><h1>NovaSec</h1><nav><a href="#">Home</a><a href="#">Services</a><a href="#">About</a><a href="#">Contact</a></nav></header>
<section class="hero"><h2>Secure the Future</h2><p>NovaSec Labs delivers cutting-edge cybersecurity solutions. Our platform is engineered for zero-trust environments.</p></section>
<section class="services">
<div class="card"><h3>Threat Intel</h3><p>Real-time threat detection powered by AI.</p></div>
<div class="card"><h3>Cloud Shield</h3><p>Zero-trust access control for cloud infrastructure.</p></div>
<div class="card"><h3>Compliance</h3><p>Automated regulatory compliance monitoring.</p></div>
</section>
<section class="transparency">
<h3>Source Transparency</h3>
<p style="color:#6666aa;margin-bottom:12px;font-size:13px">Our commitment to open security. Verify this deployment:</p>
<pre>commit a3f2c8e1b9d4f6a7c0e2b8d1f3a5c7e9b0d2f4a6<br>branch: main<br>status: production<br>audit: passed</pre>
</section>
<footer>&copy; 2026 NovaSec Labs. All rights reserved.</footer>
</body>
</html>`
  }
}

const timevaultPage = (): PlaygroundResponse => ({
  status: 200,
  headers: { 'Content-Type': 'text/html' },
  body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>TimeVault</title>
<style>
:root {
  --primary: #00d4aa;
  --bg: #0d1117;
  --surface: #161b22;
  --secret-phrase: "${FLAG_TIMEVAULT}";
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;background:var(--bg);color:#c9d1d9;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh}
.container{text-align:center;padding:40px}
h1{font-size:28px;color:var(--primary);letter-spacing:4px;margin-bottom:8px;text-transform:uppercase}
.subtitle{color:#8b949e;font-size:14px;margin-bottom:40px}
.timer{font-size:72px;font-weight:bold;color:var(--primary);font-family:'Courier New',monospace;margin-bottom:8px}
.label{color:#8b949e;font-size:12px;text-transform:uppercase;letter-spacing:2px}
.progress{width:300px;height:4px;background:#21262d;border-radius:2px;margin:30px auto;overflow:hidden}
.progress-bar{width:67%;height:100%;background:var(--primary);border-radius:2px}
.status{color:#8b949e;font-size:13px;margin-top:20px}
.status span{color:var(--primary)}
</style>
</head>
<body>
<div class="container">
<h1>TimeVault</h1>
<p class="subtitle">Classified Countdown Sequence</p>
<div class="timer" id="timer">00:23:17</div>
<p class="label">Until Declassification</p>
<div class="progress"><div class="progress-bar"></div></div>
<p class="status">Status: <span>ENCRYPTED</span> &bull; Authentication: <span>REQUIRED</span></p>
<p style="color:#30363d;font-size:11px;margin-top:40px">TimeVault v2.4.1 &bull; Unauthorized access prohibited</p>
</div>
<script>
let sec=1397;const t=document.getElementById('timer');
setInterval(()=>{sec--;const h=String(Math.floor(sec/3600)).padStart(2,'0'),m=String(Math.floor((sec%3600)/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');t.textContent=h+':'+m+':'+s},1000);
</script>
</body>
</html>`
})

const debugmodePage = (): PlaygroundResponse => ({
  status: 200,
  headers: { 'Content-Type': 'text/html' },
  body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>CGS SysMonitor</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0c0f14;color:#c9d1d9;font-family:'JetBrains Mono','Courier New',monospace;display:flex;flex-direction:column;align-items:center;padding:40px}
.container{max-width:900px;width:100%}
h1{font-size:16px;color:#58a6ff;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}
.header-bar{display:flex;justify-content:space-between;color:#8b949e;font-size:11px;padding:8px 0;border-bottom:1px solid #21262d;margin-bottom:20px}
.metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px}
.metric{background:#161b22;border:1px solid #21262d;border-radius:6px;padding:16px}
.metric-label{color:#8b949e;font-size:10px;text-transform:uppercase;letter-spacing:1px}
.metric-value{color:#58a6ff;font-size:24px;font-weight:bold;margin-top:4px}
.metric-value.green{color:#3fb950}.metric-value.yellow{color:#d29922}.metric-value.red{color:#f85149}
.log-section{background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:16px;margin-bottom:20px}
.log-section h2{color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.log-entry{color:#8b949e;font-size:12px;padding:3px 0;border-bottom:1px solid #161b22}
.log-entry .time{color:#484f58}.log-entry .info{color:#58a6ff}.log-entry .warn{color:#d29922}.log-entry .debug{color:#3fb950}
#debug-output{margin-top:16px;padding:16px;background:#0a0c10;border:1px solid #21262d;border-radius:6px;display:none}
#debug-output pre{color:#3fb950;font-size:13px;white-space:pre-wrap}
footer{color:#484f58;font-size:10px;margin-top:20px;text-align:center}
</style>
</head>
<body>
<div class="container">
<h1>CGS SysMonitor &bull; DEBUG MODE</h1>
<div class="header-bar"><span>[CGS Internal Network]</span><span>Session: admin-9f82b4e1 &bull; Uptime: 14d 7h 32m</span></div>
<div class="metric-grid">
<div class="metric"><div class="metric-label">CPU Load</div><div class="metric-value" id="cpu">23%</div></div>
<div class="metric"><div class="metric-label">Memory</div><div class="metric-value green" id="mem">6.2 / 16 GB</div></div>
<div class="metric"><div class="metric-label">Network</div><div class="metric-value" id="net">1.4 Gbps</div></div>
<div class="metric"><div class="metric-label">Threats</div><div class="metric-value green" id="threats">0</div></div>
</div>
<div class="log-section">
<h2>System Logs (live)</h2>
<div id="logs">
<div class="log-entry"><span class="time">[14:23:01]</span> <span class="info">[INFO]</span> Health check passed</div>
<div class="log-entry"><span class="time">[14:23:04]</span> <span class="info">[INFO]</span> Firewall rules synchronized</div>
<div class="log-entry"><span class="time">[14:23:07]</span> <span class="warn">[WARN]</span> Rate limit threshold at 72%</div>
<div class="log-entry"><span class="time">[14:23:10]</span> <span class="info">[INFO]</span> Session token refreshed for admin</div>
<div class="log-entry"><span class="time">[14:23:13]</span> <span class="debug">[DEBUG]</span> Diagnostic mode active &mdash; verbose output enabled</div>
</div>
<div id="debug-output"><pre></pre></div>
</div>
<footer>CGS SysMonitor v3.0.2 &bull; INTERNAL USE ONLY &bull; Unauthorized access prohibited</footer>
</div>
<script>
setTimeout(function(){var d=document.getElementById('debug-output');d.style.display='block';d.querySelector('pre').textContent='[DEBUG] Decoded payload: ${FLAG_DEBUGMODE}';console.log('${FLAG_DEBUGMODE}')},4000);
var c=23;setInterval(function(){c=Math.floor(Math.random()*30)+15;document.getElementById('cpu').textContent=c+'%';document.getElementById('mem').textContent=(Math.random()*8+4).toFixed(1)+' / 16 GB';document.getElementById('net').textContent=(Math.random()*2+0.5).toFixed(1)+' Gbps'},3000);
</script>
</body>
</html>`
})

export const documentChallenges: ChallengeDef[] = [
  {
    slug: 'novasec-portal',
    title: 'NovaSec Portal',
    handler: novasecPage,
  },
  {
    slug: 'timevault',
    title: 'TimeVault',
    handler: () => timevaultPage(),
  },
  {
    slug: 'debugmode',
    title: 'DebugMode',
    handler: () => debugmodePage(),
  },
]
