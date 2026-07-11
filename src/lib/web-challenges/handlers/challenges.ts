import crypto from 'crypto'
import { ChallengeDef, PlaygroundRequest, html, json, text, redirect, error, extractCookies } from '../types'

function flagPage(title: string, bodyHtml: string, _flag: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{background:#0a0c14;color:#e2e8f0;font-family:monospace;padding:40px;max-width:700px;margin:auto;line-height:1.6}a{color:#22d3ee}.flag{background:rgba(52,232,158,0.15);color:#34e89e;padding:12px 20px;border-radius:8px;border:1px solid rgba(52,232,158,0.3);margin:20px 0;font-size:14px;text-align:center}.box{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin:16px 0}h1{font-size:20px;color:#f1f5f9}code{color:#22d3ee;font-size:13px}input,textarea,select{background:#0a0c14;border:1px solid rgba(255,255,255,0.12);color:#e2e8f0;padding:8px 12px;border-radius:6px;font-family:monospace;font-size:13px;width:100%;box-sizing:border-box}button{background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.25);color:#22d3ee;padding:8px 16px;border-radius:6px;font-family:monospace;cursor:pointer;font-size:13px}button:hover{background:rgba(34,211,238,0.2)}pre{background:#05070c;padding:12px;border-radius:6px;overflow-x:auto;font-size:12px;color:#94a3b8}.solved{color:#34e89e;font-weight:bold}</style></head><body><div class="box"><h1>${title}</h1>${bodyHtml}</div></body></html>`
}

function simplePage(title: string, bodyHtml: string): string {
  return flagPage(title, bodyHtml, '')
}

/* ───────────────────────── EASY ───────────────────────── */

export const hiddenInPlainSight: ChallengeDef = {
  slug: 'hidden-in-plain-sight',
  title: 'Hidden in Plain Sight',
  handler: (_req: PlaygroundRequest) => ({
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'X-Flag': 'CGS{h34d3rs_h1d3_th1ngs_t00}',
      'X-Hint': 'Look in the response headers',
    },
    body: simplePage('Hidden in Plain Sight', `
      <p>Welcome to our landing page. Everything looks normal.</p>
      <p>Check the network response — sometimes the server says more than what's on screen.</p>
    `),
    flag: 'CGS{h34d3rs_h1d3_th1ngs_t00}',
  }),
}

export const cookieJar: ChallengeDef = {
  slug: 'cookie-jar',
  title: 'Cookie Jar',
  handler: (req: PlaygroundRequest) => {
    const cookies = extractCookies(req.headers['cookie'])
    if (cookies['role'] === 'admin') {
      return html(flagPage('Cookie Jar', `
        <p>Welcome, <strong>Admin</strong>! Here is your flag:</p>
        <div class="flag">CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}</div>
      `, 'CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}'), 'CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}')
    }
    return html(simplePage('Cookie Jar', `
      <p>Welcome, Guest! The admin area is locked.</p>
      <p>Try changing your <strong>role</strong> cookie to <code>admin</code>.</p>
      <p>Your current cookies: <code>${JSON.stringify(cookies)}</code></p>
    `))
  },
}

export const viewSource: ChallengeDef = {
  slug: 'view-source',
  title: 'View Source',
  handler: () => {
    return html(simplePage('View Source', `
      <p>Our new security portal VaultCore is now live!</p>
      <p>Visit the site and inspect it carefully. Sometimes the most important things are hidden in plain sight.</p>
      <p><a href="/challenge-instances/20/" target="_blank" style="display:inline-block;margin-top:12px;padding:10px 24px;background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.25);color:#22d3ee;border-radius:6px;text-decoration:none;font-family:monospace;">Open VaultCore Portal →</a></p>
      <p style="color:#94a3b8;font-size:11px;margin-top:12px">Hint: The source code tells a story. Look at what the browser loads.</p>
    `))
  },
}

export const guestVsAdmin: ChallengeDef = {
  slug: 'guest-vs-admin',
  title: 'Guest vs Admin',
  handler: (req: PlaygroundRequest) => {
    const cookies = extractCookies(req.headers['cookie'])
    const token = cookies['token'] || req.headers['authorization'] || ''
    if (token.includes('admin') || token === 'admin-token-123') {
      return html(flagPage('Dashboard', `
        <p>Welcome, <strong>Administrator</strong>! You have full access.</p>
        <div class="flag">CGS{r0l3_b4s3d_4cc3ss_1s_just_b3l13f}</div>
      `, 'CGS{r0l3_b4s3d_4cc3ss_1s_just_b3l13f}'), 'CGS{r0l3_b4s3d_4cc3ss_1s_just_b3l13f}')
    }
    return {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': 'token=guest-token-abc; Path=/',
      },
      body: simplePage('Dashboard', `
        <p>Welcome, <strong>Guest</strong>. You have limited access.</p>
        <p>Set your <code>token</code> cookie to <code>admin-token-123</code> to gain admin access.</p>
      `),
    }
  },
}

export const pathAsParameter: ChallengeDef = {
  slug: 'path-as-a-parameter',
  title: 'Path as a Parameter',
  handler: (req: PlaygroundRequest) => {
    const file = req.query['file'] || 'welcome.txt'
    const safeDir = 'files/'
    if (file.includes('..')) {
      return text(`flag.txt content:\nCGS{s4mpl3_4pp_l34ks_f1l3s}`, 'CGS{s4mpl3_4pp_l34ks_f1l3s}')
    }
    if (file === 'flag.txt') {
      return text('Access denied: flag.txt is restricted.')
    }
    return text(`Content of ${safeDir}${file}:\nWelcome to the file viewer! You are viewing: ${file}`)
  },
}

export const apiRateLimitRace: ChallengeDef = {
  slug: 'api-rate-limit-race',
  title: 'API Rate Limit Race',
  handler: (req: PlaygroundRequest) => {
    const coupons = ['COUPON50', 'COUPON100']
    const body = req.body || ''
    const code = body.match(/code=([^&]+)/)?.[1] || ''
    if (coupons.includes(code)) {
      const ts = Date.now()
      return json({
        success: true,
        message: `Coupon ${code} applied! You saved $$`,
        timestamp: ts,
        applied: ts % 100 < 30 ? 'double-spend detected!' : 'once',
        flag: ts % 100 < 30 ? 'CGS{r4c3_th3_l1m1t_y0u_w1n}' : undefined,
      }, ts % 100 < 30 ? 'CGS{r4c3_th3_l1m1t_y0u_w1n}' : undefined)
    }
    return html(simplePage('Coupon Applier', `
      <p>Apply a coupon code to get a discount.</p>
      <form method="POST">
        <p><input name="code" placeholder="COUPON50 or COUPON100"></p>
        <p><button type="submit">Apply</button></p>
      </form>
      <p style="color:#94a3b8;font-size:11px">Hint: Send multiple requests at the same time.</p>
    `))
  },
}

/* ───────────────────────── MEDIUM ───────────────────────── */

export const sqliSpeakeasy: ChallengeDef = {
  slug: 'sqli-speakeasy',
  title: 'SQLi Speakeasy',
  handler: (req: PlaygroundRequest) => {
    const body = req.body || ''
    const username = body.match(/username=([^&]+)/)?.[1] || ''
    const password = body.match(/password=([^&]+)/)?.[1] || ''
    const decodedU = decodeURIComponent(username)
    const decodedP = decodeURIComponent(password)

    if (decodedU.toLowerCase().includes("' or ") || decodedU.toLowerCase().includes("'--") ||
        decodedU.toLowerCase().includes("1=1") || decodedP.toLowerCase().includes("' or ") ||
        decodedP.toLowerCase().includes("'--") || decodedP.toLowerCase().includes("1=1")) {
      return html(flagPage('Admin Panel', `
        <p>Login successful! Welcome back, <strong>admin</strong>.</p>
        <div class="flag">CGS{uni0n_s3l3ct_y0ur_w4y_1n}</div>
      `, 'CGS{uni0n_s3l3ct_y0ur_w4y_1n}'))
    }

    if (decodedU === 'admin' && decodedP === 'supersecret') {
      return html(flagPage('Admin Panel', `
        <p>Login successful! Welcome back, <strong>admin</strong>.</p>
        <div class="flag">CGS{uni0n_s3l3ct_y0ur_w4y_1n}</div>
      `, 'CGS{uni0n_s3l3ct_y0ur_w4y_1n}'))
    }

    return html(simplePage('Login', `
      <p>Please sign in to access the admin panel.</p>
      <form method="POST">
        <p><label>Username:<br><input name="username"></label></p>
        <p><label>Password:<br><input name="password" type="password"></label></p>
        <p><button type="submit">Login</button></p>
      </form>
      <p style="color:#94a3b8;font-size:11px">Hint: The query is: SELECT * FROM users WHERE username='<input>' AND password='<input>'</p>
    `))
  },
}

export const pathLessTraveled: ChallengeDef = {
  slug: 'path-less-traveled',
  title: 'Path Less Traveled',
  handler: (req: PlaygroundRequest) => {
    const file = req.query['file'] || 'index.html'
    if (file.includes('flag') || file.includes('..')) {
      return text(`CGS{p4th_tr4v3rs4l_1s_a_cl4ss1c}`, 'CGS{p4th_tr4v3rs4l_1s_a_cl4ss1c}')
    }
    return html(simplePage('File Viewer', `
      <p>Viewing: <code>${file}</code></p>
      <p>Try accessing files outside the web root using path traversal.</p>
      <p>Current directory: <code>/var/www/html/</code></p>
      <pre>This is the content of ${file}.</pre>
    `))
  },
}

export const blindSqli: ChallengeDef = {
  slug: 'blind-sqli',
  title: 'Blind SQLi',
  handler: (req: PlaygroundRequest) => {
    const id = req.query['id'] || ''
    if (id.includes("1=1") || id.includes("' or ") || (id.includes("'") && id.includes("1=1"))) {
      return html(simplePage('User Lookup', `<p>User found: admin (ID: 1)</p><div class="flag">CGS{bl1nd_1nputs_st1ll_sp34k_l0udly}</div>`), 'CGS{bl1nd_1nputs_st1ll_sp34k_l0udly}')
    }
    if (id.includes("1=2") || id.includes("1=0")) {
      return html(simplePage('User Lookup', `<p>No user found.</p>`))
    }
    return html(simplePage('User Lookup', `
      <p>Look up a user by ID.</p>
      <form><p><input name="id" placeholder="1" value="${id}"><button type="submit">Search</button></p></form>
      <p>User found: guest (ID: ${id || '?'}) — you can only see your own info.</p>
      <p style="color:#94a3b8;font-size:11px">Try a boolean-based blind SQL injection.</p>
    `))
  },
}

export const nosqlInjection: ChallengeDef = {
  slug: 'nosql-injection',
  title: 'NoSQL Injection',
  handler: (req: PlaygroundRequest) => {
    const body = req.body || ''
    let parsed: any = {}
    try {
      if (req.headers['content-type']?.includes('json')) {
        parsed = JSON.parse(body || '{}')
      }
    } catch {}
    const username = parsed.username || body.match(/username=([^&]+)/)?.[1] || req.query['username'] || ''
    const password = parsed.password || body.match(/password=([^&]+)/)?.[1] || req.query['password'] || ''

    if (typeof username === 'object' && username.$ne) {
      return json({ success: true, message: 'Login successful!', flag: 'CGS{n0sql_1nj3ct_1s_th3_n3w_sql}' }, 'CGS{n0sql_1nj3ct_1s_th3_n3w_sql}')
    }
    if (username === 'admin' && password === 'admin') {
      return json({ success: true, message: 'Login successful!', flag: 'CGS{n0sql_1nj3ct_1s_th3_n3w_sql}' }, 'CGS{n0sql_1nj3ct_1s_th3_n3w_sql}')
    }
    return json({ success: false, message: 'Invalid credentials' })
  },
}

export const ssti: ChallengeDef = {
  slug: 'ssti',
  title: 'SSTI',
  handler: (req: PlaygroundRequest) => {
    const name = req.query['name'] || req.body?.match(/name=([^&]+)/)?.[1] || 'world'
    const decoded = decodeURIComponent(name)

    if (decoded.includes('{{') && decoded.includes('}}') && (decoded.includes('config') || decoded.includes('self') || decoded.includes('__class__'))) {
      return html(flagPage('Greeting', `
        <p>Hello, <strong>SSTI Master</strong>!</p>
        <div class="flag">CGS{t3mpl4t3s_d0nt_3sc4p3_3v3ryth1ng}</div>
      `, 'CGS{t3mpl4t3s_d0nt_3sc4p3_3v3ryth1ng}'))
    }

    if (decoded.includes('{{') || decoded.includes('{%')) {
      return html(simplePage('Greeting', `<p>Hello, <strong>${decoded}</strong>!</p><p style="color:#94a3b8;font-size:11px">Interesting syntax... the template engine evaluates it.</p>`))
    }

    return html(simplePage('Greeting', `
      <p>Hello, <strong>${decoded}</strong>!</p>
      <form><p><input name="name" placeholder="world"><button type="submit">Greet</button></p></form>
      <p style="color:#94a3b8;font-size:11px">Try injecting template syntax like <code>{{7*7}}</code></p>
    `))
  },
}

export const openRedirect: ChallengeDef = {
  slug: 'open-redirect',
  title: 'Open Redirect',
  handler: (req: PlaygroundRequest) => {
    const url = req.query['url'] || req.query['next'] || req.query['redirect'] || ''
    if (url) {
      return redirect(url, 'CGS{0p3n_r3d1r3ct_n0t_just_f1sh1ng}')
    }
    return html(simplePage('Redirect Service', `
      <p>This service redirects you to other pages.</p>
      <form><p><input name="url" placeholder="https://example.com"><button type="submit">Go</button></p></form>
      <p>Try passing an external URL as the <code>url</code> parameter.</p>
    `))
  },
}

export const corsChallenge: ChallengeDef = {
  slug: 'cors-misconfig',
  title: 'CORS Misconfig',
  handler: (req: PlaygroundRequest) => {
    const origin = req.headers['origin'] || req.headers['referer'] || ''
    const host = req.headers['host'] || 'localhost'
    if (origin && !origin.includes(host)) {
      return json({
        secret: 'CGS{c0rs_th1nk1ng_y0u_c4n_r34d}',
        message: 'This data is accessible cross-origin due to permissive CORS policy.',
        sensitive: true,
      }, 'CGS{c0rs_th1nk1ng_y0u_c4n_r34d}')
    }
    return json({
      message: 'CORS headers not triggered. Make a request from a different origin.',
      hint: 'Set the Origin header to something external.',
    })
  },
}

export const idor: ChallengeDef = {
  slug: 'idor',
  title: 'IDOR',
  handler: (req: PlaygroundRequest) => {
    const userId = parseInt(req.query['user_id'] || '1')
    const users: Record<number, any> = {
      1: { id: 1, username: 'guest', email: 'guest@test.com', role: 'user' },
      2: { id: 2, username: 'alice', email: 'alice@test.com', role: 'user' },
      3: { id: 3, username: 'admin', email: 'admin@test.com', role: 'admin', flag: 'CGS{d1r3ct_0bj3ct_r3f3r3nc3_byp4ss}' },
    }
    const u = users[userId]
    if (u) {
      if (u.role === 'admin') {
        return json({ ...u, flag: 'CGS{d1r3ct_0bj3ct_r3f3r3nc3_byp4ss}' }, 'CGS{d1r3ct_0bj3ct_r3f3r3nc3_byp4ss}')
      }
      return json(u)
    }
    return error(404, 'User not found')
  },
}

/* ───────────────────────── HARD ───────────────────────── */

export const ssrf: ChallengeDef = {
  slug: 'ssrf-to-the-crown-jewels',
  title: 'SSRF to the Crown Jewels',
  handler: (req: PlaygroundRequest) => {
    const url = req.query['url'] || req.body?.match(/url=([^&]+)/)?.[1] || ''
    const decoded = decodeURIComponent(url)

    if (decoded.includes('localhost') || decoded.includes('127.0.0.1') || decoded.includes('0.0.0.0') || decoded.includes('[::1]') || decoded.includes('metadata')) {
      return text(`Internal metadata service response:\n{\n  "flag": "CGS{m3t4d4t4_s3rv1c3s_tru5t_t00_much}",\n  "region": "us-east-1",\n  "instance-id": "i-1234567890"\n}`, 'CGS{m3t4d4t4_s3rv1c3s_tru5t_t00_much}')
    }

    return html(simplePage('URL Fetcher', `
      <p>Fetch a URL and see its contents.</p>
      <form method="POST">
        <p><input name="url" placeholder="https://example.com"></p>
        <p><button type="submit">Fetch</button></p>
      </form>
      ${url ? `<p>Fetched: ${decoded}</p><pre>Content not available (external fetch disabled in sandbox)</pre>` : ''}
      <p style="color:#94a3b8;font-size:11px">Try accessing internal services like localhost or cloud metadata endpoints.</p>
    `))
  },
}

export const xss: ChallengeDef = {
  slug: 'xss-to-admin',
  title: 'XSS to Admin',
  handler: (req: PlaygroundRequest) => {
    const comment = req.body?.match(/comment=([^&]+)/)?.[1] || ''
    const decoded = decodeURIComponent(comment)

    if (decoded.includes('<script>') || decoded.includes('onerror') || decoded.includes('onload') || decoded.includes('javascript:')) {
      return html(flagPage('Guestbook', `
        <p>Comment submitted! An admin will review it shortly.</p>
        <p>Your comment: ${decoded}</p>
        <div class="flag">CGS{xss_th3_adm1ns_c00k13_pl34s3}</div>
        <p style="color:#94a3b8;font-size:11px">Since this is a simulation, the flag is revealed when XSS is detected. In a real scenario, you'd steal the admin's cookie.</p>
      `, 'CGS{xss_th3_adm1ns_c00k13_pl34s3}'))
    }

    return html(simplePage('Guestbook', `
      <p>Leave a comment and an admin will review it.</p>
      <form method="POST">
        <p><textarea name="comment" rows="3" placeholder="Your comment"></textarea></p>
        <p><button type="submit">Submit</button></p>
      </form>
      ${decoded ? `<p>Your comment: ${decoded}</p>` : ''}
      <p style="color:#94a3b8;font-size:11px">The admin bot will visit your comment. What will they see?</p>
    `))
  },
}

export const prototypePollution: ChallengeDef = {
  slug: 'prototype-pollution',
  title: 'Prototype Pollution',
  handler: (req: PlaygroundRequest) => {
    const body = req.body || '{}'
    let parsed: any = {}
    try { parsed = JSON.parse(body) } catch {}

    if (parsed.__proto__?.isAdmin === true || parsed.constructor?.prototype?.isAdmin === true) {
      return json({
        success: true,
        message: 'Admin access granted via prototype pollution!',
        flag: 'CGS{pr0t0typ3_p0llut10n_1s_s3lf_m0d1fy}',
        isAdmin: true,
      }, 'CGS{pr0t0typ3_p0llut10n_1s_s3lf_m0d1fy}')
    }

    return json({
      success: false,
      message: 'User created',
      user: { username: parsed.username || 'unknown', isAdmin: false },
      hint: 'Try polluting __proto__ or constructor.prototype',
    })
  },
}

export const jwtNone: ChallengeDef = {
  slug: 'jwt-algorithm-confusion',
  title: 'JWT Algorithm Confusion',
  handler: (req: PlaygroundRequest) => {
    const auth = req.headers['authorization'] || ''
    const token = auth.replace('Bearer ', '')

    if (token) {
      try {
        const parts = token.split('.')
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
        if (header.alg === 'none' || header.alg === 'None' || header.alg === 'NONE') {
          return json({
            success: true,
            message: 'JWT with alg:none accepted! You are now admin.',
            flag: 'CGS{jwt_alg_n0n3_byp4ss_l34ds_t0_rce}',
          }, 'CGS{jwt_alg_n0n3_byp4ss_l34ds_t0_rce}')
        }
        return json({ success: false, message: `Invalid token (alg: ${header.alg})` })
      } catch {}
    }

    return json({
      hint: 'Set Authorization: Bearer <jwt>',
      example: 'Try alg:none with an empty signature',
      publicKey: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8kGa1QN9o...\n-----END PUBLIC KEY-----',
    })
  },
}

export const csrf: ChallengeDef = {
  slug: 'csrf-token-bypass',
  title: 'CSRF Token Bypass',
  handler: (req: PlaygroundRequest) => {
    const origin = req.headers['origin'] || req.headers['referer'] || ''
    const host = req.headers['host'] || 'localhost'
    const body = req.body || ''
    const action = body.match(/action=([^&]+)/)?.[1] || ''

    if (action === 'transfer') {
      if (origin && !origin.includes(host)) {
        return html(flagPage('Bank Transfer', `
          <p>Transfer completed!</p>
          <p>Note: This request came from <code>${origin}</code> — a different origin.</p>
          <div class="flag">CGS{csrf_byp4ss_w1th_c00k13_s3cr3ts}</div>
        `, 'CGS{csrf_byp4ss_w1th_c00k13_s3cr3ts}'))
      }
      return html(simplePage('Bank Transfer', `
        <p>Transfer requires same-origin request.</p>
        <p>Origin: ${origin || '(none)'}</p>
      `))
    }

    return html(simplePage('Bank', `
      <p>Welcome to the bank. Your balance: $10,000</p>
      <form method="POST">
        <input type="hidden" name="action" value="transfer">
        <p><button type="submit">Transfer $1000</button></p>
      </form>
      <p style="color:#94a3b8;font-size:11px">This form has no CSRF token. Try submitting from an external page.</p>
    `))
  },
}

export const xxe: ChallengeDef = {
  slug: 'xxe',
  title: 'XXE',
  handler: (req: PlaygroundRequest) => {
    const body = req.body || ''
    if (body.includes('<!ENTITY') && (body.includes('file://') || body.includes('/etc') || body.includes('flag'))) {
      return html(flagPage('XML Parser', `
        <p>XML parsed!</p>
        <pre>
          User: admin
          Password: s3cr3t
          Flag: CGS{xxe_st1ll_w0rks_1n_2k24}
        </pre>
      `, 'CGS{xxe_st1ll_w0rks_1n_2k24}'))
    }
    return html(simplePage('XML Parser', `
      <p>Submit an XML document to parse.</p>
      <form method="POST">
        <p><textarea name="xml" rows="6" placeholder="&lt;user>&lt;name>test&lt;/name>&lt;/user>"></textarea></p>
        <p><button type="submit">Parse</button></p>
      </form>
      <p style="color:#94a3b8;font-size:11px">The parser has external entity processing enabled.</p>
    `))
  },
}

export const raceCondition: ChallengeDef = {
  slug: 'race-condition',
  title: 'Race Condition',
  handler: (req: PlaygroundRequest) => {
    if (req.method === 'POST') {
      const now = Date.now()
      const balance = Math.max(0, 1000 - Math.floor(now / 100) % 10)
      return json({
        balance,
        message: balance <= 0 ? 'Account depleted! But wait...' : 'Withdrawal processed',
        flag: balance <= 0 ? 'CGS{r4c3_c0nd1t10n_d0ubl3_sp3nd}' : undefined,
        hint: balance <= 0 ? undefined : 'Send multiple concurrent requests to race the balance check.',
      }, balance <= 0 ? 'CGS{r4c3_c0nd1t10n_d0ubl3_sp3nd}' : undefined)
    }
    return html(simplePage('Bank', `
      <p>Your balance: $1000</p>
      <form method="POST">
        <p><button type="submit">Withdraw $100</button></p>
      </form>
      <p style="color:#94a3b8;font-size:11px">The balance check is not atomic. Send many requests at once.</p>
    `))
  },
}

export const webCachePoisoning: ChallengeDef = {
  slug: 'cache-poisoning',
  title: 'Web Cache Poisoning',
  handler: (req: PlaygroundRequest) => {
    const xHost = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost'
    const path = req.query['path'] || '/'
    const poisoned = xHost !== (req.headers['host'] || 'localhost') && xHost !== 'localhost'

    if (poisoned) {
      return html(flagPage('Cached Page', `
        <p>Serving cached version from: <code>${xHost}</code></p>
        <p>This content was poisoned via cache!</p>
        <div class="flag">CGS{p01s0n_th3_c4ch3_t0_w1n_th3_g4m3}</div>
      `, 'CGS{p01s0n_th3_c4ch3_t0_w1n_th3_g4m3}'))
    }

    return html(simplePage('Home', `
      <p>Welcome to the homepage!</p>
      <p>Cached at: ${new Date().toISOString()}</p>
      <p>Host: ${xHost}</p>
      <p style="color:#94a3b8;font-size:11px">The cache key does not include the X-Forwarded-Host header. Try manipulating it.</p>
    `))
  },
}
