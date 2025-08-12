console.log('Starting Ikimina Backend Server...');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${process.env.PORT}`);

// Initialize app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Basic routes
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    success: true,
    message: 'Ikimina Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/auth/login', (req, res) => {
  console.log('Login endpoint hit');
  res.json({
    success: false,
    message: 'Authentication service starting soon...'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);

const server = app.listen(PORT, () => {
  console.log(`✅ Ikimina Backend running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

console.log('Server setup completed - waiting for connections...');