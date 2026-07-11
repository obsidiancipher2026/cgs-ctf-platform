const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

const backupPath = path.join(__dirname, 'backup.zip');
fs.writeFileSync(backupPath, `backup archive content\nflag: ${FLAG}\n`);

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Acme Corp</title></head>
<body>
  <h1>Acme Corporation</h1>
  <p>Leading provider of industrial solutions since 1987.</p>
  <p>Our team is dedicated to innovation and excellence.</p>
  <footer>our tools</footer>
</body>
</html>`);
});

app.get('/.git/config', (req, res) => {
  res.type('text/plain').send(`[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
[remote "origin"]
\turl = https://admin:${FLAG}@git.internal.acme.corp/secret-repo.git
\tfetch = +refs/heads/*:refs/remotes/origin/*
`);
});

app.get('/backup.zip', (req, res) => {
  res.download(backupPath);
});

app.get('/index.html.bak', (req, res) => {
  res.type('text/plain').send(FLAG);
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
