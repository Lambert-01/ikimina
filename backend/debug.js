const fs = require('fs');

// Write to a file instead of console
fs.writeFileSync('debug.txt', 'Debug script started at: ' + new Date().toISOString() + '\n');

try {
  fs.appendFileSync('debug.txt', 'Loading express...\n');
  const express = require('express');
  fs.appendFileSync('debug.txt', 'Express loaded successfully\n');
  
  fs.appendFileSync('debug.txt', 'Creating app...\n');
  const app = express();
  fs.appendFileSync('debug.txt', 'App created successfully\n');
  
  app.get('/health', (req, res) => {
    fs.appendFileSync('debug.txt', 'Health endpoint hit\n');
    res.json({ success: true, message: 'Working!' });
  });
  
  fs.appendFileSync('debug.txt', 'Starting server on port 5000...\n');
  const server = app.listen(5000, () => {
    fs.appendFileSync('debug.txt', 'Server started successfully on port 5000\n');
  });
  
  server.on('error', (err) => {
    fs.appendFileSync('debug.txt', 'Server error: ' + err.message + '\n');
  });
  
  // Keep the process alive
  setTimeout(() => {
    fs.appendFileSync('debug.txt', 'Server still running after 5 seconds\n');
  }, 5000);
  
} catch (error) {
  fs.appendFileSync('debug.txt', 'Error: ' + error.message + '\n');
}

fs.appendFileSync('debug.txt', 'Script completed\n');