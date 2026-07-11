const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(express.json());

function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const defaultConfig = { theme: 'dark', lang: 'en' };

app.post('/merge', (req, res) => {
  const config = Object.assign({}, defaultConfig);
  merge(config, req.body);

  if (config.showFlag) {
    return res.json({ status: 'ok', config, flag: FLAG });
  }

  res.json({ status: 'ok', config });
});

app.get('/', (req, res) => {
  res.send('<h1>Prototype Chaos</h1><p>POST JSON to /merge to update configuration.</p>');
});

app.listen(PORT, () => console.log(`prototype-chaos running on port ${PORT}`));
