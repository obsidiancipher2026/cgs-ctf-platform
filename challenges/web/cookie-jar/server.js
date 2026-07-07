const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(c => {
      const parts = c.trim().split('=');
      cookies[parts[0]] = parts[1] || '';
    });
  }
  return cookies;
}

app.get('/', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const roleCookie = cookies.role;

  if (!roleCookie) {
    const guestCookie = Buffer.from('guest').toString('base64');
    res.set('Set-Cookie', `role=${guestCookie}; Path=/; HttpOnly`);
    return res.send('Guest area. Try logging in as admin.');
  }

  try {
    const decoded = Buffer.from(roleCookie, 'base64').toString('utf8');
    if (decoded === 'admin') {
      return res.send('CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}');
    }
  } catch (e) {}

  res.send('Guest area. Access denied.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
