const fs = require('fs');
const flag = 'CGS{s1ngl3_byt3_x0r_1s_n0_l0ck}';
const key = 0x2A;

const hex = [...flag]
  .map(c => c.charCodeAt(0) ^ key)
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

fs.writeFileSync('xor_ciphertext.txt', hex + '\n');
console.log('Written to xor_ciphertext.txt');
