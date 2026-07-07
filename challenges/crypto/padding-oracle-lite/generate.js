const crypto = require('crypto');
const fs = require('fs');

const key = crypto.randomBytes(16);
const iv = crypto.randomBytes(16);
const flag = 'CGS{th3_3rr0r_t0ld_0n_1ts3lf}';

const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
let encrypted = cipher.update(flag, 'utf8', 'hex');
encrypted += cipher.final('hex');

fs.writeFileSync('encrypted_flag.txt', [
  'IV: ' + iv.toString('hex'),
  'Ciphertext: ' + encrypted,
].join('\n') + '\n');

fs.writeFileSync('server_key.txt', 'Key: ' + key.toString('hex') + '\n');

console.log('Encrypted flag written to encrypted_flag.txt');
console.log('Server key written to server_key.txt (keep secret!)');
