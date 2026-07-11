const express = require('express');
const ejs = require('ejs');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.get('/', (req, res) => {
  res.send('<h1>Template Trouble</h1><form action="/greet" method="get"><input type="text" name="name" placeholder="Your name"><button type="submit">Greet</button></form>');
});

app.get('/greet', (req, res) => {
  const name = req.query.name || 'World';
  const template = '<h1>Hello, ' + name + '!</h1>';
  const html = ejs.render(template);
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Challenge 12 running on port ${PORT}`);
});
