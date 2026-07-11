const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<body>
  <h1>Welcome</h1>
  <p><a href="/redirect?next=https://example.com">Go to Example</a></p>
</body>
</html>`);
});

app.get('/redirect', (req, res) => {
  const next = req.query.next || '/';
  res.redirect(302, next);
});

app.get('/internal-only', (req, res) => {
  if (req.headers['x-internal'] === 'true' ||
      (req.headers['referer'] && req.headers['referer'].includes('/redirect'))) {
    return res.send(`Flag: ${FLAG}`);
  }
  res.send('Internal endpoint - this page is only accessible internally');
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
