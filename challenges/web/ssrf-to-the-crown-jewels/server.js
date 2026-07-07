const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3005;

app.get('/internal/flag', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) {
    return res.json({ flag: 'CGS{m3t4d4t4_s3rv1c3s_tru5t_t00_much}' });
  }
  return res.status(403).json({ error: 'Forbidden' });
});

app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Missing url parameter');
  }
  try {
    const response = await axios.get(url);
    return res.send(response.data);
  } catch (e) {
    return res.status(500).send('Error fetching URL');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
