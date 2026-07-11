const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

app.get('/.well-known/jwks.json', (req, res) => {
  const key = crypto.createPublicKey(publicKey);
  const jwk = key.export({ format: 'jwk' });
  res.json({ keys: [{ kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', use: 'sig', kid: '1' }] });
});

app.get('/admin', (req, res) => {
  let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
  if (!token) {
    return res.status(401).send('Missing token. Get the public key at /.well-known/jwks.json');
  }
  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256', 'HS256'] });
    if (decoded.role === 'admin') {
      res.send(`<h1>Admin Panel</h1><p>Flag: ${FLAG}</p>`);
    } else {
      res.send(`<h1>Access Denied</h1><p>Your role: ${decoded.role}</p>`);
    }
  } catch (e) {
    res.status(401).send(`Token verification failed: ${e.message}`);
  }
});

app.listen(PORT, () => console.log(`cryptic-signature running on ${PORT}`));
