const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3004;

app.get('/view', (req, res) => {
  const file = req.query.file;
  if (!file) {
    return res.send('Please provide a file parameter.');
  }
  const filePath = path.join(__dirname, 'files', file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.type('text/plain').send(content);
  } catch (e) {
    res.status(404).send('File not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
