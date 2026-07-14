import { ChallengeDef, type PlaygroundRequest, type PlaygroundResponse, html, text, error } from '../types'
import crypto from 'crypto'

const FLAG_PADDING = 'CGS{th3_3rr0r_t0ld_0n_1ts3lf}'
const FLAG_BITFLIP = 'CGS{b1t_fl1pp1ng_cbc_1s_p0w3rful}'
const FLAG_TIMING = 'CGS{c0mp4r1s0n_t1m1ng_l34ks_byt3s}'
const FLAG_ORACLE_FULL = 'CGS{full_p4dd1ng_0r4cl3_r3c0v3rs_3v3ryth1ng}'

const KEY = Buffer.from('deadbeefcafebabe0123456789abcdef', 'hex')
const IV = Buffer.from('0123456789abcdef0123456789abcdef', 'hex')

function encrypt(plaintext: string): string {
  const padded = Buffer.from(plaintext, 'utf-8')
  const blockSize = 16
  const padLen = blockSize - (padded.length % blockSize)
  const paddedBuf = Buffer.concat([padded, Buffer.alloc(padLen, padLen)])
  const cipher = crypto.createCipheriv('aes-128-cbc', KEY, IV)
  cipher.setAutoPadding(false)
  return Buffer.concat([cipher.update(paddedBuf), cipher.final()]).toString('hex')
}

function decryptToHex(hexCiphertext: string): Buffer | null {
  try {
    const ct = Buffer.from(hexCiphertext, 'hex')
    if (ct.length === 0 || ct.length % 16 !== 0) return null
    const decipher = crypto.createDecipheriv('aes-128-cbc', KEY, IV)
    decipher.setAutoPadding(false)
    const decrypted = Buffer.concat([decipher.update(ct), decipher.final()])
    return decrypted
  } catch { return null }
}

function hasValidPKCS7Padding(buf: Buffer): boolean {
  if (buf.length === 0) return false
  const padLen = buf[buf.length - 1]
  if (padLen < 1 || padLen > 16) return false
  for (let i = buf.length - padLen; i < buf.length; i++) {
    if (buf[i] !== padLen) return false
  }
  return true
}

function stripPKCS7Padding(buf: Buffer): Buffer {
  const padLen = buf[buf.length - 1]
  return buf.subarray(0, buf.length - padLen)
}

const PADDING_CT = encrypt('The flag is: ' + FLAG_PADDING)

const paddingOracleLiteHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.method === 'POST' && req.path === '/check') {
    const hex = req.body?.trim() || ''
    const decrypted = decryptToHex(hex)
    if (!decrypted) return error(400, 'Invalid ciphertext (must be hex, length multiple of 16)')
    if (hasValidPKCS7Padding(decrypted)) return text('Valid padding')
    return text('Invalid padding')
  }
  if (req.method === 'POST' && req.path === '/decrypt') {
    const hex = req.body?.trim() || ''
    const decrypted = decryptToHex(hex)
    if (!decrypted) return error(400, 'Invalid ciphertext')
    if (!hasValidPKCS7Padding(decrypted)) return error(400, 'Invalid padding')
    const plain = stripPKCS7Padding(decrypted).toString('utf-8')
    if (plain.includes(FLAG_PADDING)) return text(plain, FLAG_PADDING)
    return text(plain)
  }
  return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Padding Oracle Lite</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d1117;color:#c9d1d9;font-family:'Courier New',monospace;padding:40px;max-width:800px;margin:0 auto}
h1{color:#58a6ff;margin-bottom:8px}.sub{color:#8b949e;margin-bottom:24px;font-size:14px}
.box{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:20px;margin-bottom:20px}
.box h3{color:#58a6ff;margin-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:1px}
pre{background:#0d1117;padding:12px;border-radius:6px;color:#7ee787;overflow-x:auto;font-size:13px;word-break:break-all}
label{display:block;color:#8b949e;font-size:12px;margin-bottom:4px}input{width:100%;padding:10px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;border-radius:6px;font-family:monospace;font-size:13px;margin-bottom:12px}
button{background:#238636;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;margin-right:8px}
button:hover{background:#2ea043}.resp{background:#0d1117;padding:12px;border-radius:6px;margin-top:12px;color:#ffa657;font-size:13px}
.info{color:#8b949e;font-size:12px;margin-top:12px}
</style></head><body>
<h1>Padding Oracle Lite</h1>
<p class="sub">AES-CBC decryption endpoint with padding validation feedback.</p>
<div class="box"><h3>Encrypted Flag</h3><pre id="enc-flag">${PADDING_CT}</pre></div>
<div class="box"><h3>Check Padding</h3>
<label for="hex-input">Ciphertext (hex):</label>
<input id="hex-input" placeholder="Enter hex ciphertext...">
<button onclick="checkPad()">Check Padding</button>
<button onclick="decryptMsg()">Decrypt</button>
<div class="resp" id="response">Response will appear here.</div></div>
<div class="box"><h3>How it works</h3>
<p style="color:#8b949e;font-size:13px">This server decrypts AES-CBC ciphertext and reveals whether the padding is valid.<br>
Modify the ciphertext and observe the responses. Use this oracle to recover the plaintext byte by byte.</p></div>
<script>
async function checkPad(){const h=document.getElementById('hex-input').value;const r=await fetch('/standalone/padding-oracle-lite/check',{method:'POST',body:h});document.getElementById('response').textContent=await r.text()}
async function decryptMsg(){const h=document.getElementById('hex-input').value;const r=await fetch('/standalone/padding-oracle-lite/decrypt',{method:'POST',body:h});document.getElementById('response').textContent=await r.text()}
</script></body></html>`)
}

const FLIP_KEY = Buffer.from('cafebabedeadbeef0123456789abcdef', 'hex')
const FLIP_IV = Buffer.from('fedcba9876543210fedcba9876543210', 'hex')

function encryptCookie(plaintext: string): string {
  const padded = Buffer.from(plaintext, 'utf-8')
  const blockSize = 16
  const padLen = blockSize - (padded.length % blockSize)
  const paddedBuf = Buffer.concat([padded, Buffer.alloc(padLen, padLen)])
  const cipher = crypto.createCipheriv('aes-128-cbc', FLIP_KEY, FLIP_IV)
  cipher.setAutoPadding(false)
  return Buffer.concat([cipher.update(paddedBuf), cipher.final()]).toString('base64')
}

function decryptCookie(b64Ciphertext: string): string | null {
  try {
    const ct = Buffer.from(b64Ciphertext, 'base64')
    if (ct.length === 0 || ct.length % 16 !== 0) return null
    const decipher = crypto.createDecipheriv('aes-128-cbc', FLIP_KEY, FLIP_IV)
    decipher.setAutoPadding(false)
    const decrypted = Buffer.concat([decipher.update(ct), decipher.final()])
    if (!hasValidPKCS7Padding(decrypted)) return null
    return stripPKCS7Padding(decrypted).toString('utf-8')
  } catch { return null }
}

const COOKIE_CT = encryptCookie('user=guest&admin=false')

const flipTheBitHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.method === 'POST' && req.path === '/submit') {
    const b64 = req.body?.trim() || ''
    const plain = decryptCookie(b64)
    if (!plain) return error(400, 'Invalid cookie or padding error')
    const params = Object.fromEntries(new URLSearchParams(plain))
    if (params.admin === 'true') return text('Access granted! ' + FLAG_BITFLIP, FLAG_BITFLIP)
    return text('Access denied. admin=' + (params.admin || 'missing'))
  }
  return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Flip the Bit</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d1117;color:#c9d1d9;font-family:'Courier New',monospace;padding:40px;max-width:800px;margin:0 auto}
h1{color:#58a6ff;margin-bottom:8px}.sub{color:#8b949e;margin-bottom:24px;font-size:14px}
.box{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:20px;margin-bottom:20px}
.box h3{color:#58a6ff;margin-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:1px}
pre{background:#0d1117;padding:12px;border-radius:6px;color:#7ee787;overflow-x:auto;font-size:13px;word-break:break-all}
label{display:block;color:#8b949e;font-size:12px;margin-bottom:4px}input{width:100%;padding:10px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;border-radius:6px;font-family:monospace;font-size:13px;margin-bottom:12px}
button{background:#238636;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px}
button:hover{background:#2ea043}.resp{background:#0d1117;padding:12px;border-radius:6px;margin-top:12px;color:#ffa657;font-size:13px}
</style></head><body>
<h1>Flip the Bit</h1>
<p class="sub">AES-CBC cookie-based authentication. Modify the cookie to become admin.</p>
<div class="box"><h3>Your Cookie (Base64)</h3><pre id="cookie">${COOKIE_CT}</pre></div>
<div class="box"><h3>Modify & Submit</h3>
<label for="cookie-input">Modified Cookie (Base64):</label>
<input id="cookie-input" placeholder="Paste modified cookie...">
<button onclick="submitCookie()">Submit</button>
<div class="resp" id="response">Response will appear here.</div></div>
<script>
async function submitCookie(){const c=document.getElementById('cookie-input').value;const r=await fetch('/standalone/flip-the-bit/submit',{method:'POST',body:c});document.getElementById('response').textContent=await r.text()}
</script></body></html>`)
}

const TIMING_PASSWORD = 'timing-secret-key-42'

const timingTellsHandler = async (req: PlaygroundRequest): Promise<PlaygroundResponse> => {
  if (req.method === 'POST' && req.path === '/login') {
    const body = req.body || ''
    const password = new URLSearchParams(body).get('password') || ''
    let match = true
    for (let i = 0; i < Math.min(password.length, TIMING_PASSWORD.length); i++) {
      if (password[i] !== TIMING_PASSWORD[i]) { match = false; break }
      await new Promise(r => setTimeout(r, 5))
    }
    if (password.length === TIMING_PASSWORD.length && match) {
      return text('Login successful! ' + FLAG_TIMING, FLAG_TIMING)
    }
    if (password.length !== TIMING_PASSWORD.length) {
      if (password.length < TIMING_PASSWORD.length) {
        if (password === TIMING_PASSWORD.substring(0, password.length)) {
          await new Promise(r => setTimeout(r, 5))
        }
      }
      return text('Login failed: incorrect password length or content')
    }
    if (!match) return text('Login failed: incorrect password')
    return text('Login successful! ' + FLAG_TIMING, FLAG_TIMING)
  }
  if (req.method === 'POST' && req.path === '/measure') {
    const body = req.body || ''
    const password = new URLSearchParams(body).get('password') || ''
    const start = Date.now()
    for (let i = 0; i < Math.min(password.length, TIMING_PASSWORD.length); i++) {
      if (password[i] !== TIMING_PASSWORD[i]) break
      await new Promise(r => setTimeout(r, 5))
    }
    const elapsed = Date.now() - start
    return text(String(elapsed))
  }
  return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Timing Tells</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d1117;color:#c9d1d9;font-family:'Courier New',monospace;padding:40px;max-width:600px;margin:0 auto}
h1{color:#58a6ff;margin-bottom:8px}.sub{color:#8b949e;margin-bottom:24px;font-size:14px}
.box{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:20px;margin-bottom:20px}
.box h3{color:#58a6ff;margin-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:1px}
label{display:block;color:#8b949e;font-size:12px;margin-bottom:4px}input{width:100%;padding:10px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;border-radius:6px;font-family:monospace;font-size:13px;margin-bottom:12px;outline:none}
input:focus{border-color:#58a6ff}button{background:#238636;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;margin-right:8px}
button:hover{background:#2ea043}button.measure{background:#1f6feb}.resp{background:#0d1117;padding:12px;border-radius:6px;margin-top:12px;color:#ffa657;font-size:13px}
</style></head><body>
<h1>Timing Tells</h1>
<p class="sub">Password login with byte-by-byte comparison timing leak.</p>
<div class="box"><h3>Login</h3>
<label for="pwd-input">Password:</label>
<input id="pwd-input" type="password" placeholder="Enter password...">
<button onclick="login()">Login</button>
<button class="measure" onclick="measure()">Measure Timing</button>
<div class="resp" id="response">Response will appear here.</div></div>
<script>
async function login(){const p=document.getElementById('pwd-input').value;const r=await fetch('/standalone/timing-tells/login',{method:'POST',body:'password='+encodeURIComponent(p)});document.getElementById('response').textContent=await r.text()}
async function measure(){const p=document.getElementById('pwd-input').value;const r=await fetch('/standalone/timing-tells/measure',{method:'POST',body:'password='+encodeURIComponent(p)});document.getElementById('response').textContent='Timing: '+await r.text()+'ms'}
</script></body></html>`)
}

const ORACLE_FULL_KEY = Buffer.from('0123456789abcdefdeadbeefcafebabe', 'hex')
const ORACLE_FULL_IV = Buffer.from('abcdef0123456789abcdef0123456789', 'hex')

function oracleEncrypt(plaintext: string): string {
  const padded = Buffer.from(plaintext, 'utf-8')
  const blockSize = 16
  const padLen = blockSize - (padded.length % blockSize)
  const paddedBuf = Buffer.concat([padded, Buffer.alloc(padLen, padLen)])
  const cipher = crypto.createCipheriv('aes-128-cbc', ORACLE_FULL_KEY, ORACLE_FULL_IV)
  cipher.setAutoPadding(false)
  return Buffer.concat([cipher.update(paddedBuf), cipher.final()]).toString('hex')
}

function oracleDecrypt(hexCiphertext: string): Buffer | null {
  try {
    const ct = Buffer.from(hexCiphertext, 'hex')
    if (ct.length === 0 || ct.length % 16 !== 0) return null
    const decipher = crypto.createDecipheriv('aes-128-cbc', ORACLE_FULL_KEY, ORACLE_FULL_IV)
    decipher.setAutoPadding(false)
    return Buffer.concat([decipher.update(ct), decipher.final()])
  } catch { return null }
}

const ORACLE_CT = oracleEncrypt('The secret flag is: ' + FLAG_ORACLE_FULL)

const oracleFullSessionHandler = (req: PlaygroundRequest): PlaygroundResponse => {
  if (req.method === 'POST' && req.path === '/check') {
    const hex = req.body?.trim() || ''
    const decrypted = oracleDecrypt(hex)
    if (!decrypted) return error(400, 'Invalid')
    if (hasValidPKCS7Padding(decrypted)) return text('Valid')
    return text('Invalid')
  }
  if (req.method === 'POST' && req.path === '/decrypt') {
    const hex = req.body?.trim() || ''
    const decrypted = oracleDecrypt(hex)
    if (!decrypted) return error(400, 'Invalid ciphertext')
    if (!hasValidPKCS7Padding(decrypted)) return error(400, 'Invalid padding')
    const plain = stripPKCS7Padding(decrypted).toString('utf-8')
    if (plain.includes(FLAG_ORACLE_FULL)) return text(plain, FLAG_ORACLE_FULL)
    return text(plain)
  }
  return html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Oracle Full Session</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d1117;color:#c9d1d9;font-family:'Courier New',monospace;padding:40px;max-width:800px;margin:0 auto}
h1{color:#58a6ff;margin-bottom:8px}.sub{color:#8b949e;margin-bottom:24px;font-size:14px}
.box{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:20px;margin-bottom:20px}
.box h3{color:#58a6ff;margin-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:1px}
pre{background:#0d1117;padding:12px;border-radius:6px;color:#7ee787;overflow-x:auto;font-size:13px;word-break:break-all}
label{display:block;color:#8b949e;font-size:12px;margin-bottom:4px}input{width:100%;padding:10px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;border-radius:6px;font-family:monospace;font-size:13px;margin-bottom:12px;outline:none}
input:focus{border-color:#58a6ff}button{background:#238636;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;margin-right:8px}
button:hover{background:#2ea043}.resp{background:#0d1117;padding:12px;border-radius:6px;margin-top:12px;color:#ffa657;font-size:13px}
</style></head><body>
<h1>Oracle Full Session</h1>
<p class="sub">AES-CBC padding oracle — recover the complete flag across all blocks.</p>
<div class="box"><h3>Encrypted Message</h3><pre id="enc-msg">${ORACLE_CT}</pre></div>
<div class="box"><h3>Padding Oracle</h3>
<label for="hex-input">Ciphertext (hex):</label>
<input id="hex-input" placeholder="Enter hex ciphertext...">
<button onclick="checkPad()">Check Padding</button>
<button onclick="decryptMsg()">Decrypt</button>
<div class="resp" id="response">Response will appear here.</div></div>
<script>
async function checkPad(){const h=document.getElementById('hex-input').value;const r=await fetch('/standalone/oracle-full-session/check',{method:'POST',body:h});document.getElementById('response').textContent=await r.text()}
async function decryptMsg(){const h=document.getElementById('hex-input').value;const r=await fetch('/standalone/oracle-full-session/decrypt',{method:'POST',body:h});document.getElementById('response').textContent=await r.text()}
</script></body></html>`)
}

export const cryptoChallenges: ChallengeDef[] = [
  {
    slug: 'padding-oracle-lite',
    title: 'Padding Oracle Lite',
    handler: paddingOracleLiteHandler,
  },
  {
    slug: 'flip-the-bit',
    title: 'Flip the Bit',
    handler: flipTheBitHandler,
  },
  {
    slug: 'timing-tells',
    title: 'Timing Tells',
    handler: timingTellsHandler,
  },
  {
    slug: 'oracle-full-session',
    title: 'Oracle Full Session',
    handler: oracleFullSessionHandler,
  },
]
