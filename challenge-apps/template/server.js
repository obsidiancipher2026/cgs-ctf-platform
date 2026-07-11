const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

// Challenge-specific logic goes in each challenge's version
app.get('/', (req, res) => {
  res.send('CTF Challenge: override this template with actual challenge logic');
});

app.listen(PORT, () => {
  console.log(`Challenge running on port ${PORT}`);
});
