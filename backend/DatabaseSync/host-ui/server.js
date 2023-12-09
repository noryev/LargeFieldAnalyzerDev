const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3022;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint to get log data
app.get('/get-log', (req, res) => {
    fs.readFile('script_scheduler.log', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.status(500).send('Error reading log file');
        }
        res.send(data);
    });
});

// Endpoint to check if auto.py is running
app.get('/get-status', (req, res) => {
    exec('pgrep -f auto.py', (err, stdout, stderr) => {
        if (err || stderr) {
            console.error('Error checking auto.py status:', err, stderr);
            return res.json({ running: false });
        }
        res.json({ running: true });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
