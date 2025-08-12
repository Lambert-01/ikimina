// Simple test server to debug the issue
console.log('Starting test server...');

const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
console.log('Loading .env file...');
dotenv.config({ path: './.env' });

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Initialize app
console.log('Creating Express app...');
const app = express();

// Simple route
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port ${PORT}...`);

try {
  const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
}