const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

// Ensure flag.txt exists
if (!fs.existsSync('./flag.txt')) {
    fs.writeFileSync('./flag.txt', FLAG + '\n');
}

// Ensure files directory exists with a dummy file
if (!fs.existsSync('./files')) {
    fs.mkdirSync('./files');
}
if (!fs.existsSync('./files/invoice_204.pdf')) {
    fs.writeFileSync('./files/invoice_204.pdf', 'This is a dummy invoice PDF content.');
}

app.get('/download', (req, res) => {
    const file = req.query.file;
    if (!file) {
        return res.status(400).send('Missing file parameter');
    }

    // Weak check: only blocks literal ".."
    if (file.includes('..')) {
        return res.status(403).send('Path traversal detected!');
    }

    // No normalization — URL-encoded %2e%2e/ bypasses the check
    const filePath = path.join('./files', file);

    // Ensure it's within files directory (but the weak check above is the vuln)
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve('./files'))) {
        return res.status(403).send('Access denied');
    }

    if (!fs.existsSync(resolved)) {
        return res.status(404).send('File not found');
    }

    res.sendFile(resolved);
});

app.listen(PORT, () => {
    console.log(`Path-less-traveled running on port ${PORT}`);
});
