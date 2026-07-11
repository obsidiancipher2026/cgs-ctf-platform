const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.get('/internal/meta', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    res.json({ credentials: FLAG, region: 'us-east-1', instance: 'i-0abcd1234' });
  } else {
    res.status(403).json({ error: 'Forbidden: internal endpoint' });
  }
});

app.get('/fetch', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url query parameter');
  try {
    const response = await axios.get(url, { timeout: 5000 });
    res.send(response.data);
  } catch (err) {
    res.status(500).send('Fetch error: ' + err.message);
  }
});

app.get('/', (req, res) => {
  res.send('<h1>SSRF to the Cloud</h1><p>Use /fetch?url=... to fetch remote URLs.</p>');
});

app.listen(PORT, () => console.log(`ssrf-to-the-cloud running on port ${PORT}`));
