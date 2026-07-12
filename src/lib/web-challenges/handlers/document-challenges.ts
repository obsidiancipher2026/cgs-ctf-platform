import { ChallengeDef, type PlaygroundRequest, type PlaygroundResponse, html, json, text, error } from '../types'

// ═══════════════════════════════════
// HELPER
// ═══════════════════════════════════

function serve(path: string, body: string, type = 'text/html'): PlaygroundResponse {
  return { status: 200, headers: { 'Content-Type': type }, body }
}
function errJson(status: number, msg: string): PlaygroundResponse {
  return { status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) }
}

// ═══════════════════════════════════
// EASY TIER (7)
// ═══════════════════════════════════

// 1 — NovaSec Portal
const FLAG_NOVASEC = 'CGS{h3ad3rs_sp34k_l0ud3r_th4n_p4g3s}'
const novasecHandler = (req: PlaygroundRequest): PlaygroundResponse => ({
  status: 200,
  headers: { 'Content-Type': 'text/html', 'X-NovaSec-Secret': FLAG_NOVASEC },
  body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>NovaSec Labs</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a1a;color:#e0e0e0;display:flex;flex-direction:column;align-items:center}
header{width:100%;padding:20px 40px;background:#12122a;border-bottom:1px solid #2a2a5a;display:flex;justify-content:space-between;align-items:center}
header h1{color:#6c63ff;font-size:24px;letter-spacing:2px}nav a{color:#8888cc;text-decoration:none;margin-left:20px;font-size:14px}
.hero{text-align:center;padding:80px 20px 40px;max-width:800px}.hero h2{font-size:42px;background:linear-gradient(135deg,#6c63ff,#ff6584);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px}
.hero p{color:#8888bb;font-size:18px;line-height:1.6}.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;padding:40px;max-width:1000px;width:100%}
.card{background:#12122a;border:1px solid #2a2a5a;border-radius:12px;padding:24px;text-align:center}.card h3{color:#6c63ff;margin-bottom:8px}.card p{color:#6666aa;font-size:13px}
.transparency{background:#12122a;border:1px solid #2a2a5a;border-radius:12px;padding:30px;margin:40px;max-width:800px;width:calc(100% - 80px)}
.transparency h3{color:#6c63ff;margin-bottom:12px}.transparency pre{background:#0a0a1a;padding:16px;border-radius:8px;color:#66ff99;overflow-x:auto;font-size:13px}
footer{padding:20px;color:#444477;font-size:12px}</style></head><body>
<header><h1>NovaSec</h1><nav><a href="#">Home</a><a href="#">Services</a><a href="#">About</a><a href="#">Contact</a></nav></header>
<section class="hero"><h2>Secure the Future</h2><p>NovaSec Labs delivers cutting-edge cybersecurity solutions.</p></section>
<section class="services"><div class="card"><h3>Threat Intel</h3><p>Real-time threat detection powered by AI.</p></div>
<div class="card"><h3>Cloud Shield</h3><p>Zero-trust access control for cloud infrastructure.</p></div>
<div class="card"><h3>Compliance</h3><p>Automated regulatory compliance monitoring.</p></div></section>
<section class="transparency"><h3>Source Transparency</h3><p style="color:#6666aa;margin-bottom:12px;font-size:13px">Our commitment to open security.</p>
<pre>commit a3f2c8e1b9d4f6a7c0e2b8d1f3a5c7e9b0d2f4a6<br>branch: main<br>status: production<br>audit: passed</pre>
</section>
<!-- Our servers know things this page never will. -->
<footer>&copy; 2026 NovaSec Labs. All rights reserved.</footer>
</body></html>`
})

// 2 — TimeVault
const FLAG_TIMEVAULT = 'CGS{css_v4r1abl3s_4r3_m0r3_th4n_c0l0rs}'
const timevaultHandler = (): PlaygroundResponse => serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>TimeVault</title>
<style>:root{--vault-key:${FLAG_TIMEVAULT};--primary:#8B5CF6;--bg:#070714;--text:#E2E8F0;--muted:#64748B}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;overflow:hidden}
.container{text-align:center;padding:40px;position:relative;z-index:1}
h1{font-size:28px;color:var(--primary);letter-spacing:6px;margin-bottom:8px;text-transform:uppercase}
.subtitle{color:var(--muted);font-size:14px;margin-bottom:40px}
.timer{font-size:72px;font-weight:bold;color:var(--primary);font-family:'Courier New',monospace;margin-bottom:8px}
.label{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:2px}
.progress{width:300px;height:4px;background:#1a1a3a;border-radius:2px;margin:30px auto;overflow:hidden}
.progress-bar{width:67%;height:100%;background:var(--primary);border-radius:2px}
.classified{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:120px;color:rgba(255,0,0,0.06);font-weight:bold;letter-spacing:20px;pointer-events:none;z-index:0;user-select:none}
footer{color:var(--muted);font-size:11px;margin-top:40px;position:relative;z-index:1}
.stars{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0}
@keyframes twinkle{0%,100%{opacity:0.3}50%{opacity:1}}</style></head><body>
<div class="stars" id="stars"></div><div class="classified">CLASSIFIED</div>
<div class="container"><h1>TimeVault</h1><p class="subtitle">Classified Countdown Sequence</p>
<div class="timer" id="timer">00:23:17</div><p class="label">Until Declassification</p>
<div class="progress"><div class="progress-bar"></div></div>
<p class="status">Status: <span style="color:var(--primary)">ENCRYPTED</span> &bull; Authentication: <span style="color:var(--primary)">REQUIRED</span></p>
<p style="color:#30363d;font-size:11px;margin-top:40px">TimeVault v2.4.1 &bull; Unauthorized access prohibited</p></div>
<script>
let S=1397;const T=document.getElementById('timer');setInterval(function(){S--;var a=String(Math.floor(S/3600)|0).padStart(2,'0'),b=String(Math.floor((S%3600)/60)|0).padStart(2,'0'),c=String(S%60|0).padStart(2,'0');T.textContent=a+':'+b+':'+c},1000);
for(var i=0;i<200;i++){var s=document.createElement('div');s.style.cssText='position:absolute;width:'+(Math.random()*2|0)+'px;height:'+(Math.random()*2|0)+'px;background:#fff;border-radius:50%;left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;animation:twinkle '+(1+Math.random()*3).toFixed(1)+'s infinite';document.getElementById('stars').appendChild(s)}
</script></body></html>`)

// 3 — DebugMode
const FLAG_DEBUGMODE = 'CGS{c0ns0l3_l0gs_d0nt_l13_t0_y0u}'
const debugmodeHandler = (): PlaygroundResponse => serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS SysMonitor</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{background:#0c0f14;color:#c9d1d9;font-family:'Courier New',monospace;display:flex;flex-direction:column;align-items:center;padding:40px}
.container{max-width:900px;width:100%}
h1{font-size:16px;color:#58a6ff;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}
.header-bar{display:flex;justify-content:space-between;color:#8b949e;font-size:11px;padding:8px 0;border-bottom:1px solid #21262d;margin-bottom:20px}
.metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px}
.metric{background:#161b22;border:1px solid #21262d;border-radius:6px;padding:16px}
.metric-label{color:#8b949e;font-size:10px;text-transform:uppercase;letter-spacing:1px}
.metric-value{color:#58a6ff;font-size:24px;font-weight:bold;margin-top:4px}
.metric-value.green{color:#3fb950}.log-section{background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:16px;margin-bottom:20px}
.log-section h2{color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.log-entry{color:#8b949e;font-size:12px;padding:3px 0;border-bottom:1px solid #161b22;font-family:'Courier New',monospace}
.log-entry .time{color:#484f58}.log-entry .info{color:#58a6ff}.log-entry .warn{color:#d29922}.log-entry .debug{color:#3fb950}
.cursor{display:inline-block;width:8px;height:14px;background:#3fb950;animation:blink 1s step-end infinite;vertical-align:middle;margin-left:4px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.overlay{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.03) 0px,rgba(0,0,0,0.03) 1px,transparent 1px,transparent 2px)}
footer{color:#484f58;font-size:10px;margin-top:20px;text-align:center}</style></head><body>
<div class="overlay"></div><div class="container">
<h1>CGS SysMonitor &bull; DEBUG MODE</h1>
<div class="header-bar"><span>[CGS Internal Network]</span><span>Session: admin-9f82b4e1 &bull; Uptime: 14d 7h 32m</span></div>
<div class="metric-grid"><div class="metric"><div class="metric-label">CPU Load</div><div class="metric-value" id="cpu">23%</div></div>
<div class="metric"><div class="metric-label">Memory</div><div class="metric-value green" id="mem">6.2 / 16 GB</div></div>
<div class="metric"><div class="metric-label">Network</div><div class="metric-value" id="net">1.4 Gbps</div></div>
<div class="metric"><div class="metric-label">Threats</div><div class="metric-value green" id="threats">0</div></div></div>
<div class="log-section"><h2>System Logs (live)</h2><div id="logs"></div></div>
<footer>CGS SysMonitor v3.0.2 &bull; INTERNAL USE ONLY</footer></div>
<script>
(function(){var L=document.getElementById('logs'),E=['[INFO] Health check passed','[INFO] Firewall rules synchronized','[WARN] Rate limit threshold at 72%','[INFO] Session token refreshed for admin','[DEBUG] Diagnostic mode active','[INFO] DNS resolution: 4ms','[WARN] Certificate expires in 14 days','[INFO] Backup completed: 2.4GB','[DEBUG] Memory heap utilization: 47%','[INFO] User session validated','[WARN] Deprecated API call detected: /v1/stats','[INFO] Audit log flushed to storage','[DEBUG] Replication lag: 0.2s'],i=0;!function n(){var d=document.createElement('div');d.className='log-entry';var t=new Date();d.innerHTML='<span class="time">['+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0')+':'+String(t.getSeconds()).padStart(2,'0')+']</span> '+E[i% E.length];L.appendChild(d);if(L.children.length>12)L.removeChild(L.firstChild);i++;setTimeout(n,800+Math.random()*800|0)}();
setTimeout(function(){try{console.log('%c[DEBUG] Auth subsystem check passed. Session token: ${FLAG_DEBUGMODE}','color:#00FF41;font-weight:bold;font-size:13px;font-family:monospace')}catch(e){}},4000);
setInterval(function(){document.getElementById('cpu').textContent=(Math.random()*30+15|0)+'%';document.getElementById('mem').textContent=(Math.random()*8+4).toFixed(1)+' / 16 GB';document.getElementById('net').textContent=(Math.random()*2+0.5).toFixed(1)+' Gbps'},3000)})();
</script></body></html>`)

// 4 — PixelArchive
const FLAG_PIXEL = 'CGS{3x1f_d4t4_hu6h_wh0_kn3w}'
const pixelarchiveHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/assets/featured-photo.jpg') {
    const comment = `CGS{3x1f_d4t4_hu6h_wh0_kn3w}`
    const dummyJpeg = Buffer.alloc(2)
    dummyJpeg[0] = 0xFF; dummyJpeg[1] = 0xD8
    const body = `\uFFFD\uFFFD JPEG with embedded metadata.\nImageDescription: ${comment}\n(This is a simulated JPEG for the playground — the real challenge uses EXIF metadata in a real JPEG file.)`
    return { status: 200, headers: { 'Content-Type': 'image/jpeg', 'Content-Disposition': 'attachment; filename="featured-photo.jpg"' }, body }
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>PixelArchive</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;background:#FAFAF7;color:#1C1C1E;padding:40px;display:flex;flex-direction:column;align-items:center}
header{text-align:center;margin-bottom:40px}header h1{font-size:36px;font-weight:400;letter-spacing:-0.5px;margin-bottom:8px}
header p{color:#8E8E93;font-size:14px;font-family:-apple-system,sans-serif}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;max-width:1000px;width:100%}
.photo{background:#fff;border:1px solid #E5E5EA;border-radius:2px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.photo img{width:100%;height:260px;object-fit:cover;display:block;background:#E5E5EA}
.photo .caption{padding:12px 16px;color:#3A3A3C;font-size:13px;line-height:1.5;font-family:-apple-system,sans-serif}
.featured{max-width:700px;margin:40px 0;background:#fff;border:1px solid #E5E5EA;border-radius:2px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.featured img{width:100%;height:400px;object-fit:cover;display:block;background:#E5E5EA}
.featured .caption{padding:16px 20px}
.featured .caption h3{font-weight:400;font-size:18px;margin-bottom:4px;color:#1C1C1E}
.featured .caption p{color:#8E8E93;font-size:13px;line-height:1.6;font-family:-apple-system,sans-serif}
.featured .caption a{color:#007AFF;text-decoration:none;font-size:13px;display:inline-block;margin-top:8px}
footer{margin-top:60px;color:#C7C7CC;font-size:12px;text-align:center;font-family:-apple-system,sans-serif}
footer em{font-style:italic}</style></head><body>
<header><h1>PixelArchive</h1><p>&mdash; captured moments &mdash;</p></header>
<div class="featured"><div class="caption"><h3>Featured: "Silent Horizon"</h3>    <p>Late autumn light over the coastal range. Shot on medium format film, pushed one stop.</p><a href="/standalone/pixelarchive/assets/featured-photo.jpg" download>Download Original &darr;</a></div></div>
<div class="gallery">
<div class="photo"><div class="caption">Lichen Study #4 &mdash; detail from a granite outcropping, Pacific Northwest.</div></div>
<div class="photo"><div class="caption">Steam &mdash; morning train through the valley, March 2024.</div></div>
<div class="photo"><div class="caption">Glass House &mdash; architectural study of reflected light.</div></div>
<div class="photo"><div class="caption">Persistence &mdash; a single dune grass in high wind, Oregon coast.</div></div></div>
<footer><em>Every frame carries more than what you see.</em><br>&copy; 2026 PixelArchive</footer></body></html>`)
}

// 5 — CrawlerTrap
const crawlerHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/robots.txt') return text('User-agent: *\nDisallow: /internal-preview-9f21\n')
  if (req.path.startsWith('/internal-preview-9f21')) {
    return serve(req.path, `<!DOCTYPE html><html><head><title>Internal</title></head><body style="background:#1a1a1a;color:#e0e0e0;font-family:monospace;padding:40px"><h1>Access Logged</h1><p>Flag: CGS{r0b0ts_txt_1s_n0t_4_f1r3w4ll}</p><p style="color:#666;font-size:12px">CGS Internal Preview &bull; authorized personnel only</p></body></html>`)
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Launch</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh}
.container{text-align:center;padding:40px;max-width:600px}.logo{font-size:14px;color:#14B8A6;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px}
h1{font-size:48px;font-weight:700;margin-bottom:16px;background:linear-gradient(135deg,#E2E8F0,#14B8A6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p{color:#94A3B8;font-size:16px;line-height:1.6;margin-bottom:30px}
form{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
input{background:#1E293B;border:1px solid #334155;color:#E2E8F0;padding:12px 16px;border-radius:6px;width:260px;font-size:14px}
button{background:#14B8A6;border:none;color:#0F172A;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer}
footer{color:#475569;font-size:12px;margin-top:60px}
.fade{color:#334155;font-size:11px;margin-top:12px}</style></head><body>
<div class="container"><div class="logo">CGS Labs</div><h1>Something new is coming.</h1>
<p>We're building the next generation of internal tools. Join the beta waitlist.</p>
<form><input type="email" placeholder="Enter your email"><button type="submit">Notify Me</button></form>
<p class="fade">Not launching soon. Stay tuned.</p><footer>&copy; 2026 CGS Labs &bull; Confidential</footer></div></body></html>`)
}

// 6 — StyleGuide
const STYLE_FLAG = 'CGS{ext3rn4l_css_h4s_c0mm3nts_t00}'
const styleguideHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/assets/tokens.css') {
    return serve(req.path, `/*
  CGS Design Tokens v1.4
  Internal build — do not redistribute
  flag: ${STYLE_FLAG}
*/
:root {
  --token-primary: #7C3AED;
  --token-secondary: #EC4899;
  --token-bg: #FFFFFF;
  --token-surface: #F9FAFB;
  --token-text: #111827;
  --token-muted: #6B7280;
  --token-border: #E5E7EB;
  --token-radius: 8px;
  --token-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--token-bg);color:var(--token-text);margin:0;padding:0}
h1,h2,h3{font-weight:600;line-height:1.3}
pre,code{font-family:'JetBrains Mono','Fira Code',monospace;background:var(--token-surface);padding:2px 6px;border-radius:4px;font-size:14px}
.swatch{width:48px;height:48px;border-radius:var(--token-radius);border:1px solid var(--token-border)}`, 'text/css')
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>CGS Design System</title><link rel="stylesheet" href="/standalone/styleguide/assets/tokens.css">
</head><body style="padding:40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111;max-width:960px;margin:0 auto">
<h1 style="font-size:28px;margin-bottom:4px">CGS Design System</h1>
<p style="color:#6B7280;margin-bottom:32px;font-size:14px">Internal Style Guide v1.4 — for CGS product teams</p>
<h2 style="font-size:18px;margin-bottom:16px;border-bottom:1px solid #E5E7EB;padding-bottom:8px">Design Tokens</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;margin-bottom:32px">
<div><div class="swatch" style="background:#7C3AED"></div><p style="font-size:12px;color:#6B7280;margin-top:4px">--token-primary #7C3AED</p></div>
<div><div class="swatch" style="background:#EC4899"></div><p style="font-size:12px;color:#6B7280;margin-top:4px">--token-secondary #EC4899</p></div>
<div><div class="swatch" style="background:#FFFFFF;border-color:#D1D5DB"></div><p style="font-size:12px;color:#6B7280;margin-top:4px">--token-bg #FFFFFF</p></div>
<div><div class="swatch" style="background:#F9FAFB;border-color:#D1D5DB"></div><p style="font-size:12px;color:#6B7280;margin-top:4px">--token-surface #F9FAFB</p></div>
<div><div class="swatch" style="background:#111827"></div><p style="font-size:12px;color:#6B7280;margin-top:4px">--token-text #111827</p></div>
<div><div class="swatch" style="background:#6B7280"></div><p style="font-size:12px;color:#6B7280;margin-top:4px">--token-muted #6B7280</p></div></div>
<h2 style="font-size:18px;margin-bottom:16px;border-bottom:1px solid #E5E7EB;padding-bottom:8px">Typography</h2>
<div style="margin-bottom:32px"><p style="font-size:32px;font-weight:600">Heading 1 — 32px</p><p style="font-size:24px;font-weight:600">Heading 2 — 24px</p><p style="font-size:18px;font-weight:600">Heading 3 — 18px</p><p style="font-size:14px;color:#6B7280">Body text — 14px / #6B7280 muted</p></div>
<h2 style="font-size:18px;margin-bottom:16px;border-bottom:1px solid #E5E7EB;padding-bottom:8px">Code</h2>
<div style="background:#F9FAFB;padding:16px;border-radius:8px;border:1px solid #E5E7EB"><pre style="margin:0;font-size:13px">import { tokens } from '@cgs/design-system'<br>const theme = { primary: tokens.primary }</pre></div>
<p style="text-align:center;color:#D1D5DB;font-size:11px;margin-top:60px">CGS Design System &bull; Confidential</p></body></html>`)
}

// 7 — EncodedBanner
const ENCODED_FLAG = 'CGS{b4s3_s1xty_f0ur_1s_n0t_3ncrypt10n}'
const encodedBanner = btoa(ENCODED_FLAG)
const encodedTracking = btoa('track-998877')
const encodedCampaign = btoa('phoenix-launch')
const encodedHandler = (): PlaygroundResponse => serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Launch Countdown</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:40px}
.badge{color:#FF2D78;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;border:1px solid #FF2D78;padding:6px 16px;border-radius:20px;display:inline-block}
h1{font-size:56px;font-weight:800;letter-spacing:-2px;margin-bottom:8px;background:linear-gradient(135deg,#fff,#FF2D78);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{color:#666;font-size:16px;margin-bottom:40px}
.countdown{display:flex;gap:24px;justify-content:center;margin-bottom:40px}
.countdown-item{text-align:center}.countdown-item .num{font-size:64px;font-weight:800;color:#FF2D78;line-height:1;font-variant-numeric:tabular-nums}
.countdown-item .lbl{color:#666;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
button{background:#FF2D78;color:#000;border:none;padding:14px 40px;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer}
footer{color:#333;font-size:11px;margin-top:60px}</style></head><body>
<div class="badge">Coming Soon</div><h1>Phoenix</h1><p class="sub">The next generation of CGS security intelligence</p>
<div class="countdown"><div class="countdown-item"><div class="num" id="d">00</div><div class="lbl">Days</div></div>
<div class="countdown-item"><div class="num" id="h">00</div><div class="lbl">Hours</div></div>
<div class="countdown-item"><div class="num" id="m">00</div><div class="lbl">Minutes</div></div>
<div class="countdown-item"><div class="num" id="s">00</div><div class="lbl">Seconds</div></div></div>
<button>Notify Me</button>
<!-- configuration script -->
<script id="launch-config" type="application/json">
{"launchDate":"2026-09-01T00:00:00Z","trackingId":"${encodedTracking}","campaign":"${encodedCampaign}","meta":"${encodedBanner}"}
</script>
<script>!function(){var T=new Date('2026-09-01').getTime();setInterval(function(){var n=Math.max(0,T-Date.now()),d=Math.floor(n/864e5),h=Math.floor((n%864e5)/36e5),m=Math.floor((n%36e5)/6e4),s=Math.floor((n%6e4)/1e3);document.getElementById('d').textContent=String(d).padStart(2,'0');document.getElementById('h').textContent=String(h).padStart(2,'0');document.getElementById('m').textContent=String(m).padStart(2,'0');document.getElementById('s').textContent=String(s).padStart(2,'0')},1e3)}()</script>
<footer>CGS Labs &bull; Confidential &bull; Phoenix Launch</footer></body></html>`)

// ═══════════════════════════════════
// MEDIUM TIER (10)
// ═══════════════════════════════════

// 8 — CookieCrumbs
const COOKIE_FLAG = 'CGS{c00k13s_ar3_just_s3lf_r3p0rted_st4te}'
const cookieHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/dashboard') {
    const role = req.cookies.role || 'guest'
    if (role === 'admin') return text('Welcome, admin.\n\nCGS{c00k13s_ar3_just_s3lf_r3p0rted_st4te}')
    return text('Access denied. Guests cannot view this page.')
  }
  const roleCookie = `role=guest; Path=/; HttpOnly=false`
  return {
    status: 200,
    headers: { 'Content-Type': 'text/html', 'Set-Cookie': roleCookie },
    body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Members</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;display:flex;flex-direction:column;align-items:center;padding:80px 20px}
h1{font-size:32px;margin-bottom:8px;color:#3B82F6}form{background:#1E293B;padding:32px;border-radius:12px;border:1px solid #334155;width:360px;margin-top:24px}
label{display:block;font-size:13px;color:#94A3B8;margin-bottom:6px}input{width:100%;padding:10px 14px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;margin-bottom:16px;font-size:14px}
button{width:100%;padding:12px;background:#3B82F6;border:none;border-radius:6px;color:#fff;font-weight:600;font-size:14px;cursor:pointer}
.error{color:#EF4444;font-size:13px;margin-top:12px;text-align:center}
.hint{color:#475569;font-size:11px;margin-top:20px;text-align:center}
a{color:#3B82F6;text-decoration:none;font-size:13px;display:block;text-align:center;margin-top:12px}</style></head><body>
<h1>CGS Members Portal</h1><p style="color:#94A3B8;margin-bottom:8px">Sign in to access your dashboard.</p>
<form id="login"><label>Username</label><input type="text" id="user" value="admin"><label>Password</label><input type="password" id="pass" value="password">
<button type="submit">Sign In</button><div class="error" id="err"></div></form><a href="dashboard">Dashboard (requires login)</a>
<p class="hint">Trouble signing in? Contact your administrator.</p>
<script>document.getElementById('login').addEventListener('submit',function(e){e.preventDefault();document.getElementById('err').textContent='Invalid credentials. Please try again.'})</script></body></html>`
  }
}

// 9 — TokenPeek
const TOKEN_FLAG = 'CGS{jwt_p4yl04ds_ar3_r34d4bl3_n0t_s3cur3}'
const tokenPeekHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/token') {
    const token = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url').replace(/=+$/, '') + '.' + Buffer.from(JSON.stringify({ user: 'guest', admin: false })).toString('base64url').replace(/=+$/, '') + '.dummysig'
    return json({ token })
  }
  if (req.path === '/api/profile') {
    const auth = req.headers.authorization || ''
    const token = auth.replace('Bearer ', '')
    try {
      const parts = token.split('.')
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      if (payload && payload.admin === true) return json({ flag: TOKEN_FLAG })
    } catch {}
    return json({ message: 'Guests cannot view profile data.' })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>TokenPeek</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:600px;margin:0 auto}
h1{font-size:24px;color:#8B5CF6;margin-bottom:20px}
.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:16px}
.card h3{font-size:13px;color:#94A3B8;margin-bottom:8px}
pre{background:#0F172A;padding:12px;border-radius:6px;font-size:12px;color:#A78BFA;overflow-x:auto}
button{padding:10px 20px;background:#8B5CF6;border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer;margin-right:8px}
#result{margin-top:16px;color:#94A3B8;font-size:13px}</style></head><body>
<h1>Token Viewer</h1><p style="color:#94A3B8;font-size:14px;margin-bottom:24px">Your current API token and profile information.</p>
    <div class="card"><h3>Current Token</h3><textarea id="token" rows="3" style="width:100%;background:#0F172A;padding:12px;border-radius:6px;border:1px solid #334155;font-size:12px;color:#A78BFA;font-family:monospace;resize:vertical">Loading...</textarea></div>
<button id="getToken">Get Token</button><button id="getProfile">Fetch Profile</button>
<div id="result"></div>
<script>document.getElementById('getToken').addEventListener('click',async function(){var r=await fetch('api/token');var d=await r.json();document.getElementById('token').value=d.token});
document.getElementById('getProfile').addEventListener('click',async function(){var r=await fetch('api/profile',{headers:{Authorization:'Bearer '+document.getElementById('token').value}});var d=await r.json();document.getElementById('result').textContent=JSON.stringify(d,null,2)})</script></body></html>`)
}

// 10 — LocalVault
const LOCAL_FLAG = 'CGS{cl13nt_s1d3_gat3s_ar3_su663st10ns}'
const localVaultHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/premium-content') {
    if (req.headers['x-unlocked'] === 'true') return json({ flag: LOCAL_FLAG })
    return errJson(403, 'locked')
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>LocalVault</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:600px;margin:0 auto}
h1{color:#F59E0B;margin-bottom:8px}.locked,.premium{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-top:20px}
.locked h3{color:#94A3B8;margin-bottom:12px}input{padding:10px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;width:200px;margin-right:8px}
button{padding:10px 20px;background:#F59E0B;border:none;color:#000;border-radius:6px;font-weight:600;cursor:pointer}
.error{color:#EF4444;font-size:13px;margin-top:8px}.premium h2{color:#10B981;margin-bottom:8px}.premium p{color:#94A3B8;font-size:14px}
#flag{color:#10B981;font-weight:bold;margin-top:12px;padding:12px;background:#064E3B;border-radius:6px;display:none}</style></head><body>
<h1>Premium Features</h1><p style="color:#94A3B8;font-size:14px;margin-bottom:16px">Unlock exclusive content with a promo code.</p>
<div class="locked" id="lockedPanel"><h3>Enter Promo Code</h3><div style="display:flex;margin-bottom:8px"><input type="text" id="code" placeholder="e.g. PREMIUM2024"><button id="unlockBtn">Unlock</button></div>
<div class="error" id="error"></div></div>
<div class="premium" id="premiumPanel" style="display:none"><h2>Premium Content</h2><p>You have unlocked premium features. Your exclusive content is loading...</p><div id="flag"></div></div>
<script>
document.getElementById('unlockBtn').addEventListener('click',function(){var c=document.getElementById('code').value;var valid=['PREMIUM2024','GOLD','VIP','SECRET'];if(valid.includes(c)){document.getElementById('lockedPanel').style.display='none';document.getElementById('premiumPanel').style.display='block';fetch('api/premium-content',{headers:{'X-Unlocked':'true'}}).then(function(r){return r.json()}).then(function(d){if(d.flag){document.getElementById('flag').style.display='block';document.getElementById('flag').textContent=d.flag}}).catch(function(){})}else{document.getElementById('error').textContent='Invalid code. Try again.'}});
!function(){if(localStorage.getItem('unlocked')==='true'){document.getElementById('lockedPanel').style.display='none';document.getElementById('premiumPanel').style.display='block';fetch('api/premium-content',{headers:{'X-Unlocked':'true'}}).then(function(r){return r.json()}).then(function(d){if(d.flag){document.getElementById('flag').style.display='block';document.getElementById('flag').textContent=d.flag}}).catch(function(){})}}()
</script></body></html>`)
}


// 11 — HiddenAPI
const HIDDEN_FLAG = 'CGS{th3_ui_1sn7_th3_wh0l3_4p1_surf4c3}'
const hiddenApiHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/v1/public/stats') {
    return json({ activeUsers: 142, uptime: '99.99%', load: '1.24', status: 'Healthy' })
  }
  
  if (req.path === '/api/v2/internal/report') {
    return json({ reportId: 'RPT-842', confidential: true, flag: HIDDEN_FLAG })
  }
  
  if (req.path === '/app.bundle.js') {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' },
      body: `
// CGS Dashboard Frontend Bundle v2.1.0
(function() {
  const PUBLIC_ENDPOINT = '/api/v1/public/stats';
  const INTERNAL_ENDPOINT = '/api/v2/internal/report'; // TODO: Remove before shipping to prod

  function updateDashboard() {
    fetch(PUBLIC_ENDPOINT)
      .then(r => r.json())
      .then(d => {
        document.getElementById('uptime').textContent = d.uptime;
        document.getElementById('users').textContent = d.activeUsers;
        document.getElementById('status').textContent = d.status;
      })
      .catch(console.error);
  }
  
  updateDashboard();
  setInterval(updateDashboard, 60000);
})();
      `.trim()
    }
  }

  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Public Dashboard</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:800px;margin:0 auto}
h1{color:#3B82F6;margin-bottom:8px;font-size:24px}p{color:#94A3B8;font-size:14px;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.stat-card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:24px;text-align:center}
.stat-card h3{font-size:13px;color:#94A3B8;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px}
.stat-card .val{font-size:32px;font-weight:bold;color:#F1F5F9}
.stat-card .val.green{color:#10B981}
</style></head><body>
<h1>CGS Public Dashboard</h1><p>Real-time telemetry and system status.</p>
<div class="grid">
<div class="stat-card"><h3>Uptime</h3><div class="val" id="uptime">--</div></div>
<div class="stat-card"><h3>Active Users</h3><div class="val" id="users">--</div></div>
<div class="stat-card"><h3>Status</h3><div class="val green" id="status">--</div></div>
</div>
<script src="app.bundle.js"></script>
</body></html>`)
}

// 12 — ReflectedNote
const XSS_FLAG = 'CGS{r3fl3ct3d_xss_st1ll_c0unts}'
const reflectedNoteHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  const note = req.query.note || ''
  const body = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Notes Preview</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#1a1a2e;color:#e0e0e0;padding:40px;display:flex;flex-direction:column;align-items:center}
h1{color:#e94560;margin-bottom:20px}.container{max-width:600px;width:100%;background:#16213e;border-radius:8px;padding:24px;border:1px solid #0f3460}
label{display:block;font-size:13px;color:#a0a0b0;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px}
textarea{width:100%;padding:12px;background:#1a1a2e;border:1px solid #0f3460;border-radius:4px;color:#e0e0e0;font-family:monospace;font-size:14px;resize:vertical;min-height:80px;margin-bottom:12px}
button{padding:10px 24px;background:#e94560;border:none;color:#fff;border-radius:4px;font-weight:600;cursor:pointer}
.note-preview{background:#1a1a2e;border:1px solid #0f3460;border-radius:4px;padding:16px;margin-top:16px;min-height:60px;word-break:break-word}
.note-preview strong{color:#e94560}footer{color:#4a4a6a;font-size:11px;margin-top:30px}
</style></head><body>
<h1>CGS Notes</h1><div class="container">
<label>Your Note</label><textarea id="noteInput"></textarea><button onclick="previewNote()">Preview</button>
<div class="note-preview" id="preview">${note}</div>
<div id="hidden-flag-container" style="display:none">${XSS_FLAG}</div>
</div>
<footer>Internal notes tool &bull; v1.0</footer>
<script>function previewNote(){var v=document.getElementById('noteInput').value;window.location.search='?note='+encodeURIComponent(v)}</script></body></html>`
  return serve('/', body)
}

// 14 — NoneAlg
const NONEALG_FLAG = 'CGS{n3v3r_tru5t_th3_4l6_h34d3r}'
const noneAlgHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/login') {
    const params = new URLSearchParams(req.body || '')
    const user = params.get('username')
    const pass = params.get('password')
    if (user !== 'admin' || pass !== 'secret123') return json({ error: 'Invalid credentials' })
    const token = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url').replace(/=+$/, '') + '.' + Buffer.from(JSON.stringify({ user: 'guest', admin: false })).toString('base64url').replace(/=+$/, '') + '.signature'
    return json({ token })
  }
  if (req.path === '/api/admin/flag') {
    const auth = req.headers.authorization || ''
    const token = auth.replace('Bearer ', '')
    try {
      const parts = token.split('.')
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      if ((header.alg === 'none') && payload.admin === true) return json({ flag: NONEALG_FLAG })
    } catch {}
    return errJson(403, 'forbidden')
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Admin Login</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;display:flex;flex-direction:column;align-items:center;padding:80px 20px}
h1{color:#EF4444;margin-bottom:8px}.card{background:#1E293B;border:1px solid #334155;border-radius:12px;padding:24px;width:480px;margin-top:20px}
label{display:block;font-size:13px;color:#94A3B8;margin-bottom:4px}input{width:100%;padding:10px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;margin-bottom:12px;font-size:14px}
button{width:100%;padding:12px;background:#EF4444;border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer}
button.sec{background:#3B82F6;margin-top:8px}
#result{color:#94A3B8;font-size:13px;margin-top:12px;text-align:center;white-space:pre-wrap;word-break:break-all}
.token-box{margin-top:12px;background:#0F172A;border:1px solid #334155;border-radius:6px;padding:10px;font-family:monospace;font-size:11px;color:#F59E0B;word-break:break-all;display:none;max-height:120px;overflow-y:auto}
.admin-section{border-top:1px solid #334155;margin-top:20px;padding-top:20px;display:none}
.admin-section h3{font-size:13px;color:#EF4444;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px}
.admin-section textarea{width:100%;padding:10px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-family:monospace;font-size:11px;min-height:70px;resize:vertical;margin-bottom:8px}
.admin-section textarea:focus{border-color:#EF4444}
#adminResult{color:#94A3B8;font-size:13px;margin-top:8px;text-align:center;white-space:pre-wrap;word-break:break-all;min-height:20px}
.hint{color:#64748B;font-size:12px;margin-top:16px;padding:12px;background:#1E293B;border:1px solid #334155;border-radius:6px;text-align:center}
.hint code{color:#EF4444;font-family:monospace;font-size:11px;background:#0F172A;padding:2px 6px;border-radius:3px}
.cred{color:#94A3B8;font-size:12px;margin-bottom:16px;padding:8px 12px;background:#0F172A;border:1px dashed #334155;border-radius:6px;text-align:center}
.cred span{font-family:monospace;color:#EF4444;font-weight:600}</style></head><body>
<h1>Admin Console</h1><p style="color:#94A3B8">Restricted access. Authorized personnel only.</p>
<div class="card">
<div class="cred">Demo credentials: <span>admin</span> / <span>secret123</span></div>
<label>Username</label><input type="text" id="user" value="admin">
<label>Password</label><input type="password" id="pass" value="secret123">
<button id="loginBtn">Authenticate</button>
<div id="result"></div>
<div id="tokenDisplay" class="token-box"></div>
<div class="admin-section" id="adminSection">
<h3>Admin Flag Access</h3>
<textarea id="tokenInput" placeholder="Paste your JWT here..."></textarea>
<button class="sec" id="adminBtn">Get Flag</button>
<div id="adminResult"></div>
</div>
</div>
<div class="hint">API: <code>api/login</code> &bull; <code>api/admin/flag</code> &bull; How does the server verify the token's algorithm?</div>
<p style="color:#475569;font-size:11px;margin-top:20px">CGS Internal Tools &bull; v3.1</p>
<script>document.getElementById('loginBtn').addEventListener('click',async function(){var d=new FormData();d.append('username',document.getElementById('user').value);d.append('password',document.getElementById('pass').value);var r=await fetch('api/login',{method:'POST',body:new URLSearchParams(d)});var j=await r.json();if(j.token){document.getElementById('result').style.color='#10B981';document.getElementById('result').textContent='Authenticated. Your token:';document.getElementById('tokenDisplay').textContent=j.token;document.getElementById('tokenDisplay').style.display='block';document.getElementById('adminSection').style.display='block'}else{document.getElementById('result').style.color='#EF4444';document.getElementById('result').textContent=j.error;document.getElementById('tokenDisplay').style.display='none';document.getElementById('adminSection').style.display='none'}});
document.getElementById('adminBtn').addEventListener('click',async function(){var t=document.getElementById('tokenInput').value;if(!t){document.getElementById('adminResult').textContent='Please paste a token first';return}var r=await fetch('api/admin/flag',{headers:{Authorization:'Bearer '+t}});var j=await r.json();document.getElementById('adminResult').textContent=JSON.stringify(j,null,2)})</script></body></html>`)
}

// 15 — RateDodge
const RATE_FLAG = 'CGS{sp00f3d_h34d3rs_r3s3t_r4t3_l1m1ts}'
if (!(globalThis as any).__rateDodgeSeenIps) (globalThis as any).__rateDodgeSeenIps = {} as Record<string, boolean>
const seenIps: Record<string, boolean> = (globalThis as any).__rateDodgeSeenIps
const rateDodgeHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/vend/reset' && req.method === 'POST') {
    for (const k of Object.keys(seenIps)) delete seenIps[k]
    return json({ status: 'ok', message: 'seen_ips cleared' })
  }
  if (req.path === '/api/vend') {
    const raw = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || ''
    const key = raw ? raw.split(',')[0].trim() : 'anonymous'
    if (seenIps[key]) {
      return { status: 429, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rate_limited', message: 'This IP has already made a request.', unique_ips_seen: Object.keys(seenIps).length }) }
    }
    seenIps[key] = true
    const count = Object.keys(seenIps).length
    if (count === 10) {
      return { status: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ok', unique_ips_seen: count, flag: RATE_FLAG }) }
    }
    return json({ status: 'ok', unique_ips_seen: count })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>RateDodge</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0B1120;color:#E2E8F0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px}
.topbar{position:fixed;top:0;left:0;right:0;background:#111827;border-bottom:1px solid #1F2937;padding:14px 32px;display:flex;justify-content:space-between;align-items:center}
.topbar h1{font-size:16px;color:#F1F5F9;font-weight:600}.topbar span{color:#64748B;font-size:13px}
.hero{text-align:center;max-width:520px}
.hero h2{font-size:28px;font-weight:700;color:#F1F5F9;margin-bottom:8px;letter-spacing:-0.5px}
.hero p{color:#94A3B8;font-size:15px;line-height:1.6;margin-bottom:24px}
.vend-card{background:#111827;border:1px solid #1F2937;border-radius:12px;padding:32px;width:100%;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,0.3)}
.vend-card h3{font-size:14px;color:#94A3B8;font-weight:500;margin-bottom:16px;text-align:center}
button{width:100%;padding:14px;background:linear-gradient(135deg,#10B981,#059669);border:none;color:#fff;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer;transition:opacity 0.2s}
button:hover{opacity:0.9}
#out{margin-top:16px;font-family:monospace;font-size:12px;color:#64748B;min-height:40px;white-space:pre-wrap;word-break:break-all;text-align:center}
.hint{margin-top:20px;background:#111827;border:1px solid #1F2937;border-radius:8px;padding:14px 18px;max-width:400px;width:100%}
.hint h4{font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.hint p{color:#94A3B8;font-size:13px;line-height:1.5}
footer{color:#334155;font-size:11px;margin-top:32px;text-align:center}
</style></head><body>
<div class="topbar"><h1>CGS RateDodge</h1><span>v1.0</span></div>
<div class="hero"><h2>Flag Vendor</h2><p>A rate limiter guards the flag endpoint. One request per IP. Or does it?</p>
<div class="vend-card"><h3>Request the flag</h3><button id="vend">Vend Flag</button><div id="out"></div></div>
<div class="hint"><h4>Hint</h4><p>The server asks the client what IP it's coming from. Vary the <code style="color:#10B981;background:#0B1120;padding:2px 6px;border-radius:4px;font-size:12px">X-Client-IP</code> header across requests.</p></div>
<footer>CGS RateDodge &bull; Web Exploitation</footer>
<script>document.getElementById('vend').addEventListener('click',async function(){var r=await fetch('api/vend');var d=await r.json();document.getElementById('out').textContent=JSON.stringify(d,null,2)})</script></body></html>`)
}

// 16 — GraphIntrospect
const GRAPH_FLAG = 'CGS{1ntr0sp3ct10n_l34ks_th3_wh0l3_sch3m4}'
const graphIntrospectHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/graphql') {
    let query = ''
    if (req.method === 'GET') query = req.query.query || ''
    else if (req.body) {
      try { query = JSON.parse(req.body).query || '' } catch { query = req.body }
    }
    if (query.includes('__schema') || query.includes('introspection') || query.includes('__type')) {
      return json({
        data: {
          __schema: {
            queryType: { fields: [
              { name: 'assets' },
              { name: 'secretVault' },
            ]}
          }
        }
      })
    }
    if (query.includes('secretVault')) return json({ data: { secretVault: GRAPH_FLAG } })
    if (query.includes('assets')) return json({ data: { assets: [{ id: '1', name: 'Logo Pack', category: 'branding' }] } })
    return json({ data: null })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Assets</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:700px;margin:0 auto}
h1{color:#10B981;margin-bottom:20px}.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:12px;display:flex;align-items:center}
.card .icon{width:40px;height:40px;background:#10B981;border-radius:6px;margin-right:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold}
.card h3{font-size:16px;margin-bottom:2px}.card p{color:#94A3B8;font-size:13px}
.graphql-badge{background:#1E293B;border:1px solid #10B981;border-radius:20px;padding:4px 12px;font-size:11px;color:#10B981;display:inline-block;margin-bottom:16px}
footer{color:#475569;font-size:11px;text-align:center;margin-top:40px}</style></head><body>
<h1>CGS Asset Catalog</h1><div class="graphql-badge">GraphQL API</div>
<div class="card"><div class="icon">L</div><div><h3>Logo Pack</h3><p>Branding assets (id: 1)</p></div></div>
<div class="card"><div class="icon">I</div><div><h3>Icons v2</h3><p>UI icon set (id: 2)</p></div></div>
<div class="card"><div class="icon">T</div><div><h3>Template Kit</h3><p>Email templates (id: 3)</p></div></div>
<p style="color:#475569;font-size:12px;margin-top:20px">Endpoint: /graphql &bull; Try an introspection query!</p>
<footer>CGS Internal &bull; v1.0</footer></body></html>`)
}

// 17 — PathPeek
const PATH_FLAG = 'CGS{d0t_d0t_sl4sh_st1ll_w0rks_1n_2026}'
const docs: Record<string, string> = {
  'welcome.txt': 'Welcome to CGS Doc Viewer.\nBrowse the available documents using the dropdown above.',
  'changelog.txt': 'v1.0 — Initial release\nv1.1 — Added search\nv1.2 — Fixed typo in welcome message',
  'secret-flag.txt': `CGS-DOC-VIEWER INTERNAL // ${PATH_FLAG}`,
}
const pathPeekHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/docs') {
    const file = req.query.file || 'welcome.txt'
    const sanitized = file.replace(/\.\.\//g, '').replace(/\.\.\\\\/g, '')
    if (sanitized !== file) {
      return text(docs['secret-flag.txt'] || 'INTERNAL SYSTEM // ' + PATH_FLAG)
    }
    const content = docs[file]
    if (content) return text(content)
    return error(404, 'Not found')
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Doc Viewer</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:700px;margin:0 auto}
h1{color:#3B82F6;margin-bottom:20px}.controls{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
select{padding:10px;background:#1E293B;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-size:14px;flex:1}
button{padding:10px 24px;background:#3B82F6;border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer}
pre{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;font-size:14px;min-height:100px;white-space:pre-wrap;word-break:break-word;color:#94A3B8}
footer{color:#475569;font-size:11px;text-align:center;margin-top:40px}</style></head><body>
<h1>CGS Document Viewer</h1><div class="controls">
<select id="fileSelect"><option value="welcome.txt">welcome.txt</option><option value="changelog.txt">changelog.txt</option></select>
<button onclick="loadDoc()">View</button></div>
<pre id="output">Select a document and click View.</pre>
<footer>CGS Internal Docs &bull; v1.2</footer>
<script>function loadDoc(){var f=document.getElementById('fileSelect').value;fetch('api/docs?file='+encodeURIComponent(f)).then(function(r){return r.text()}).then(function(d){document.getElementById('output').textContent=d})}
document.getElementById('fileSelect').addEventListener('change',loadDoc);loadDoc()</script></body></html>`)
}

// ═══════════════════════════════════
// HARD TIER (10)
// ═══════════════════════════════════

// 18 — SQLiLogin
const SQLI_FLAG = 'CGS{cl4ss1c_sql1_n3v3r_r3ally_d13s}'
const sqliUser = { username: 'admin', password: 'S9x!qP2vLk', role: 'admin' }
const sqliLoginHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.method === 'POST' && req.path === '/login') {
    let username = '', password = ''
    try {
      const parsed = JSON.parse(req.body || '{}')
      username = parsed.username || ''
      password = parsed.password || ''
    } catch {
      const params = new URLSearchParams(req.body || '')
      username = params.get('username') || ''
      password = params.get('password') || ''
    }
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
    if (username.toLowerCase().includes("' or ") || username.toLowerCase().includes("'--") || username.toLowerCase().includes("' --") || username.includes("'") && username.toLowerCase().includes("or")) {
      return text(`Welcome admin. ${SQLI_FLAG}`)
    }
    if (username === sqliUser.username && password === sqliUser.password) {
      return text(`Welcome admin. ${SQLI_FLAG}`)
    }
    return { status: 401, headers: { 'Content-Type': 'text/plain' }, body: 'Invalid credentials' }
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Admin Login</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;display:flex;flex-direction:column;align-items:center;padding:80px 20px}
h1{font-size:28px;color:#EF4444;margin-bottom:4px}.card{background:#1E293B;border:1px solid #334155;border-radius:12px;padding:32px;width:380px;margin-top:24px}
label{display:block;font-size:13px;color:#94A3B8;margin-bottom:4px}input{width:100%;padding:12px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;margin-bottom:16px;font-size:14px}
button{width:100%;padding:12px;background:#EF4444;border:none;color:#fff;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer}
.legacy{color:#F59E0B;font-size:11px;text-align:center;margin-top:12px;padding:8px;background:#1E293B;border:1px solid #F59E0B;border-radius:4px}
#err{color:#EF4444;font-size:13px;text-align:center;margin-top:12px;display:none}
footer{color:#475569;font-size:11px;margin-top:30px;text-align:center}</style></head><body>
<h1>Legacy Admin Console</h1><p style="color:#94A3B8;font-size:14px;margin-bottom:4px">CGS Internal — authorized personnel only</p>
<div class="card"><label>Username</label><input type="text" id="user" value="admin"><label>Password</label><input type="password" id="pass">
<button id="loginBtn">Log In</button><div class="legacy">Running legacy authentication module v2.1. Please report issues to IT.</div>
<div id="err"></div></div><footer>CGS Internal &bull; Confidential</footer>
<script>document.getElementById('loginBtn').addEventListener('click',async function(){var r=await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('user').value,password:document.getElementById('pass').value})});var t=await r.text();if(r.ok){document.getElementById('err').style.color='#10B981';document.getElementById('err').textContent=t}else{document.getElementById('err').style.color='#EF4444';document.getElementById('err').textContent=t}document.getElementById('err').style.display='block'})</script></body></html>`)
}

// 19 — BlindBool
const BLIND_FLAG = 'CGS{bl1nd_b00l34n_extr4ct10n_1s_sl0w_but_sur3}'
const blindProducts = ['widget', 'gadget', 'thingamajig']
const blindBoolHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/search') {
    const q = req.query.q || ''
    if (q.includes("' AND (SELECT substr(flag,") || q.includes("' AND (SELECT SUBSTR(flag,")) {
      const match = q.match(/substr\(flag,(\d+),1\)\s*=\s*'([^']*)'/i)
      if (match) {
        const pos = parseInt(match[1]) - 1
        const char = match[2]
        if (pos >= 0 && pos < BLIND_FLAG.length && BLIND_FLAG[pos] === char) return json({ found: true })
        return json({ found: false })
      }
      if (q.includes("' AND '1'='1")) return json({ found: true })
      if (q.includes("' AND '1'='2")) return json({ found: false })
    }
    if (q.includes("' AND '1'='1")) return json({ found: true })
    if (q.includes("' AND '1'='2")) return json({ found: false })
    const found = blindProducts.some(p => q.toLowerCase().includes(p.toLowerCase()))
    return json({ found })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Product Search</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;display:flex;flex-direction:column;align-items:center;padding:80px 20px}
h1{font-size:28px;color:#3B82F6;margin-bottom:8px}.search{display:flex;gap:8px;margin-bottom:20px;width:400px;max-width:100%}
input{flex:1;padding:12px 16px;background:#1E293B;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-size:14px}
button{padding:12px 24px;background:#3B82F6;border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer}
.result{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;width:400px;max-width:100%;text-align:center;min-height:60px}
.result .found{color:#10B981;font-size:16px}.result .notfound{color:#EF4444;font-size:16px}
.code{background:#0F172A;padding:12px;border-radius:6px;font-family:monospace;font-size:12px;color:#94A3B8;margin-top:16px;width:400px;max-width:100%}
footer{color:#475569;font-size:11px;margin-top:30px}</style></head><body>
<h1>CGS Product Search</h1><p style="color:#94A3B8;margin-bottom:20px">Search our product catalog.</p>
<div class="search"><input type="text" id="q" placeholder="Search products..." value="widget"><button onclick="search()">Search</button></div>
<div class="result" id="result"><p style="color:#94A3B8">Enter a search term above.</p></div>
<div class="code">API: GET /api/search?q=your-query</div>
<footer>CGS Product Catalog &bull; v1.0</footer>
<script>function search(){var q=document.getElementById('q').value;fetch('api/search?q='+encodeURIComponent(q)).then(function(r){return r.json()}).then(function(d){document.getElementById('result').innerHTML=d.found?'<div class="found">Product found</div>':'<div class="notfound">Product not found</div>'})}
document.getElementById('q').addEventListener('keydown',function(e){if(e.key==='Enter')search()})</script></body></html>`)
}

// 20 — SSRFetch
const SSRF_FLAG = 'CGS{s3rv3r_s1d3_r3qu3sts_g0_pl4c3s_us3rs_c4nt}'
const ssrfetchHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/internal-flag') return text(`INTERNAL SYSTEM // ${SSRF_FLAG}`)
  if (req.method === 'POST' && req.path === '/api/preview') {
    try {
      const { url } = JSON.parse(req.body || '{}')
      if (url && (url.includes('127.0.0.1') || url.includes('localhost') || url.includes('internal'))) {
        return json({ preview: `INTERNAL SYSTEM // ${SSRF_FLAG}` })
      }
      return json({ preview: `Fetched content from ${url || 'unknown'} (simulated).` })
    } catch {
      return errJson(400, 'could not fetch url')
    }
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Link Preview</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:600px;margin:0 auto}
h1{font-size:24px;color:#F59E0B;margin-bottom:8px}.input-group{display:flex;gap:8px;margin-bottom:20px}
input{flex:1;padding:12px 16px;background:#1E293B;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-size:14px}
button{padding:12px 24px;background:#F59E0B;border:none;color:#000;border-radius:6px;font-weight:600;cursor:pointer}
.preview{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;min-height:80px;white-space:pre-wrap;word-break:break-word}
footer{color:#475569;font-size:11px;margin-top:30px;text-align:center}</style></head><body>
<h1>Link Preview</h1><p style="color:#94A3B8;margin-bottom:20px">Paste a URL and we'll generate a preview.</p>
<div class="input-group"><input type="text" id="url" placeholder="https://example.com"><button onclick="preview()">Preview</button></div>
<div class="preview" id="preview">Enter a URL above.</div>
<footer>CGS Internal Tools &bull; v1.0</footer>
<script>async function preview(){var u=document.getElementById('url').value;var r=await fetch('api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u})});var d=await r.json();document.getElementById('preview').textContent=d.preview||d.error}
document.getElementById('url').addEventListener('keydown',function(e){if(e.key==='Enter')preview()})</script></body></html>`)
}

// 21 — DeserialBomb
const DESER_FLAG = 'CGS{1ns3cur3_d3s3r14l1zat10n_1s_rc3}'
const deserialBombHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/prefs') {
    const raw = req.cookies.prefs || ''
    if (raw.includes('_$$ND_FUNC$$_') || raw.includes('function') || raw.includes('require(') || raw.includes('readFileSync')) {
      return errJson(500, `Error: ${DESER_FLAG}`)
    }
    return json({ prefs: raw ? { theme: 'dark', fontSize: 14 } : { theme: 'dark' } })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Preferences</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:500px;margin:0 auto}
h1{color:#8B5CF6;margin-bottom:20px}.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:16px}
.card h3{font-size:13px;color:#94A3B8;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px}
.setting{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1a2e;font-size:14px}
.setting:last-child{border-bottom:none}
.prefs-raw{background:#0F172A;padding:12px;border-radius:6px;font-family:monospace;font-size:11px;color:#8B5CF6;word-break:break-all;margin-top:12px}
footer{color:#475569;font-size:11px;margin-top:30px;text-align:center}
.info{color:#94A3B8;font-size:12px;margin-top:12px;padding:12px;background:#1E293B;border:1px solid #8B5CF6;border-radius:6px}</style></head><body>
<h1>User Preferences</h1><div class="card"><h3>Current Settings</h3><div class="setting"><span>Theme</span><span style="color:#8B5CF6" id="theme">dark</span></div>
<div class="setting"><span>Font Size</span><span id="fontSize">14px</span></div><div class="setting"><span>Notifications</span><span>enabled</span></div></div>
<div class="info">Your preferences are stored as a serialized object in the <code>prefs</code> cookie.</div>
<div class="prefs-raw" id="prefsRaw">Click "Load Preferences" to see the raw value.</div>
<footer>CGS Internal &bull; v1.0</footer>
<script>fetch('/prefs').then(function(r){return r.json()}).then(function(d){if(d.prefs){document.getElementById('theme').textContent=d.prefs.theme;document.getElementById('fontSize').textContent=(d.prefs.fontSize||14)+'px'}document.getElementById('prefsRaw').textContent=JSON.stringify(d)}).catch(function(){})</script></body></html>`)
}

// 22 — JWTCrack
const JWTCRACK_FLAG = 'CGS{w34k_hm4c_s3cr3ts_f4ll_t0_wordl1sts}'
const JWT_SECRET = 'cgs2024'
function signToken(payload: any, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url').replace(/=+$/, '')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url').replace(/=+$/, '')
  const signature = Buffer.from(secret + '.' + header + '.' + body).toString('base64url').replace(/=+$/, '')
  return header + '.' + body + '.' + signature
}
const jwtCrackHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/login') return json({ token: signToken({ role: 'guest' }, JWT_SECRET) })
  if (req.path === '/api/admin') {
    const auth = req.headers.authorization || ''
    const token = auth.replace('Bearer ', '')
    try {
      const parts = token.split('.')
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      const expectedSig = Buffer.from(JWT_SECRET + '.' + parts[0] + '.' + parts[1]).toString('base64url').replace(/=+$/, '')
      if (parts[2] === expectedSig && payload.role === 'admin') return json({ flag: JWTCRACK_FLAG })
    } catch {}
    return errJson(403, 'forbidden')
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS API Console</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:600px;margin:0 auto}
h1{color:#EC4899;margin-bottom:20px}.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:16px}
.card h3{font-size:13px;color:#94A3B8;margin-bottom:8px}pre{background:#0F172A;padding:12px;border-radius:6px;font-size:12px;color:#EC4899;overflow-x:auto}
button{padding:10px 20px;background:#EC4899;border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer;margin-right:8px}
#result{color:#94A3B8;font-size:13px;margin-top:12px;white-space:pre-wrap}</style></head><body>
<h1>CGS API Console</h1><div class="card"><h3>Current Token</h3><pre id="token">Loading...</pre></div>
<button id="getToken">Get Token</button><button id="adminBtn">Access Admin</button><div id="result"></div>
<footer>CGS Internal API &bull; v3.0</footer>
<script>document.getElementById('getToken').addEventListener('click',async function(){var r=await fetch('api/login');var d=await r.json();document.getElementById('token').textContent=d.token});
document.getElementById('adminBtn').addEventListener('click',async function(){var r=await fetch('api/admin',{headers:{Authorization:'Bearer '+document.getElementById('token').textContent}});var d=await r.json();document.getElementById('result').textContent=JSON.stringify(d,null,2)})</script></body></html>`)
}

// 23 — RaceWin
const RACE_FLAG = 'CGS{t0ct0u_r4c3_c0nd1t10ns_ar3_r34l}'
let raceRedeemed = false
let raceTimer: any = null
const raceWinHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/redeem') {
    const currentlyRedeemed = raceRedeemed
    if (currentlyRedeemed) return errJson(409, 'already redeemed')
    raceRedeemed = true
    if (!raceTimer) {
      raceTimer = setInterval(() => { raceRedeemed = false }, 30000)
    }
    return json({ flag: RACE_FLAG })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Flash Promo</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;background:#0a0a0a;color:#ff4444;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px}
h1{font-size:24px;margin-bottom:8px;letter-spacing:3px}.card{background:#111;border:1px solid #ff4444;border-radius:4px;padding:32px;text-align:center;max-width:450px}
.timer{font-size:48px;color:#ff4444;margin:16px 0}.badge{background:#ff4444;color:#000;padding:4px 12px;border-radius:2px;font-size:11px;font-weight:bold;display:inline-block;margin-bottom:12px}
button{padding:12px 32px;background:#ff4444;color:#000;border:none;font-family:monospace;font-weight:bold;font-size:16px;cursor:pointer;margin-top:16px;border-radius:4px}
#out{color:#ff4444;font-size:13px;margin-top:12px;min-height:20px}
.hint{color:#333;font-size:10px;margin-top:20px;max-width:350px}</style></head><body>
<div class="card"><div class="badge">LIMITED PROMO</div><h1>Flag Coupon</h1>
<p style="font-size:13px;color:#888;margin-bottom:16px">One flag coupon available. Redeem it before someone else does.</p>
<div class="timer" id="countdown">30</div><p style="font-size:11px;color:#666">seconds until next reset</p>
<button id="redeem">Redeem Now</button><div id="out"></div>
<p class="hint">Only one redemption allowed per 30-second window. Be quick.</p></div>
<script>var t=30;setInterval(function(){t--;if(t<0)t=30;document.getElementById('countdown').textContent=t},1000);
document.getElementById('redeem').addEventListener('click',async function(){var r=await fetch('api/redeem');var d=await r.json();document.getElementById('out').textContent=JSON.stringify(d,null,2)})</script></body></html>`)
}

// 24 — ProtoPollute
const PROTO_FLAG = 'CGS{__pr0t0__pollut10n_ch4ng3s_3v3ryth1ng}'
let protoPolluted = false
const protoPolluteHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.method === 'POST' && req.path === '/api/merge-settings') {
    try {
      const body = JSON.parse(req.body || '{}')
      if (body.__proto__ || body.constructor?.prototype) protoPolluted = true
      return json({ status: 'merged' })
    } catch {
      return json({ status: 'merged' })
    }
  }
  if (req.path === '/api/whoami') {
    const user: any = {}
    if (protoPolluted || user.isAdmin === true) return json({ flag: PROTO_FLAG })
    return json({ role: 'guest' })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Settings</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:600px;margin:0 auto}
h1{color:#F59E0B;margin-bottom:20px}.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:16px}
.card h3{font-size:13px;color:#94A3B8;margin-bottom:8px}textarea{width:100%;padding:12px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-family:monospace;font-size:13px;min-height:100px;resize:vertical}
button{padding:10px 24px;background:#F59E0B;border:none;color:#000;border-radius:6px;font-weight:600;cursor:pointer;margin-right:8px}
#result{color:#94A3B8;font-size:13px;margin-top:12px;white-space:pre-wrap}
#whoami{color:#10B981;font-size:14px;margin-top:16px;padding:16px;background:#064E3B;border-radius:6px;display:none}
footer{color:#475569;font-size:11px;margin-top:30px;text-align:center}</style></head><body>
<h1>Settings Manager</h1>
<div class="card"><h3>Merge Configuration</h3><textarea id="settings">{"theme":"dark"}</textarea>
<div style="margin-top:12px"><button onclick="merge()">Merge</button><button onclick="whoami()">Check Identity</button></div>
<div id="result"></div><div id="whoami"></div></div>
<footer>CGS Internal &bull; v1.0</footer>
<script>async function merge(){var r=await fetch('api/merge-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:document.getElementById('settings').value});var d=await r.json();document.getElementById('result').textContent=JSON.stringify(d)}
async function whoami(){var r=await fetch('api/whoami');var d=await r.json();var e=document.getElementById('whoami');e.style.display='block';e.textContent=JSON.stringify(d,null,2)}</script></body></html>`)
}

// 25 — SSTI Render
const SSTI_FLAG = 'CGS{ss7i_turns_t3mpl4t3s_1nt0_sh3lls}'
const sstiHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.method === 'POST' && req.path === '/api/preview') {
    try {
      const { template } = JSON.parse(req.body || '{}')
      if (!template) return errJson(400, 'template required')
      if (template.includes('<%=')) {
        if (template.includes('require(') || template.includes('readFileSync') || template.includes('flag')) {
          return json({ rendered: SSTI_FLAG })
        }
        const match = template.match(/<%=\s*([^%]+)\s*%>/)
        if (match) {
          const expr = match[1].trim()
          if (expr === '7*7') return json({ rendered: '49' })
          if (expr.includes('*') || expr.includes('+') || expr.includes('-')) {
            try {
              const result = Function('"use strict"; return (' + expr + ')')()
              return json({ rendered: String(result) })
            } catch {}
          }
        }
        return json({ rendered: '49' })
      }
      return json({ rendered: template })
    } catch {
      return errJson(400, 'invalid request')
    }
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Email Preview</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:600px;margin:0 auto}
h1{color:#06B6D4;margin-bottom:20px}.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:16px}
.card h3{font-size:13px;color:#94A3B8;margin-bottom:8px}textarea{width:100%;padding:12px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-family:monospace;font-size:13px;min-height:120px;resize:vertical;margin-bottom:12px}
button{padding:10px 24px;background:#06B6D4;border:none;color:#000;border-radius:6px;font-weight:600;cursor:pointer}
.preview-out{background:#0F172A;border:1px solid #06B6D4;border-radius:6px;padding:16px;min-height:60px;margin-top:12px;white-space:pre-wrap;word-break:break-word;color:#06B6D4}
footer{color:#475569;font-size:11px;margin-top:30px;text-align:center}</style></head><body>
<h1>Email Template Preview</h1>
<div class="card"><h3>Template Source</h3><textarea id="tmpl">Hello {{name}}, your order #{{order}} is confirmed.</textarea>
<button onclick="preview()">Render Preview</button><div class="preview-out" id="preview">Preview will appear here.</div></div>
<footer>CGS Marketing Tools &bull; v2.0</footer>
<script>async function preview(){var r=await fetch('api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({template:document.getElementById('tmpl').value})});var d=await r.json();document.getElementById('preview').textContent=d.rendered||d.error}</script></body></html>`)
}

// 26 — XXEcho
const XXE_FLAG = 'CGS{xx3_st1ll_h4unts_l3g4cy_p4rs3rs}'
const xxeHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.method === 'POST' && req.path === '/api/import-contact') {
    const xml = req.body || ''
    if (xml.includes('<!ENTITY') && xml.includes('SYSTEM') && (xml.includes('file://') || xml.includes('flag'))) {
      const nameMatch = xml.match(/<name>([^<]*)<\/name>/)
      let name = nameMatch ? nameMatch[1] : 'unknown'
      if (name.includes('&xxe;') || name.includes('&file;')) name = XXE_FLAG
      return json({ imported: true, name })
    }
    const nameMatch = xml.match(/<name>([^<]*)<\/name>/)
    const name = nameMatch ? nameMatch[1] : 'unknown'
    return json({ imported: true, name })
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Contact Importer</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:600px;margin:0 auto}
h1{color:#F59E0B;margin-bottom:20px}.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:16px}
.card h3{font-size:13px;color:#94A3B8;margin-bottom:8px}textarea{width:100%;padding:12px;background:#0F172A;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-family:monospace;font-size:13px;min-height:150px;resize:vertical;margin-bottom:12px}
button{padding:10px 24px;background:#F59E0B;border:none;color:#000;border-radius:6px;font-weight:600;cursor:pointer}
#result{background:#0F172A;border:1px solid #F59E0B;border-radius:6px;padding:16px;margin-top:12px;min-height:40px;white-space:pre-wrap;color:#F59E0B}
.sample{background:#1E293B;padding:12px;border-radius:6px;font-family:monospace;font-size:11px;color:#94A3B8;margin-bottom:12px;white-space:pre-wrap}
footer{color:#475569;font-size:11px;margin-top:30px;text-align:center}</style></head><body>
<h1>CGS Contact Importer</h1><div class="card"><h3>XML Input</h3>
<div class="sample">&lt;contact&gt;&lt;name&gt;John Doe&lt;/name&gt;&lt;email&gt;john@example.com&lt;/email&gt;&lt;/contact&gt;</div>
<textarea id="xml">&lt;contact&gt;\n  &lt;name&gt;John Doe&lt;/name&gt;\n  &lt;email&gt;john@example.com&lt;/email&gt;\n&lt;/contact&gt;</textarea>
<button onclick="importContact()">Import</button><div id="result"></div></div>
<footer>CGS Internal &bull; v1.2</footer>
<script>async function importContact(){var r=await fetch('api/import-contact',{method:'POST',headers:{'Content-Type':'application/xml'},body:document.getElementById('xml').value});var d=await r.json();document.getElementById('result').textContent=JSON.stringify(d,null,2)}</script></body></html>`)
}

// 27 — CORSChain
const CORS_FLAG = 'CGS{r3fl3ct3d_cors_pl4y_l34ks_cr3d3nt14l5}'
const corsChainHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.path === '/api/session-info') {
    const origin = req.headers.origin || '*'
    const hasSession = req.cookies.session === 'victim-session-abc123'
    const body = hasSession
      ? JSON.stringify({ user: 'victim', flag: CORS_FLAG })
      : JSON.stringify({ user: 'guest', flag: null })
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
      },
      body,
    }
  }
  if (req.method === 'POST' && req.path === '/simulate-victim') {
    try {
      const { attackerUrl } = JSON.parse(req.body || '{}')
      return json({ status: 'victim visited ' + (attackerUrl || 'unknown'), flag: CORS_FLAG })
    } catch {
      return json({ error: 'invalid request' })
    }
  }
  return serve('/', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CGS Session Explorer</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:700px;margin:0 auto}
h1{color:#EC4899;margin-bottom:8px}.card{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:20px;margin-bottom:16px}
.card h3{font-size:13px;color:#94A3B8;margin-bottom:8px}pre{background:#0F172A;padding:12px;border-radius:6px;font-size:12px;color:#EC4899;overflow-x:auto}
button{padding:10px 20px;background:#EC4899;border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer;margin-right:8px}
#info{color:#94A3B8;font-size:13px;margin-top:12px;white-space:pre-wrap}
input{width:100%;padding:12px;background:#1E293B;border:1px solid #334155;border-radius:6px;color:#E2E8F0;font-size:13px;margin-bottom:8px}
footer{color:#475569;font-size:11px;margin-top:30px;text-align:center}
.endpoint{background:#1E293B;padding:8px 12px;border-radius:4px;font-family:monospace;font-size:12px;color:#94A3B8;margin-bottom:12px;display:inline-block}
</style></head><body>
<h1>CGS Session Explorer</h1><p style="color:#94A3B8;margin-bottom:24px">View your current session information.</p>
<div class="endpoint">GET /api/session-info</div>
<button id="getInfo">Get Session Info</button><div id="info"></div>
<div class="card" style="margin-top:20px"><h3>Simulate Victim Bot</h3>
<p style="color:#94A3B8;font-size:12px;margin-bottom:12px">Submit an attacker page URL and the victim bot will visit it with an active session.</p>
<input type="text" id="attackerUrl" placeholder="https://your-attacker-page.com"><button id="simulateBtn">Simulate Visit</button>
<div id="simResult"></div></div>
<footer>CGS Internal &bull; v2.1</footer>
<script>
document.getElementById('getInfo').addEventListener('click',async function(){var r=await fetch('api/session-info',{credentials:'include'});var d=await r.json();document.getElementById('info').textContent=JSON.stringify(d,null,2)});
document.getElementById('simulateBtn').addEventListener('click',async function(){var r=await fetch('/simulate-victim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({attackerUrl:document.getElementById('attackerUrl').value})});var d=await r.json();document.getElementById('simResult').textContent=JSON.stringify(d,null,2)})
</script></body></html>`)
}

// ═══════════════════════════════════
// EXPORT
// ═══════════════════════════════════

export const documentChallenges: ChallengeDef[] = [
  { slug: 'novasec-portal',    title: 'NovaSec Portal',    handler: novasecHandler },
  { slug: 'timevault',         title: 'TimeVault',         handler: timevaultHandler },
  { slug: 'debugmode',         title: 'DebugMode',         handler: debugmodeHandler },
  { slug: 'pixelarchive',      title: 'PixelArchive',      handler: pixelarchiveHandler },
  { slug: 'crawlertrap',       title: 'CrawlerTrap',       handler: crawlerHandler },
  { slug: 'styleguide',        title: 'StyleGuide',        handler: styleguideHandler },
  { slug: 'encodedbanner',     title: 'EncodedBanner',     handler: encodedHandler },
  { slug: 'cookiecrumbs',      title: 'CookieCrumbs',      handler: cookieHandler },
  { slug: 'tokenpeek',         title: 'TokenPeek',         handler: tokenPeekHandler },
  { slug: 'localvault',        title: 'LocalVault',        handler: localVaultHandler },
  { slug: 'hiddenapi',         title: 'HiddenAPI',         handler: hiddenApiHandler },
  { slug: 'reflectednote',     title: 'ReflectedNote',     handler: reflectedNoteHandler },
  { slug: 'nonealg',           title: 'NoneAlg',           handler: noneAlgHandler },
  { slug: 'ratedodge',         title: 'RateDodge',         handler: rateDodgeHandler },
  { slug: 'graphintrospect',   title: 'GraphIntrospect',   handler: graphIntrospectHandler },
  { slug: 'pathpeek',          title: 'PathPeek',          handler: pathPeekHandler },
  { slug: 'sqli-login',        title: 'SQLiLogin',         handler: sqliLoginHandler },
  { slug: 'blindbool',         title: 'BlindBool',         handler: blindBoolHandler },
  { slug: 'ssrfetch',          title: 'SSRFetch',          handler: ssrfetchHandler },
  { slug: 'deserialbomb',      title: 'DeserialBomb',      handler: deserialBombHandler },
  { slug: 'jwtcrack',          title: 'JWTCrack',          handler: jwtCrackHandler },
  { slug: 'racewin',           title: 'RaceWin',           handler: raceWinHandler },
  { slug: 'protopollute',      title: 'ProtoPollute',      handler: protoPolluteHandler },
  { slug: 'sstirender',        title: 'SSTI Render',       handler: sstiHandler },
  { slug: 'xxecho',            title: 'XXEcho',            handler: xxeHandler },
  { slug: 'corschain',         title: 'CORSChain',         handler: corsChainHandler },
]
