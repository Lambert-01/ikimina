console.log('=== MINIMAL SERVER START ===');

const express = require('express');
const app = express();
const PORT = 5000;

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    success: true, 
    message: 'Minimal server is running',
    timestamp: new Date().toISOString()
  });
});

console.log('Creating server...');
const server = app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`✅ Test: http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

console.log('=== SERVER SETUP COMPLETE ===');