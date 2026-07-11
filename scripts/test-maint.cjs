const http = require('http')
const { URL } = require('url')

const BASE = process.env.BASE || 'http://localhost:3000'

function req(method, path, { cookie, body, json } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path)
    const data = body ? JSON.stringify(body) : null
    const headers = {}
    if (cookie) headers['Cookie'] = cookie
    if (data) headers['Content-Type'] = 'application/json'
    if (json === false) headers['Accept'] = 'text/html'
    const r = http.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers },
      (res) => {
        let chunks = ''
        res.on('data', (c) => (chunks += c))
        res.on('end', () =>
          resolve({ status: res.statusCode, setCookie: res.headers['set-cookie'], body: chunks })
        )
      }
    )
    r.on('error', reject)
    if (data) r.write(data)
    r.end()
  })
}

;(async () => {
  // 1. login as admin
  const login = await req('POST', '/api/auth/login', {
    body: { username: 'admin', password: 'Admin123!' },
  })
  console.log('LOGIN status:', login.status)
  const sc = login.setCookie || []
  const cookie = sc.map((c) => c.split(';')[0]).join('; ')
  console.log('COOKIE:', cookie ? '(present)' : '(MISSING)')

  // 2. toggle maintenance ON
  const on = await req('POST', '/api/admin/maintenance', {
    cookie,
    body: { enabled: true },
  })
  console.log('TOGGLE ON status:', on.status, 'body:', on.body.slice(0, 200))

  // 3. public endpoint reflects it
  const pub = await req('GET', '/api/maintenance')
  console.log('PUBLIC status:', pub.status, 'body:', pub.body.slice(0, 200))

  // 4. toggle OFF
  const off = await req('POST', '/api/admin/maintenance', {
    cookie,
    body: { enabled: false },
  })
  console.log('TOGGLE OFF status:', off.status, 'body:', off.body.slice(0, 200))

  const pub2 = await req('GET', '/api/maintenance')
  console.log('PUBLIC after off:', pub2.body.slice(0, 200))
})().catch((e) => {
  console.error('TEST ERROR:', e.message)
  process.exit(1)
})
