console.log('🚀 Starting Ikimina Backend Server...');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: './.env' });

console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${process.env.PORT}`);
console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);

// Initialize app
const app = express();

// Basic middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

console.log('✅ Middleware configured');

// Basic routes
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    success: true,
    message: 'Ikimina Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Authentication endpoints
app.post('/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  
  try {
    const { phoneNumber, password } = req.body;
    
    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and password'
      });
    }
    
    // For now, return a mock successful response
    // Later we'll connect to real database
    if (phoneNumber === '+250790311401' && password === 'password123') {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock_jwt_token_123',
          user: {
            id: 'user_123',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: phoneNumber,
            email: 'test@example.com',
            roles: ['member'],
            primaryRole: 'member',
            memberOfGroups: [],
            managerOfGroups: []
          }
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

app.post('/auth/register', async (req, res) => {
  console.log('Registration attempt:', req.body);
  
  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;
    
    if (!firstName || !lastName || !phoneNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Mock successful registration
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token: 'mock_jwt_token_123',
        user: {
          id: 'new_user_123',
          firstName,
          lastName,
          phoneNumber,
          email,
          roles: ['member'],
          primaryRole: 'member',
          memberOfGroups: [],
          managerOfGroups: []
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// Admin authentication endpoints
app.post('/admin/auth/login', async (req, res) => {
  console.log('Admin login attempt:', req.body);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Mock admin login
    if (email === 'superadmin@ikimina.com' && password === 'SuperAdmin123!') {
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          token: 'mock_admin_token_123',
          admin: {
            id: 'admin_123',
            firstName: 'Super',
            lastName: 'Admin',
            email: email,
            role: 'super_admin',
            permissions: ['manage_users', 'approve_groups', 'view_system_logs']
          }
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed. Please try again.'
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);

const server = app.listen(PORT, () => {
  console.log(`✅ Ikimina Backend running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log(`✅ Ready to accept login requests!`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close other applications using this port.`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

console.log('✅ Server setup completed - waiting for connections...');