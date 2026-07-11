const express = require('express');
const app = express();

const FLAG = process.env.FLAG || 'CGS{test-flag}';
const PORT = process.env.PORT || 3000;

const users = {
  1: { name: 'Admin', role: 'administrator', bio: `System administrator and founder. Secret: ${FLAG}` },
  1043: { name: 'You', role: 'user', bio: 'CTF participant. Welcome! You are on the right track.' },
  1044: { name: 'Alice', role: 'user', bio: 'Development team lead. Working on backend services.' },
  1045: { name: 'Bob', role: 'user', bio: 'DevOps engineer. Managing infrastructure and deployments.' },
  1046: { name: 'Charlie', role: 'user', bio: 'Frontend developer. Crafting user experiences.' }
};

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CloudPort - Profile Portal</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; color: #333; }
header { background: linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b); color: white; padding: 2rem 0; text-align: center; }
header h1 { font-size: 2.2rem; }
nav { background: #3a1c71; padding: 0.8rem; text-align: center; }
nav a { color: white; text-decoration: none; margin: 0 1.5rem; font-weight: 500; }
.container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
</style>
</head>
<body>
<header>
<h1>CloudPort</h1>
<p>User Profile Portal</p>
</header>
<nav>
<a href="/">Home</a>
<a href="/profile?user_id=1043">My Profile</a>
</nav>
<div class="container">
<h2>Welcome to CloudPort</h2>
<p style="margin-top: 1rem; line-height: 1.6;">CloudPort is an internal user management system. View your profile and update your settings.</p>
<p style="margin-top: 1rem;">Use the "My Profile" link above or navigate to <code>/profile?user_id=1043</code>.</p>
</div>
</body>
</html>`);
});

app.get('/profile', (req, res) => {
  const userId = parseInt(req.query.user_id, 10);
  const user = users[userId];

  if (!user) {
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Not Found</title>
<style>body{font-family:sans-serif;text-align:center;padding:4rem;}h1{color:#e74c3c;}</style>
</head>
<body><h1>404</h1><p>User not found.</p></body>
</html>`);
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${user.name} - Profile</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; color: #333; }
header { background: linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b); color: white; padding: 2rem 0; text-align: center; }
header h1 { font-size: 2.2rem; }
nav { background: #3a1c71; padding: 0.8rem; text-align: center; }
nav a { color: white; text-decoration: none; margin: 0 1.5rem; font-weight: 500; }
.container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
.profile-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 2rem 0; display: flex; gap: 2rem; align-items: flex-start; }
.avatar { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #3a1c71, #d76d77); display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: bold; flex-shrink: 0; }
.info { flex: 1; }
.info h2 { margin-bottom: 0.5rem; }
.info .label { color: #666; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 1rem; }
.info .value { margin-top: 0.2rem; line-height: 1.5; }
.role-tag { display: inline-block; background: #3a1c71; color: white; padding: 0.2rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
footer { text-align: center; padding: 2rem; color: #666; font-size: 0.9rem; }
</style>
</head>
<body>
<header>
<h1>CloudPort</h1>
<p>User Profile Portal</p>
</header>
<nav>
<a href="/">Home</a>
<a href="/profile?user_id=1043">My Profile</a>
</nav>
<div class="container">
<div class="profile-card">
<div class="avatar">${user.name[0]}</div>
<div class="info">
<h2>${user.name}</h2>
<span class="role-tag">${user.role}</span>
<div class="label">User ID</div>
<div class="value">${userId}</div>
<div class="label">Bio</div>
<div class="value">${user.bio}</div>
</div>
</div>
</div>
<footer>&copy; 2026 CloudPort. Internal use only.</footer>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
