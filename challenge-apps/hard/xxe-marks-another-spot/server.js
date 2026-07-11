const express = require('express');
const xml2js = require('xml2js');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(express.text({ type: 'application/xml' }));

app.post('/upload', (req, res) => {
  const xml = req.body;
  if (!xml) return res.status(400).send('Missing XML body');

  const parser = new xml2js.Parser({
    explicitCharkey: false,
    normalize: false,
    xmlns: false,
    sax: true,
  });

  parser.parseString(xml, (err, result) => {
    if (err) return res.status(400).send('XML parse error: ' + err.message);

    let message = 'XML processed successfully';
    if (result && result.root && result.root.flag) {
      const flagVal = Array.isArray(result.root.flag) ? result.root.flag[0] : result.root.flag;
      if (flagVal && flagVal !== 'undefined') {
        message += '<br>Flag: ' + flagVal;
      }
    }

    res.send('<h1>XXE Marks Another Spot</h1><p>' + message + '</p>');
  });
});

app.get('/', (req, res) => {
  res.send('<h1>XXE Marks Another Spot</h1><p>POST XML to /upload with Content-Type: application/xml</p>');
});

app.listen(PORT, () => console.log(`xxe-marks-another-spot running on port ${PORT}`));
