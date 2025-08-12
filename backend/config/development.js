/**
 * Development environment configuration
 */
module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: 'development'
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ikimina',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'ikimina_dev_secret_key_123',
    expiresIn: process.env.JWT_EXPIRE || '30d'
  },
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173'
    ],
    credentials: true
  },
  cookie: {
    httpOnly: true,
    secure: false, // Set to false in development
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: 'logs/development.log'
  },
  security: {
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // More relaxed for development
    },
    passwordPolicy: {
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSymbols: false
    }
  }
};