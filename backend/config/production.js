/**
 * Production environment configuration
 */
module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: 'production'
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ikimina_prod',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'ikimina_production_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '30d'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  cookie: {
    httpOnly: true,
    secure: true, // Set to true in production
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  logging: {
    level: process.env.LOG_LEVEL || 'error',
    file: 'logs/production.log'
  },
  security: {
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true
    }
  }
}; 