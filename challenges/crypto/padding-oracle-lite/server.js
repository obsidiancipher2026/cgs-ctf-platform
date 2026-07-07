const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const KEY = Buffer.from('5b3f7e5adfca6c29713e474659832351', 'hex');

app.post('/decrypt', (req, res) => {
  const { iv, ciphertext } = req.body;

  if (!iv || !ciphertext) {
    return res.status(400).json({ error: 'Missing iv or ciphertext' });
  }

  let ivBuf, ctBuf;
  try {
    ivBuf = Buffer.from(iv, 'hex');
    ctBuf = Buffer.from(ciphertext, 'hex');
  } catch {
    return res.status(400).json({ error: 'Invalid hex encoding' });
  }

  if (ivBuf.length !== 16 || ctBuf.length === 0 || ctBuf.length % 16 !== 0) {
    return res.status(400).json({ error: 'Invalid block size' });
  }

  const decipher = crypto.createDecipheriv('aes-128-cbc', KEY, ivBuf);
  try {
    decipher.update(ctBuf);
    decipher.final();
    res.json({ result: 'Padding valid' });
  } catch {
    res.status(400).json({ error: 'Invalid padding' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Padding oracle listening on port ' + PORT);
});
