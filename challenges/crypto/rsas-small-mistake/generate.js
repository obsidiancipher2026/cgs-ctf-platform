const crypto = require('crypto');

function modPow(base, exp, mod) {
  let r = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return r;
}

function modInv(a, m) {
  let [oldR, r] = [a, m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const quot = oldR / r;
    [oldR, r] = [r, oldR - quot * r];
    [oldS, s] = [s, oldS - quot * s];
  }
  return oldS < 0n ? oldS + m : oldS;
}

function randBigInt(bits) {
  const bytes = Math.ceil(bits / 8);
  const buf = crypto.randomBytes(bytes);
  let n = 0n;
  for (const b of buf) n = (n << 8n) + BigInt(b);
  n |= (1n << BigInt(bits - 1));
  n |= 1n;
  return n;
}

function millerRabin(n, k) {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;
  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) { d /= 2n; s++; }
  const nm1 = n - 1n;
  for (let i = 0; i < k; i++) {
    const a = 2n + BigInt(Math.floor(Math.random() * 10000));
    let x = modPow(a, d, n);
    if (x === 1n || x === nm1) continue;
    let cont = false;
    for (let r = 0n; r < s - 1n; r++) {
      x = modPow(x, 2n, n);
      if (x === nm1) { cont = true; break; }
    }
    if (cont) continue;
    return false;
  }
  return true;
}

function findPrime(bits) {
  const small = [];
  for (let i = 2; i < 10000; i++) {
    let sp = true;
    for (let j = 2; j * j <= i; j++) { if (i % j === 0) { sp = false; break; } }
    if (sp) small.push(BigInt(i));
  }
  for (let att = 0; att < 5000; att++) {
    let n = randBigInt(bits);
    n |= 1n;
    let ok = true;
    for (const sp of small) { if (n % sp === 0n) { ok = false; break; } }
    if (!ok) continue;
    if (millerRabin(n, 10)) return n;
  }
  return null;
}

const p = findPrime(152);
const q = findPrime(152);
const n = p * q;
const e = 65537n;
const phi = (p - 1n) * (q - 1n);
const d = modInv(e, phi);

const flag = 'CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}';
const flagInt = [...flag].reduce((acc, c) => acc * 256n + BigInt(c.charCodeAt(0)), 0n);
const c = modPow(flagInt, e, n);

const fs = require('fs');
fs.writeFileSync('rsa_params.txt', [
  'n = ' + n.toString(),
  'e = ' + e.toString(),
  'c = ' + c.toString(),
].join('\n') + '\n');

console.log('RSA params written to rsa_params.txt');
