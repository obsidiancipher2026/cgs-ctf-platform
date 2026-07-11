const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('<h1>User Lookup</h1><form action="/check" method="get"><input type="text" name="username" placeholder="Enter username"><button type="submit">Check</button></form>');
});

app.get('/check', (req, res) => {
  const input = req.query.username || '';
  const match = input.match(/SUBSTRING\(password,(\d+),1\)='(.)'/i);
  if (match) {
    const pos = parseInt(match[1], 10);
    const char = match[2];
    if (pos >= 1 && pos <= FLAG.length && FLAG[pos - 1] === char) {
      return res.send('Found');
    }
    return res.send('Not found');
  }
  const matchIn = input.match(/admin'/i);
  if (matchIn) {
    return res.send('Found');
  }
  if (input.toLowerCase().includes("' or '1'='1")) {
    return res.send('Found');
  }
  if (input.toLowerCase().includes("' or 1=1")) {
    return res.send('Found');
  }
  return res.send('Not found');
});

app.listen(PORT, () => {
  console.log(`Challenge 11 running on port ${PORT}`);
});
