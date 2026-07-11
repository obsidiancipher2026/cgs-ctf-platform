const express = require('express');
const cookieParser = require('cookie-parser');
const { unserialize } = require('node-serialize');

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());

const defaultPrefs = JSON.stringify({ theme: 'dark', language: 'en' });

app.get('/', (req, res) => {
    let prefsCookie = req.cookies.prefs;

    if (!prefsCookie) {
        res.cookie('prefs', defaultPrefs, { httpOnly: false });
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Preferences</title></head>
            <body>
                <h1>User Preferences</h1>
                <p>No preferences set. A default cookie has been issued.</p>
                <pre>${defaultPrefs}</pre>
            </body>
            </html>
        `);
    }

    try {
        // VULN: unserialize() is used on attacker-controlled cookie data
        const prefs = unserialize(prefsCookie);

        if (prefs && prefs.flag) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head><title>Flag</title></head>
                <body>
                    <h1>Flag Revealed</h1>
                    <p>Congratulations! The flag is: ${FLAG}</p>
                </body>
                </html>
            `);
        }

        const theme = prefs.theme || 'unknown';
        const language = prefs.language || 'unknown';
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Preferences</title></head>
            <body>
                <h1>User Preferences</h1>
                <p>Theme: ${theme}</p>
                <p>Language: ${language}</p>
                <pre>${JSON.stringify(prefs, null, 2)}</pre>
            </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send('Error processing preferences: ' + e.message);
    }
});

app.listen(PORT, () => {
    console.log(`Deserialize-this running on port ${PORT}`);
});
