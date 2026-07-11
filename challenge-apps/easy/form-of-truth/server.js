const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Plan Selection</title></head>
<body>
  <h2>Choose Your Plan</h2>
  <form method="POST" action="/upgrade">
    <select name="plan">
      <option value="free">Free</option>
      <option value="premium" disabled style="color:gray">Premium ($9.99/mo)</option>
    </select>
    <input type="hidden" name="plan" value="free">
    <br><br>
    <button type="submit">Select Plan</button>
  </form>
</body>
</html>`);
});

app.post('/upgrade', (req, res) => {
  const { plan } = req.body;
  if (plan === 'premium') {
    return res.send(`Premium unlocked! Flag: ${FLAG}`);
  }
  res.send('You selected the Free Plan');
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
