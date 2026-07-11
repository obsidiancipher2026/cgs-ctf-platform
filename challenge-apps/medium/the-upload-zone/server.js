const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><title>The Upload Zone</title></head>
<body>
    <h1>The Upload Zone</h1>
    <p>Upload your images (JPG/PNG only):</p>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" accept=".jpg,.png" required>
        <button type="submit">Upload</button>
    </form>
</body>
</html>`);
});

app.post('/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(500).send('Upload error: ' + err.message);
        }
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const filename = req.file.originalname;
        const ext = path.extname(filename).toLowerCase();

        // Weak check: only verifies extension ends with .jpg or .png
        // Bypassable with double extension like shell.jpg.js
        if (!filename.endsWith('.jpg') && !filename.endsWith('.png')) {
            // Clean up the invalid file
            fs.unlinkSync(req.file.path);
            return res.status(400).send('Only JPG and PNG files are allowed');
        }

        // Simulate RCE: if the uploaded file contains .js in its name,
        // serve it with text/javascript content-type and reveal the flag
        if (filename.includes('.js')) {
            const fileContent = fs.readFileSync(req.file.path, 'utf-8') ||
                '// Uploaded file content\n';
            const jsContent = `// Flag: ${FLAG}\n// The server executed your JavaScript file!\n${fileContent}`;
            fs.writeFileSync(req.file.path, jsContent);
        }

        res.send(`<!DOCTYPE html>
<html>
<head><title>Upload Success</title></head>
<body>
    <h1>Upload Successful</h1>
    <p>File: <a href="/uploads/${filename}">${filename}</a></p>
</body>
</html>`);
    });
});

app.listen(PORT, () => {
    console.log(`The-upload-zone running on port ${PORT}`);
});
