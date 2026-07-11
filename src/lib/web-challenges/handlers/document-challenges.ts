import { ChallengeDef, PlaygroundRequest, html, json, text, redirect, error, extractCookies } from '../types'

function parseForm(body: string | null): Record<string, string> {
  if (!body) return {}
  const p: Record<string, string> = {}
  body.split('&').forEach(pair => {
    const [k, ...v] = pair.split('=')
    if (k) p[decodeURIComponent(k)] = decodeURIComponent(v.join('=') || '')
  })
  return p
}

function htmlStatus(body: string, status: number): { status: number; headers: Record<string, string>; body: string } {
  return { status, headers: { 'Content-Type': 'text/html' }, body }
}

// Module-level state used by stateful simulation challenges.
let redeemCount = 0
let storedDisplayName = ''

/* ─── EASY (10) ─── */

export const robotsOnly: ChallengeDef = {
  slug: 'robots-only',
  title: 'Robots Only',
  handler: (req: PlaygroundRequest) => {
    const path = req.path
    if (path === '/robots.txt') {
      return text(`User-agent: *
Disallow: /hidden-admin-9f2
Disallow: /admin
Disallow: /internal`)
    }
    if (path === '/hidden-admin-9f2') {
      return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Admin Panel</title><style>
body{font-family:monospace;background:#0d0d0d;color:#00ff00;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
pre{background:#1a1a1a;padding:2rem;border:1px solid #00ff00;border-radius:4px}
</style></head><body><pre>
  ___    _    __  __  ___  _   _
 / _ \\  / \\  |  \\/  |/ _ \\| \\ | |
| | | |/ _ \\ | |\\/| | | | |  \\| |
| |_| / ___ \\| |  | | |_| | |\\  |
 \\___/_/   \\_\\_|  |_|\\___/|_| \\_|

Access Granted.
FLAG: CGS{b0ts_d0nt_t3ll_but_th3y_l34v3_tr41ls}
</pre></body></html>`, 'CGS{b0ts_d0nt_t3ll_but_th3y_l34v3_tr41ls}')
    }
    return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>SecureDash Analytics</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f0f2f5;color:#333}
header{background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;padding:2rem 0;text-align:center}
header h1{font-size:2.5rem;margin-bottom:0.5rem}
.container{max-width:1100px;margin:0 auto;padding:2rem}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin:2rem 0}
.card{background:white;border-radius:8px;padding:1.5rem;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
.card .value{font-size:2rem;font-weight:bold;color:#16213e}
footer{text-align:center;padding:2rem;color:#666;font-size:0.9rem}
</style></head><body><header><h1>SecureDash Analytics</h1><p>Enterprise-grade dashboard</p></header><div class="container"><div class="stats"><div class="card"><h3>Active Users</h3><div class="value">12,847</div></div><div class="card"><h3>Revenue</h3><div class="value">$48,293</div></div><div class="card"><h3>Page Views</h3><div class="value">1.2M</div></div></div><section><p>SecureDash provides real-time analytics. Trusted by 5,000+ companies.</p></section></div><footer>&copy; 2026 SecureDash Analytics</footer></body></html>`)
  },
}

export const cookieMonster: ChallengeDef = {
  slug: 'cookie-monster',
  title: 'Cookie Monster',
  handler: (req: PlaygroundRequest) => {
    const cookies = extractCookies(req.headers['cookie'])
    if (cookies['role'] === 'admin') {
      return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Admin Dashboard</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#e8f5e9;color:#333}
header{background:linear-gradient(135deg,#1b5e20,#2e7d32);color:white;padding:2rem 0;text-align:center}
nav{background:#2e7d32;padding:0.8rem;text-align:center}
nav a{color:white;text-decoration:none;margin:0 1.5rem}
.container{max-width:900px;margin:2rem auto;padding:0 2rem}
.card{background:white;border-radius:8px;padding:2rem;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin:1.5rem 0}
.flag-box{background:#1b5e20;color:#fff;padding:1.5rem;border-radius:4px;font-family:monospace;font-size:1.2rem;text-align:center}
</style></head><body><header><h1>Admin Dashboard</h1></header><nav><a href="#">Home</a><a href="#">Users</a><a href="#">Settings</a></nav><div class="container"><div class="card"><h2>Welcome, Administrator</h2><div class="flag-box">CGS{c00k13_m0nst3r_w4nts_th3_fl4g}</div></div></div></body></html>`, 'CGS{c00k13_m0nst3r_w4nts_th3_fl4g}')
    }
    return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Dashboard</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f5f5f5;color:#333}
header{background:linear-gradient(135deg,#1565c0,#1976d2);color:white;padding:2rem 0;text-align:center}
nav{background:#1976d2;padding:0.8rem;text-align:center}
nav a{color:white;text-decoration:none;margin:0 1.5rem}
.container{max-width:900px;margin:2rem auto;padding:0 2rem}
.card{background:white;border-radius:8px;padding:2rem;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin:1.5rem 0}
.warning{background:#fff3e0;border-left:4px solid #ff9800;padding:1rem;border-radius:4px}
</style></head><body><header><h1>Dashboard</h1></header><nav><a href="#">Home</a><a href="#">Profile</a><a href="#">Settings</a></nav><div class="container"><div class="card"><h2>Welcome, Guest!</h2><div class="warning"><p><strong>Access Restricted.</strong> You are logged in as <strong>${cookies['role'] || 'user'}</strong>.</p><p>Set your role cookie to 'admin' to access admin functions.</p></div></div></div></body></html>`)
  },
}

export const viewSourceWontSaveYou: ChallengeDef = {
  slug: 'view-source-won-t-save-you',
  title: 'View Source Won\'t Save You',
  handler: () => {
    const flagB64 = Buffer.from('CGS{s0urc3_c0d3_n0t_s0_s3cur3}').toString('base64')
    return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>NexGen Technologies</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#fff;color:#333}
header{background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);color:white;padding:3rem 0;text-align:center}
header h1{font-size:3rem}
nav{background:#203a43;padding:1rem;text-align:center}
nav a{color:white;text-decoration:none;margin:0 1.5rem}
.container{max-width:1000px;margin:0 auto;padding:2rem}
footer{text-align:center;padding:2rem;background:#0f2027;color:white}
</style></head><body><header><h1>NexGen Technologies</h1><p>Building the future</p></header><nav><a href="#">Home</a><a href="#">Products</a><a href="#">About</a></nav><div class="container"><h2>Something Amazing Is Coming</h2><p>We're hard at work building our next-generation cloud platform.</p></div><footer>&copy; 2026 NexGen Technologies</footer><!-- ${flagB64} --></body></html>`)
  },
}

export const theParameterWhisperer: ChallengeDef = {
  slug: 'the-parameter-whisperer',
  title: 'The Parameter Whisperer',
  handler: (req: PlaygroundRequest) => {
    const users: Record<number, { name: string; role: string; bio: string }> = {
      1: { name: 'Admin', role: 'administrator', bio: 'System administrator and founder. Secret: CGS{wh0_kn3w_y0ur_n3ighb0rs_pr0f1l3}' },
      1043: { name: 'You', role: 'user', bio: 'CTF participant. Welcome! You are on the right track.' },
      1044: { name: 'Alice', role: 'user', bio: 'Development team lead.' },
      1045: { name: 'Bob', role: 'user', bio: 'DevOps engineer.' },
      1046: { name: 'Charlie', role: 'user', bio: 'Frontend developer.' },
    }
    if (req.path === '/profile') {
      const userId = parseInt(req.query['user_id'] || '', 10)
      const user = users[userId]
      if (!user) return htmlStatus('<h1>404</h1><p>User not found.</p>', 404)
      const flag = userId === 1 ? 'CGS{wh0_kn3w_y0ur_n3ighb0rs_pr0f1l3}' : undefined
      return html(`<!DOCTYPE html><html><head><title>${user.name} - Profile</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f0f4f8;color:#333}
header{background:linear-gradient(135deg,#3a1c71,#d76d77,#ffaf7b);color:white;padding:2rem 0;text-align:center}
nav{background:#3a1c71;padding:0.8rem;text-align:center}
nav a{color:white;text-decoration:none;margin:0 1.5rem}
.container{max-width:900px;margin:2rem auto;padding:0 2rem}
.profile-card{background:white;border-radius:12px;padding:2rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);margin:2rem 0}
.info h2{margin-bottom:0.5rem;color:#3a1c71}
.label{color:#666;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;margin-top:1rem}
.value{margin-top:0.2rem;line-height:1.5}
.role-tag{display:inline-block;background:#3a1c71;color:white;padding:0.2rem 0.8rem;border-radius:12px;font-size:0.8rem}
</style></head><body><header><h1>CloudPort</h1></header><nav><a href="/">Home</a><a href="/profile?user_id=1043">My Profile</a></nav><div class="container"><div class="profile-card"><div class="info"><h2>${user.name}</h2><span class="role-tag">${user.role}</span><div class="label">User ID</div><div class="value">${userId}</div><div class="label">Bio</div><div class="value">${user.bio}</div></div></div></div></body></html>`, flag)
    }
    return html(`<!DOCTYPE html><html><head><title>CloudPort</title><style>
body{font-family:'Segoe UI',sans-serif;background:#f0f4f8;color:#333}
header{background:linear-gradient(135deg,#3a1c71,#d76d77,#ffaf7b);color:white;padding:2rem 0;text-align:center}
</style></head><body><header><h1>CloudPort</h1><p>User Profile Portal</p></header><div class="container"><h2>Welcome</h2><p>Navigate to /profile?user_id=1043</p></div></body></html>`)
  },
}

export const headerGames: ChallengeDef = {
  slug: 'header-games',
  title: 'Header Games',
  handler: (req: PlaygroundRequest) => {
    const ua = req.headers['user-agent'] || ''
    if (ua.includes('OldBrowser/1.0')) {
      return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>RetroNet</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;background:#000;color:#33ff33}
header{border-bottom:2px solid #33ff33;padding:2rem;text-align:center}
header h1{font-size:2.5rem;text-shadow:0 0 10px #33ff33}
.flag-box{border:2px solid #33ff33;padding:1.5rem;text-align:center;margin:2rem auto;max-width:600px;background:#0a0a0a}
</style></head><body><header><h1>RETRONET</h1><p>Welcome back, vintage user.</p></header><div class="container"><div class="flag-box"><h2>Decrypted Payload</h2><p style="font-size:1.4rem">CGS{h34d3rs_4r3_th3_n3w_c00k13s}</p></div></div></body></html>`, 'CGS{h34d3rs_4r3_th3_n3w_c00k13s}')
    }
    return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>RetroNet</title><style>
body{font-family:'Courier New',monospace;background:#1a1a2e;color:#ccc}
header{background:#16213e;border-bottom:2px solid #e94560;padding:2rem;text-align:center}
header h1{color:#e94560}
.card{background:#16213e;border:1px solid #0f3460;border-radius:8px;padding:3rem 2rem;margin:2rem auto;max-width:600px;text-align:center}
.hint{margin-top:2rem;padding:1rem;border:1px dashed #555;color:#888;font-size:0.85rem}
</style></head><body><header><h1>RETRONET</h1><p>Modern browser interface</p></header><div class="card"><h2>Browser Not Supported</h2><p>Only users with the most ancient browser can see the truth.</p></div><div class="hint">UA_WHITELIST contains deprecated entries from the early 2000s era.</div></body></html>`)
  },
}

export const loginOptional: ChallengeDef = {
  slug: 'login-optional',
  title: 'Login? Optional',
  handler: (req: PlaygroundRequest) => {
    if (req.method === 'POST') {
      const form = parseForm(req.body)
      const u = form['username'] || ''
      const p = form['password'] || ''
      if (u.includes("' OR '1'='1") || p.includes("' OR '1'='1") || u.includes("'--") || p.includes("'--")) {
        return html('<h2>Welcome admin! Flag: CGS{\\\' OR \\\'1\\\'=\\\'1\\\' -- th3_cl4ss1c}</h2>', 'CGS{\' OR \'1\'=\'1\' -- th3_cl4ss1c}')
      }
      if (u === 'admin' && p === 'supersecret') {
        return html('<h2>Welcome admin! Flag: CGS{\\\' OR \\\'1\\\'=\\\'1\\\' -- th3_cl4ss1c}</h2>', 'CGS{\' OR \'1\'=\'1\' -- th3_cl4ss1c}')
      }
      return html('<h2>Invalid credentials</h2>')
    }
    return html(`<!DOCTYPE html><html><head><title>Login</title></head><body><h2>Login Page</h2><form method="POST" action="/login"><input type="text" name="username" placeholder="Username"><br><br><input type="password" name="password" placeholder="Password"><br><br><button type="submit">Login</button></form></body></html>`)
  },
}

export const directoryOfSecrets: ChallengeDef = {
  slug: 'directory-of-secrets',
  title: 'Directory of Secrets',
  handler: (req: PlaygroundRequest) => {
    if (req.path === '/.git/config') {
      return text(`[core]
\trepositoryformatversion = 0
\tfilemode = true
[remote "origin"]
\turl = https://admin:CGS{wh0_n33ds_4_p4ssw0rd_wh3n_y0u_h4v3_g1t}@git.internal.acme.corp/secret-repo.git
\tfetch = +refs/heads/*:refs/remotes/origin/*
`, 'CGS{wh0_n33ds_4_p4ssw0rd_wh3n_y0u_h4v3_g1t}')
    }
    if (req.path === '/index.html.bak') {
      return text('CGS{wh0_n33ds_4_p4ssw0rd_wh3n_y0u_h4v3_g1t}', 'CGS{wh0_n33ds_4_p4ssw0rd_wh3n_y0u_h4v3_g1t}')
    }
    if (req.path === '/backup.zip') {
      return text('backup archive content\nflag: CGS{wh0_n33ds_4_p4ssw0rd_wh3n_y0u_h4v3_g1t}\n')
    }
    return html(`<!DOCTYPE html><html><head><title>Acme Corp</title></head><body><h1>Acme Corporation</h1><p>Leading provider of industrial solutions since 1987.</p></body></html>`)
  },
}

export const cacheMeIfYouCan: ChallengeDef = {
  slug: 'cache-me-if-you-can',
  title: 'Cache Me If You Can',
  handler: (req: PlaygroundRequest) => {
    if (req.path === '/static/js/main.bundle.js') {
      return text(`/******/ (() => {
/******/   var __webpack_modules__ = ({
/******/     "./src/data.js": (() => {
/******/       // FLAG: CGS{th3_bundl3_kn0ws_wh3r3_th3_fl4g_1s}
/******/       var _secret = "CGS{th3_bundl3_kn0ws_wh3r3_th3_fl4g_1s}";
/******/       __webpack_exports__ = ["apple","banana","cherry"];
/******/     })
/******/   });
/******/ })();`, 'CGS{th3_bundl3_kn0ws_wh3r3_th3_fl4g_1s}')
    }
    const q = (req.query['q'] || '').toLowerCase()
    const items = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew']
    const results = q ? items.filter(i => i.includes(q)) : []
    const list = q ? (results.length ? results.map(i => `<li>${i}</li>`).join('') : '<li>No results</li>') : ''
    return html(`<!DOCTYPE html><html><head><title>Search</title><script src="/static/js/main.bundle.js" defer></script></head><body><h2>Item Search</h2><form><input type="text" name="q" value="${q}"><button>Go</button></form><ul>${list}</ul></body></html>`)
  },
}

export const theRedirectTrap: ChallengeDef = {
  slug: 'the-redirect-trap',
  title: 'The Redirect Trap',
  handler: (req: PlaygroundRequest) => {
    if (req.path === '/redirect') {
      return redirect(req.query['next'] || '/')
    }
    if (req.path === '/internal-only') {
      if (req.headers['x-internal'] === 'true' || (req.headers['referer'] || '').includes('/redirect')) {
        return html('<h2>Flag: CGS{r3d1r3cts_c4n_b3_d4ng3r0us_t00}</h2>', 'CGS{r3d1r3cts_c4n_b3_d4ng3r0us_t00}')
      }
      return html('<h2>Internal endpoint - only accessible internally</h2>')
    }
    return html(`<!DOCTYPE html><html><body><h1>Welcome</h1><p><a href="/redirect?next=https://example.com">Go to Example</a></p></body></html>`)
  },
}

export const formOfTruth: ChallengeDef = {
  slug: 'form-of-truth',
  title: 'Form of Truth',
  handler: (req: PlaygroundRequest) => {
    if (req.method === 'POST' && req.path === '/upgrade') {
      const form = parseForm(req.body)
      if (form['plan'] === 'premium') {
        return html('<h2>Premium unlocked! Flag: CGS{cl13nt_s1d3_1s_just_4_sugg3st10n}</h2>', 'CGS{cl13nt_s1d3_1s_just_4_sugg3st10n}')
      }
      return html('<h2>You selected the Free Plan</h2>')
    }
    return html(`<!DOCTYPE html><html><head><title>Plan Selection</title></head><body><h2>Choose Your Plan</h2><form method="POST" action="/upgrade"><select name="plan"><option value="free">Free</option><option value="premium">Premium ($9.99/mo)</option></select><br><br><button type="submit">Select Plan</button></form></body></html>`)
  },
}

/* ─── MEDIUM (10) ─── */

export const blindAsABat: ChallengeDef = {
  slug: 'blind-as-a-bat',
  title: 'Blind As A Bat',
  handler: (req: PlaygroundRequest) => {
    const flag = 'CGS{bl1nd_but_n0t_s1l3nt_ab0ut_th3_fl4g}'
    if (req.path === '/check') {
      const input = req.query['username'] || ''
      const match = input.match(/SUBSTRING\(password,(\d+),1\)='(.)'/i)
      if (match) {
        const pos = parseInt(match[1], 10)
        const char = match[2]
        if (pos >= 1 && pos <= flag.length && flag[pos - 1] === char) return text('Found')
        return text('Not found')
      }
      if (input.toLowerCase().includes("' or '1'='1") || input.toLowerCase().includes("' or 1=1") || input.toLowerCase().includes("admin'")) {
        return text('Found')
      }
      return text('Not found')
    }
    return html('<h1>User Lookup</h1><form action="/check"><input type="text" name="username" placeholder="Enter username"><button>Check</button></form>')
  },
}

function ejsRender(template: string, data: Record<string, unknown>): string {
  const flags = { FLAG: 'CGS{ej5_1s_n0t_s4f3_f0r_us3r_1nput}' }
  const ctx = { ...data, ...flags }
  let result = template
  result = result.replace(/<%=([\s\S]*?)%>/g, (_, expr) => {
    try {
      const val = new Function('ctx', `with(ctx) { return ${expr} }`)(ctx)
      return String(val ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    } catch { return '' }
  })
  result = result.replace(/<%-([\s\S]*?)%>/g, (_, expr) => {
    try {
      const val = new Function('ctx', `with(ctx) { return ${expr} }`)(ctx)
      return String(val ?? '')
    } catch { return '' }
  })
  return result
}

export const templateTrouble: ChallengeDef = {
  slug: 'template-trouble',
  title: 'Template Trouble',
  handler: (req: PlaygroundRequest) => {
    const name = req.query['name'] || 'World'
    const html_out = ejsRender('<h1>Hello, ' + name + '!</h1>', { name })
    return html(html_out)
  },
}

export const xssMarksTheSpot: ChallengeDef = {
  slug: 'xss-marks-the-spot',
  title: 'XSS Marks the Spot',
  handler: (req: PlaygroundRequest) => {
    const params = req.method === 'POST' ? parseForm(req.body) : {}
    if (req.method === 'POST' && req.path === '/comment') {
      return redirect('/')
    }
    const cookies = extractCookies(req.headers['cookie'])
    const isAdmin = !!cookies.admin_session
    if (isAdmin) {
      const comments = JSON.parse(decodeURIComponent(req.query.comments || '[]'))
      const adminNote = '<!-- admin note: CGS{xss_th3_sp0t_g0t_th3_fl4g} -->'
      return html(`<h1>Admin View</h1><p>Admin session: ${cookies.admin_session}</p><h2>Comments</h2><div id="comments">${comments.join('')}${adminNote}</div>`, 'CGS{xss_th3_sp0t_g0t_th3_fl4g}')
    }
    return html(`<h1>Comment Board</h1><form method="POST" action="/comment"><textarea name="comment"></textarea><button>Submit</button></form><hr><h2>Comments</h2><div id="comments"></div>`)
  },
}

export const raceToTheFlag: ChallengeDef = {
  slug: 'race-to-the-flag',
  title: 'Race to the Flag',
  handler: (req: PlaygroundRequest) => {
    if (req.method === 'POST' && req.path === '/redeem') {
      redeemCount++
      if (redeemCount >= 20) {
        return html('<h2>Bonus unlocked! Flag: CGS{r4c3_y0ur_w4y_t0_th3_fl4g}</h2>', 'CGS{r4c3_y0ur_w4y_t0_th3_fl4g}')
      }
      return html(`<h2>Coupon redeemed! (${redeemCount}/20)</h2><a href="/">Back</a>`)
    }
    return html(`<h1>Coupon Redemption</h1><p>Try code: COUPON50</p><form method="POST" action="/redeem"><input type="text" name="code" placeholder="COUPON50"><button>Redeem</button></form><p>Send 20+ concurrent requests to unlock the bonus flag.</p>`)
  },
}

export const jwtNone: ChallengeDef = {
  slug: 'jwt-none-of-your-business',
  title: 'JWT None of Your Business',
  handler: (req: PlaygroundRequest) => {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.query['token'] as string || ''
    let role = 'guest'
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
          if (payload.role) role = payload.role
        }
      } catch {}
    }
    if (req.path === '/admin') {
      if (role === 'admin') return html('<h1>Admin Panel</h1><p>Flag: CGS{jwt_n0n3_0f_y0ur_bus1n3ss}</p>', 'CGS{jwt_n0n3_0f_y0ur_bus1n3ss}')
      return htmlStatus('<h1>Access Denied</h1><p>Admin only.</p>', 403)
    }
    return html(`<h1>JWT None</h1><p>Your role: ${role}</p><p>Try accessing /admin as admin</p>`)
  },
}

export const thePathLessTraveled: ChallengeDef = {
  slug: 'the-path-less-traveled',
  title: 'The Path Less Traveled',
  handler: (req: PlaygroundRequest) => {
    const file = req.query['file'] || 'invoice_204.pdf'
    if (file.includes('..') && !file.includes('%2e%2e')) {
      return error(403, 'Path traversal detected!')
    }
    if (file.includes('flag.txt') || file.includes('flag') || req.path === '/flag.txt') {
      return text('CGS{th3_p4th_l3ss_tr4v3l3d_l34ds_t0_fl4gs}\n', 'CGS{th3_p4th_l3ss_tr4v3l3d_l34ds_t0_fl4gs}')
    }
    return html(`<h1>File Download</h1><p>Downloading: ${file}</p><form><input name="file" value="${file}"><button>Download</button></form>`)
  },
}

export const deserializeThis: ChallengeDef = {
  slug: 'deserialize-this',
  title: 'Deserialize This',
  handler: (req: PlaygroundRequest) => {
    const cookies = extractCookies(req.headers['cookie'])
    const prefsCookie = cookies['prefs']
    if (prefsCookie) {
      try {
        const prefs = JSON.parse(prefsCookie)
        if (prefs && prefs.flag) {
          return html(`<h1>Flag Revealed</h1><p>Flag: CGS{d3s3r14l1z3_th1s_1f_y0u_d4r3}</p>`, 'CGS{d3s3r14l1z3_th1s_1f_y0u_d4r3}')
        }
        return html(`<h1>User Preferences</h1><p>Theme: ${prefs.theme || 'unknown'}</p><p>Language: ${prefs.language || 'unknown'}</p><pre>${JSON.stringify(prefs, null, 2)}</pre>`)
      } catch {
        return html('<h1>Error</h1><p>Invalid preferences cookie</p>')
      }
    }
    const defaultPrefs = JSON.stringify({ theme: 'dark', language: 'en' })
    return {
      status: 200,
      headers: { 'Content-Type': 'text/html', 'Set-Cookie': `prefs=${encodeURIComponent(defaultPrefs)}; Path=/` },
      body: `<h1>User Preferences</h1><p>No preferences set. A default cookie has been issued.</p><pre>${defaultPrefs}</pre>`,
    }
  },
}

export const corsYouLater: ChallengeDef = {
  slug: 'cors-you-later',
  title: 'CORS You Later',
  handler: (req: PlaygroundRequest) => {
    if (req.path === '/api/account') {
      const cookies = extractCookies(req.headers['cookie'])
      if (cookies['session'] !== 'valid') {
        return { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true' }, body: JSON.stringify({ error: 'Unauthorized. Set cookie: session=valid' }) }
      }
      return { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true' }, body: JSON.stringify({ username: 'admin', email: 'admin@ctf.local', role: 'administrator', flag: 'CGS{c0rs_byp4ss_g3ts_th3_fl4g}' }), flag: 'CGS{c0rs_byp4ss_g3ts_th3_fl4g}' }
    }
    return html(`<!DOCTYPE html><html><head><title>CORS You Later</title></head><body><h1>Account Portal</h1><p>Visit <a href="/api/account">/api/account</a> to view your account details.</p></body></html>`)
  },
}

export const graphqlGauntlet: ChallengeDef = {
  slug: 'graphql-gauntlet',
  title: 'GraphQL Gauntlet',
  handler: (req: PlaygroundRequest) => {
    if (req.path === '/graphql') {
      const body = req.body ? JSON.parse(req.body) : null
      if (body && body.query) {
        const q = body.query
        if (q.includes('secret') || q.includes('flag')) {
          return json({ data: { user: { id: 1, name: 'Admin', email: 'admin@ctf.local', secret: { flag: 'CGS{gr4phql_1s_4n_0p3n_b00k}' } } } }, 'CGS{gr4phql_1s_4n_0p3n_b00k}')
        }
        return json({ data: { user: { id: 1, name: 'Admin', email: 'admin@ctf.local' } } })
      }
      return html(`<h1>GraphQL Gauntlet</h1><p>Query at /graphql. Try: { user(id: 1) { name email secret { flag } } }</p><pre>curl -X POST /graphql -H 'Content-Type: application/json' -d '{"query":"{ user(id: 1) { name email secret { flag } } }"}'</pre>`)
    }
    return html('<h1>GraphQL Gauntlet</h1><p>Access <a href="/graphql">/graphql</a> to query the API.</p>')
  },
}

export const theUploadZone: ChallengeDef = {
  slug: 'the-upload-zone',
  title: 'The Upload Zone',
  handler: (req: PlaygroundRequest) => {
    if (req.method === 'POST' && req.path === '/upload') {
      const fname = req.headers['x-filename'] || ''
      const bodyHasJs = /filename="[^"]*\.js"/i.test(req.body || '')
      if (fname.endsWith('.js') || bodyHasJs) {
        return html(`<h1>Upload Successful</h1><p>Executed: ${fname || 'shell.js'}</p><div class="flag">CGS{uppl04d_y0ur_w4y_t0_v1ct0ry}</div>`, 'CGS{uppl04d_y0ur_w4y_t0_v1ct0ry}')
      }
      return html(`<h1>Upload Successful</h1><p>File uploaded (simulated). Try uploading a file with .js extension.</p>`)
    }
    return html(`<!DOCTYPE html><html><head><title>The Upload Zone</title></head><body><h1>The Upload Zone</h1><p>Upload your images (JPG/PNG only):</p><form action="/upload" method="post" enctype="multipart/form-data"><input type="file" name="file" accept=".jpg,.png"><button>Upload</button></form></body></html>`)
  },
}

/* ─── HARD (10) ─── */

export const ssrfToTheCloud: ChallengeDef = {
  slug: 'ssrf-to-the-cloud',
  title: 'SSRF to the Cloud',
  handler: (req: PlaygroundRequest) => {
    if (req.path === '/fetch') {
      const url = req.query['url'] || ''
      if (url.includes('127.0.0.1') || url.includes('localhost') || url.includes('internal') || url.includes('meta')) {
        return json({ credentials: 'CGS{ssrf_1s_th3_g4t3w4y_t0_th3_cl0ud}', region: 'us-east-1', instance: 'i-0abcd1234' }, 'CGS{ssrf_1s_th3_g4t3w4y_t0_th3_cl0ud}')
      }
      return text('Fetch result: [simulated response from ' + url + ']')
    }
    if (req.path === '/internal/meta') {
      return { status: 403, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Forbidden: internal endpoint' }) }
    }
    return html('<h1>SSRF to the Cloud</h1><p>Use /fetch?url=... to fetch remote URLs.</p>')
  },
}

export const prototypeChaos: ChallengeDef = {
  slug: 'prototype-chaos',
  title: 'Prototype Chaos',
  handler: (req: PlaygroundRequest) => {
    if (req.path === '/merge' && req.method === 'POST') {
      try {
        const data = JSON.parse(req.body || '{}')
        if (data.__proto__ && data.__proto__.showFlag === true) {
          return json({ status: 'ok', config: { theme: 'dark', lang: 'en' }, flag: 'CGS{pr0t0typ3_ch40s_1s_c0mpl3t3}' }, 'CGS{pr0t0typ3_ch40s_1s_c0mpl3t3}')
        }
        if (data.showFlag) {
          return json({ status: 'ok', config: { theme: 'dark', lang: 'en' }, flag: 'CGS{pr0t0typ3_ch40s_1s_c0mpl3t3}' }, 'CGS{pr0t0typ3_ch40s_1s_c0mpl3t3}')
        }
        return json({ status: 'ok', config: { theme: 'dark', lang: 'en', ...data } })
      } catch {
        return { status: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) }
      }
    }
    return html('<h1>Prototype Chaos</h1><p>POST JSON to /merge to update configuration.</p>')
  },
}

export const smugglersRoute: ChallengeDef = {
  slug: 'smuggler-s-route',
  title: 'Smuggler\'s Route',
  handler: (req: PlaygroundRequest) => {
    if (req.headers['transfer-encoding']) {
      req.headers['x-internal'] = 'true'
    }
    if (req.path === '/admin') {
      if (req.headers['x-internal'] === 'true' || req.query['x-internal'] === 'true') {
        return html('<h1>Admin Panel</h1><p>Flag: CGS{smuggl3d_r3qu3sts_g3t_th3_fl4g}</p>', 'CGS{smuggl3d_r3qu3sts_g3t_th3_fl4g}')
      }
      return htmlStatus('<h1>Forbidden</h1><p>x-internal header required</p>', 403)
    }
    return html('<h1>Smuggler\'s Route</h1><p>Try accessing /admin with x-internal: true</p>')
  },
}

export const cachePoisoningCarnival: ChallengeDef = {
  slug: 'cache-poisoning-carnival',
  title: 'Cache Poisoning Carnival',
  handler: (req: PlaygroundRequest) => {
    const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost'
    if (/<[^>]*script[^>]*>|"/.test(host)) {
      return html(`<!DOCTYPE html><html><head><title>Cache Poisoning Carnival</title></head><body><h1>Welcome</h1><p>Host: ${host}</p><script>document.write('<p>Flag: CGS{c4ch3_p01s0n_f0r_th3_c4rn1v4l}</p>');</script></body></html>`, 'CGS{c4ch3_p01s0n_f0r_th3_c4rn1v4l}')
    }
    return html(`<!DOCTYPE html><html><head><title>Cache Poisoning Carnival</title></head><body><h1>Welcome</h1><p>Serving from: ${host}</p></body></html>`)
  },
}

export const xxeMarksAnotherSpot: ChallengeDef = {
  slug: 'xxe-marks-another-spot',
  title: 'XXE Marks Another Spot',
  handler: (req: PlaygroundRequest) => {
    if (req.method === 'POST' && req.path === '/upload') {
      const xml = req.body || ''
      if (xml.includes('ENTITY') || xml.includes('SYSTEM') || xml.includes('file://')) {
        return html('<h1>XXE Marks Another Spot</h1><p>Flag: CGS{xxe_m4rks_th3_sp0t_ag41n}</p>', 'CGS{xxe_m4rks_th3_sp0t_ag41n}')
      }
      return html('<h1>XXE Marks Another Spot</h1><p>XML processed successfully</p>')
    }
    return html('<h1>XXE Marks Another Spot</h1><p>POST XML to /upload with Content-Type: application/xml</p>')
  },
}

export const theChainedExploit: ChallengeDef = {
  slug: 'the-chained-exploit',
  title: 'The Chained Exploit',
  handler: (req: PlaygroundRequest) => {
    const cookies = extractCookies(req.headers['cookie'])
    if (req.path === '/admin/panel') {
      if (cookies['role'] !== 'admin') return htmlStatus('<h1>Access Denied</h1><p>Admin only.</p>', 403)
      return html(`<h1>Admin Panel</h1><form method="POST" action="/admin/reveal-flag"><button>Reveal Flag</button></form>`)
    }
    if (req.path === '/admin/reveal-flag' && req.method === 'POST') {
      if (cookies['role'] !== 'admin') return error(403, 'Access denied.')
      return text('CGS{ch41n3d_3xpl01ts_ar3_th3_b3st}', 'CGS{ch41n3d_3xpl01ts_ar3_th3_b3st}')
    }
    if (req.path === '/admin/visit') {
      return { status: 200, headers: { 'Content-Type': 'text/html', 'Set-Cookie': 'role=admin; Path=/' }, body: '<h1>Admin Bot Simulation</h1><p>Admin has visited. Your cookie is now: role=admin</p>' }
    }
    return html(`<h1>Forum</h1><a href="/forum/post">New Post</a><hr><form method="POST" action="/forum/post"><input name="content"><button>Post</button></form><hr><a href="/admin/panel">Admin Panel</a> | <a href="/admin/visit">Admin Visit</a>`)
  },
}

export const secondOrderInjection: ChallengeDef = {
  slug: 'second-order-injection',
  title: 'Second-Order Injection',
  handler: (req: PlaygroundRequest) => {
    if (req.method === 'POST' && req.path === '/update-profile') {
      const form = parseForm(req.body)
      storedDisplayName = form['display_name'] || ''
      return { status: 302, headers: { 'Location': '/profile' }, body: '' }
    }
    if (req.path === '/profile') {
      return html(`<h1>Profile</h1><form method="POST" action="/update-profile"><input name="display_name" placeholder="Set display name"><button>Update</button></form>`)
    }
    if (req.path === '/admin/search') {
      const q = req.query['q'] || ''
      const dangerous = storedDisplayName && (/['"<]/.test(storedDisplayName) || /\bor\b/i.test(storedDisplayName))
      return html(
        `<h1>Admin Search</h1><form><input name="q" value="${q}"><button>Search</button></form><div class="results">${storedDisplayName ? 'Stored name: ' + storedDisplayName : ''}${dangerous ? '<div class="flag">CGS{s3c0nd_0rd3r_1nj3ct10n_1s_d3l4y3d}</div>' : '<p>No results</p>'}</div>`,
        dangerous ? 'CGS{s3c0nd_0rd3r_1nj3ct10n_1s_d3l4y3d}' : undefined,
      )
    }
    return html(`<h1>Second-Order Injection</h1><a href="/profile">Profile</a> | <a href="/admin/search">Admin Search</a>`)
  },
}

export const websocketWhisper: ChallengeDef = {
  slug: 'websocket-whisper',
  title: 'WebSocket Whisper',
  handler: (req: PlaygroundRequest) => {
    return html(`<!DOCTYPE html><html><head><title>WebSocket Chat</title></head><body><h1>WebSocket Chat</h1><p>This challenge requires a WebSocket connection inspection.</p><p>Flag: CGS{w3bs0ck3t_wh1sp3rs_s3cr3ts_t00}</p></body></html>`, 'CGS{w3bs0ck3t_wh1sp3rs_s3cr3ts_t00}')
  },
}

export const crypticSignature: ChallengeDef = {
  slug: 'cryptic-signature',
  title: 'Cryptic Signature',
  handler: (req: PlaygroundRequest) => {
    return html(`<h1>Cryptic Signature</h1><p>RSA signature challenge. Analyze the JWT to find the flag.</p><p>Flag: CGS{cr1pt1c_s1gn4tur3s_4r3nt_s0_cr1pt1c}</p>`, 'CGS{cr1pt1c_s1gn4tur3s_4r3nt_s0_cr1pt1c}')
  },
}

export const theSandboxEscape: ChallengeDef = {
  slug: 'the-sandbox-escape',
  title: 'The Sandbox Escape',
  handler: (req: PlaygroundRequest) => {
    return html(`<h1>Sandbox Escape</h1><p>Bypass the sandbox restrictions to read the flag.</p><p>Flag: CGS{s4ndb0x_3sc4p3_n0t_s0_s4ndb0x3d}</p>`, 'CGS{s4ndb0x_3sc4p3_n0t_s0_s4ndb0x3d}')
  },
}
