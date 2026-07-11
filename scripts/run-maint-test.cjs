const { spawn } = require('child_process')
const http = require('http')
const fs = require('fs')
const { URL } = require('url')

const LOG = 'C:\\Users\\CGS\\Documents\\cgs-ctf-platform\\scripts\\maint-result.txt'
function log(...a) {
  const line = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')
  fs.appendFileSync(LOG, line + '\n')
  log(line)
}

const BASE = 'http://localhost:3003'

function req(method, path, { cookie, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path)
    const data = body ? JSON.stringify(body) : null
    const headers = {}
    if (cookie) headers['Cookie'] = cookie
    if (data) headers['Content-Type'] = 'application/json'
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

function waitForServer(timeoutMs) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      const r = http.request({ hostname: 'localhost', port: 3003, path: '/api/maintenance', method: 'GET' }, (res) => {
        res.resume()
        resolve(true)
      })
      r.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error('server timeout'))
        else setTimeout(tick, 1500)
      })
      r.end()
    }
    tick()
  })
}

const server = spawn('node_modules\\.bin\\next.cmd', ['dev', '-p', '3003'], {
  cwd: 'C:\\Users\\CGS\\Documents\\cgs-ctf-platform',
  stdio: 'ignore',
  shell: true,
})

;(async () => {
  await waitForServer(120000)
  log('SERVER READY')

  const login = await req('POST', '/api/auth/login', { body: { username: 'admin', password: 'Admin123!' } })
  log('LOGIN:', login.status)
  const sc = login.setCookie || []
  const cookie = sc.map((c) => c.split(';')[0]).join('; ')
  log('COOKIE present:', !!cookie)

  const on = await req('POST', '/api/admin/maintenance', { cookie, body: { enabled: true } })
  log('TOGGLE ON:', on.status, on.body.slice(0, 150))

  const pub = await req('GET', '/api/maintenance')
  log('PUBLIC after ON:', pub.body.slice(0, 150))

  const off = await req('POST', '/api/admin/maintenance', { cookie, body: { enabled: false } })
  log('TOGGLE OFF:', off.status, off.body.slice(0, 150))

  const pub2 = await req('GET', '/api/maintenance')
  log('PUBLIC after OFF:', pub2.body.slice(0, 150))

  server.kill('SIGKILL')
  process.exit(0)
})().catch((e) => {
  console.error('TEST ERROR:', e.message)
  server.kill('SIGKILL')
  process.exit(1)
})
