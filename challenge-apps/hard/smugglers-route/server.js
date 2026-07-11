const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use((req, res, next) => {
  if (req.headers['transfer-encoding']) {
    return next();
  }
  delete req.headers['x-internal'];
  next();
});

app.get('/admin', (req, res) => {
  if (req.headers['x-internal'] === 'true') {
    res.send(`<h1>Admin Panel</h1><p>Flag: ${FLAG}</p>`);
  } else {
    res.status(403).send('<h1>Forbidden</h1><p>x-internal header required</p>');
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Smuggler\'s Route</h1><p>Public page. Try accessing /admin.</p>');
});

app.get('/about', (req, res) => {
  res.send('<h1>About</h1><p>This is a secure application protected by a reverse proxy.</p>');
});

app.listen(PORT, () => console.log(`smugglers-route running on port ${PORT}`));
