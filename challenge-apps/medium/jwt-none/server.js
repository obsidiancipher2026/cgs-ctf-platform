const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());

function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    if (header.alg === 'none') {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      return payload;
    }
    if (header.alg === 'HS256') {
      const payload = jwt.verify(token, 'secret');
      return payload;
    }
    return jwt.verify(token, 'secret');
  } catch {
    return null;
  }
}

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return req.cookies.token;
}

app.get('/', (req, res) => {
  const token = getToken(req);
  let role = 'guest';
  if (token) {
    const payload = decodeToken(token);
    if (payload && payload.role) {
      role = payload.role;
    }
  }
  res.send(`<h1>JWT None</h1><p>Your role: ${role}</p><p>Try accessing /admin as admin</p>`);
});

app.get('/admin', (req, res) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).send('No token provided');
  }
  const payload = decodeToken(token);
  if (!payload) {
    return res.status(401).send('Invalid token');
  }
  if (payload.role === 'admin') {
    return res.send(`<h1>Admin Panel</h1><p>Flag: ${FLAG}</p>`);
  }
  res.status(403).send('Access denied. Admin only.');
});

app.listen(PORT, () => {
  console.log(`Challenge 15 running on port ${PORT}`);
});
