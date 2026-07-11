const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());

// Misconfigured CORS: allows all origins with credentials
app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><title>CORS You Later</title></head>
<body>
    <h1>Account Portal</h1>
    <p>Visit <a href="/api/account">/api/account</a> to view your account details.</p>
</body>
</html>`);
});

app.get('/api/account', (req, res) => {
    // Weak auth: just checks if cookie session=valid
    const session = req.cookies.session;
    if (session !== 'valid') {
        return res.status(401).json({ error: 'Unauthorized. Set cookie: session=valid' });
    }

    res.json({
        username: 'admin',
        email: 'admin@ctf.local',
        role: 'administrator',
        flag: FLAG
    });
});

app.listen(PORT, () => {
    console.log(`CORS-you-later running on port ${PORT}`);
});
