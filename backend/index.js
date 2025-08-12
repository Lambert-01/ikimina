const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');

// Load environment variables
dotenv.config({ path: './.env' });

// Don't force NODE_ENV - use what's in .env file
console.log('='.repeat(50).cyan);
console.log('🚀 IKIMINA BACKEND SERVER STARTING'.cyan.bold);
console.log('='.repeat(50).cyan);
console.log(`📍 Working Directory: ${process.cwd()}`.blue);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`.yellow.bold);
console.log(`🔌 Port: ${process.env.PORT || 5000}`.green);
console.log(`🗄️  MongoDB URI: ${process.env.MONGODB_URI}`.magenta);
console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '[SET]' : '[NOT SET]'}`.cyan);
console.log('='.repeat(50).cyan);

// Import route files
const authRoutes = require('./app/routes/authRoutes');
const groupRoutes = require('./app/routes/groupRoutes');
const memberRoutes = require('./app/routes/memberRoutes');
const loanRoutes = require('./app/routes/loanRoutes');
const meetingRoutes = require('./app/routes/meetingRoutes');
const notificationRoutes = require('./app/routes/notificationRoutes');
const paymentRoutes = require('./app/routes/paymentRoutes');

// Admin routes
const adminAuthRoutes = require('./app/routes/adminAuthRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const adminDashboardRoutes = require('./app/routes/adminDashboardRoutes');
const adminGroupRoutes = require('./app/routes/adminGroupRoutes');

// Initialize app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all requests
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// CORS configuration - more permissive for development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:5173']
    : [
        'http://localhost:5173',
        'http://localhost:4173', 
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173'
      ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Log CORS configuration
console.log(`CORS enabled for origins: ${JSON.stringify(corsOptions.origin)}`.cyan);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// Connect to MongoDB with better error handling
console.log('🔄 Attempting to connect to MongoDB...'.yellow);

connectDB().then(async () => {
  console.log('✅ MongoDB connected successfully!'.green.bold);
  
  // Initialize database after successful connection
  console.log('🔄 Initializing database...'.yellow);
  try {
    const { initializeDatabase } = require('./initializeDatabase');
    await initializeDatabase();
    console.log('✅ Database initialization completed!'.green.bold);
  } catch (error) {
    console.log('⚠️  Database initialization failed, continuing anyway...'.yellow);
    console.log('Error details:', error.message);
  }
}).catch(err => {
  console.error('❌ Failed to connect to database:', err.message.red);
  console.log('⚠️  Starting server without database connection for debugging...'.yellow);
  
  // Continue without database for debugging
  console.log('📝 You can still test API endpoints, but database operations will fail'.yellow);
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/groups', groupRoutes); // Also keep non-api route for backward compatibility
app.use('/members', memberRoutes);
app.use('/loans', loanRoutes);
app.use('/api/loans', loanRoutes);
app.use('/meetings', meetingRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);

// Mount admin routes
app.use('/admin/auth', adminAuthRoutes);
app.use('/admin/dashboard', adminDashboardRoutes);
app.use('/admin/groups', adminGroupRoutes);
app.use('/admin', adminRoutes);

// Also mount group routes under /api for compatibility
app.use('/api/groups', adminGroupRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is up and running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/web-client-vite/dist')));

  // Serve the index.html file for any route not handled by the API
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
      res.sendFile(path.resolve(__dirname, '../frontend/web-client-vite/dist', 'index.html'));
    }
  });
}

// Handle undefined routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';
  
  // Log detailed errors in development, sanitize in production
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  };
  
  res.status(statusCode).json(errorResponse);
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`🚀 Starting HTTP server on port ${PORT}...`.cyan);

const server = app.listen(PORT, () => {
  console.log('='.repeat(60).green);
  console.log('🎉 IKIMINA BACKEND SERVER IS RUNNING!'.green.bold);
  console.log('='.repeat(60).green);
  console.log(`🌐 Server URL: http://localhost:${PORT}`.cyan.bold);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`.green);
  console.log(`🔐 Auth Login: http://localhost:${PORT}/auth/login`.blue);
  console.log(`👑 Admin Login: http://localhost:${PORT}/admin/auth/login`.magenta);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`.gray);
  console.log('='.repeat(60).green);
  console.log('✅ Ready to accept requests!'.green.bold);
  console.log('🛑 Press Ctrl+C to stop the server'.red);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:'.red.bold);
  console.error(`Error: ${err.message}`.red);
  console.error('Stack:', err.stack);
  
  // In development, don't exit - just log the error
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Continuing in development mode...'.yellow);
  } else {
    // Close server & exit process in production
    console.log('🛑 Shutting down server due to unhandled rejection...'.red);
    server.close(() => process.exit(1));
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:'.red.bold);
  console.error(`Error: ${err.message}`.red);
  console.error('Stack:', err.stack);
  
  // In development, don't exit - just log the error
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Continuing in development mode...'.yellow);
  } else {
    // Close server & exit process in production
    console.log('🛑 Shutting down server due to uncaught exception...'.red);
    server.close(() => process.exit(1));
  }
});

module.exports = { app, server }; 