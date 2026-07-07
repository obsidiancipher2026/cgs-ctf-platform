const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

const SECRET_KEY = 'super_secret_key_2026';
const FLAG = 'CGS{n0n3_alg_m34ns_n0_pr00f}';

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded;
    } catch (err) {
        try {
            const parts = token.split('.');
            const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
            if (header.alg === 'none') {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
                return payload;
            }
        } catch (e) {}
        return null;
    }
}

app.get('/', (req, res) => {
    const token = req.cookies && req.cookies.token;

    if (!token) {
        const guestToken = jwt.sign({ role: 'guest' }, SECRET_KEY);
        res.cookie('token', guestToken);
        return res.send('Guest area. Welcome, visitor!');
    }

    const decoded = verifyToken(token);

    if (decoded && decoded.role === 'admin') {
        return res.send(`Flag: ${FLAG}`);
    }

    return res.send('Guest area. You are a guest.');
});

app.listen(3000, () => console.log('Server running on port 3000'));
