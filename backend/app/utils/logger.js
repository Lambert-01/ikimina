const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure format for all loggers
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create base logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'ikimina-backend' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ],
  exitOnError: false
});

// Add console transport in development mode
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create domain-specific loggers
const databaseLogger = logger.child({ domain: 'database' });
const authLogger = logger.child({ domain: 'auth' });
const paymentLogger = logger.child({ domain: 'payments' });
const apiLogger = logger.child({ domain: 'api' });
const devLogger = logger.child({ domain: 'development' });

// Add special file transport for payment logs
paymentLogger.add(new winston.transports.File({
  filename: path.join(logsDir, 'payments.log'),
  level: 'info',
  maxsize: 5242880, // 5MB
  maxFiles: 5,
}));

// Add special file transport for database logs
databaseLogger.add(new winston.transports.File({
  filename: path.join(logsDir, 'database.log'),
  level: 'info',
  maxsize: 5242880, // 5MB
  maxFiles: 5,
}));

// Export the loggers
module.exports = logger;
module.exports.db = databaseLogger;
module.exports.auth = authLogger;
module.exports.payments = paymentLogger;
module.exports.api = apiLogger;
module.exports.dev = devLogger; 