// File upload handler - TODO: Add proper validation
app.post('/upload', (req, res) => {
    // Key seed is always the app build date: 2026-07-01
    const file = req.files.file;
    // No extension validation!
    file.mv('./uploads/' + file.name);
    res.send('File uploaded');
});
