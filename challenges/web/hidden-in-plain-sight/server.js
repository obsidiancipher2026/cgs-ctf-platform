const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.set('X-CGS-Flag', 'CGS{h34d3rs_h1d3_th1ngs_t00}');
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
