const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(express.urlencoded({ extended: false }));

let redeemedCount = 0;
const usedCoupons = new Set();

app.get('/', (req, res) => {
  res.send(`
    <h1>Coupon Redemption</h1>
    <p>Redeemed: ${redeemedCount} times</p>
    <form method="POST" action="/redeem">
      <input type="text" name="code" placeholder="Enter coupon code">
      <button type="submit">Redeem</button>
    </form>
    <p>Try code: COUPON50</p>
    ${redeemedCount >= 20 ? '<h2 style="color:green">Bonus: ' + FLAG + '</h2>' : ''}
  `);
});

app.post('/redeem', (req, res) => {
  const code = req.body.code || '';
  if (code !== 'COUPON50') {
    return res.send('Invalid coupon code');
  }
  if (usedCoupons.has(code)) {
    return res.send('Coupon already redeemed');
  }
  setTimeout(() => {
    redeemedCount++;
    usedCoupons.add(code);
    if (redeemedCount >= 20) {
      console.log('Bonus unlocked! Flag: ' + FLAG);
    }
    res.redirect('/');
  }, 100);
});

app.listen(PORT, () => {
  console.log(`Challenge 14 running on port ${PORT}`);
});
