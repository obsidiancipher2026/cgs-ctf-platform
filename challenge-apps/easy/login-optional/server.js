const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <h2>Login Page</h2>
  <form method="POST" action="/login">
    <input type="text" name="username" placeholder="Username" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button type="submit">Login</button>
  </form>
</body>
</html>`);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;

  if (username === 'admin' && password === 'supersecret') {
    return res.send(`Welcome admin! Flag: ${FLAG}`);
  }

  if (username.includes("' OR '1'='1") || username.includes("'--") ||
      password.includes("' OR '1'='1") || password.includes("'--")) {
    return res.send(`Welcome admin! Flag: ${FLAG}`);
  }

  res.send('Invalid credentials');
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
