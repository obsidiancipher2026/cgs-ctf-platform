const fs = require('fs');
const data = fs.readFileSync('rsa_params.txt', 'utf-8');
const nMatch = data.match(/n = (\d+)/);
const eMatch = data.match(/e = (\d+)/);
const ctMatch = data.match(/ciphertext = (\d+)/);
if (!nMatch || !eMatch || !ctMatch) { console.log('Parse error'); process.exit(1); }
const n = BigInt(nMatch[1]), e = BigInt(eMatch[1]), ct = BigInt(ctMatch[1]);

function isqrt(n) {
  if (n < 2n) return n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (y + n / y) / 2n; }
  return x;
}
function modPow(base, exp, mod) {
  let r = 1n; base = base % mod;
  while (exp > 0n) { if (exp % 2n === 1n) r = (r * base) % mod; base = (base * base) % mod; exp = exp / 2n; }
  return r;
}

// Fermat factorization
let a = isqrt(n);
if (a * a < n) a++;
let b2 = a * a - n;
let b = isqrt(b2);
while (b * b !== b2) { a++; b2 = a * a - n; b = isqrt(b2); }
const p = a - b, q = a + b;
console.log('p =', p.toString());
console.log('q =', q.toString());
console.log('p * q == n:', p * q === n);

const phi = (p - 1n) * (q - 1n);
function modInverse(a, m) {
  let [or, r] = [a, m], [os, s] = [1n, 0n];
  while (r !== 0n) { const q = or / r; [or, r] = [r, or - q * r]; [os, s] = [s, os - q * s]; }
  return ((os % m) + m) % m;
}
const d = modInverse(e, phi);
const pt = modPow(ct, d, n);
const hex = pt.toString(16);
const flag = Buffer.from(hex.length % 2 ? '0' + hex : hex, 'hex').toString('utf-8');
console.log('Flag:', flag);
console.log('PASS:', flag === 'CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}');
