const mongoose = require('mongoose');
const winston = require('winston');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Load environment-specific configuration
    const env = process.env.NODE_ENV || 'development';
    let config;
    
    console.log(`Loading database configuration for ${env} environment...`.blue);
    
    try {
      config = require(`./${env}`);
      console.log(`Loaded ${env} configuration successfully`.green);
    } catch (err) {
      console.log(`No specific config found for ${env}, using default settings`.yellow);
      config = {
        database: {
          uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ikimina',
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
          }
        }
      };
    }
    
    console.log(`Attempting to connect to MongoDB at: ${config.database.uri}`.cyan);
    
    // Connect with environment-specific options
    const conn = await mongoose.connect(config.database.uri, config.database.options);

    console.log(`MongoDB Connected: ${conn.connection.host} (${env} mode)`.cyan.underline.bold);
    
    // Create indexes if not in test environment
    if (env !== 'test') {
      await createIndexes();
    }
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Create indexes for better performance on frequently queried collections
const createIndexes = async () => {
  try {
    const db = mongoose.connection;
    
    try {
      // User indexes
      await db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true, name: "user_email_unique" },
        { key: { phoneNumber: 1 }, unique: true, name: "user_phone_unique" },
        { key: { nationalId: 1 }, sparse: true, name: "user_nationalId_sparse" }
      ]);
      
      // Group indexes
      await db.collection('groups').createIndexes([
        { key: { name: 1 }, name: "group_name_index" },
        { key: { 'members.userId': 1 }, name: "group_members_userId_index" },
        { key: { 'members.role': 1 }, name: "group_members_role_index" },
        { key: { createdAt: -1 }, name: "group_createdAt_index" }
      ]);
      
      // Transaction indexes for fast lookups and reports
      await db.collection('transactions').createIndexes([
        { key: { userId: 1, createdAt: -1 }, name: "tx_userId_createdAt_index" },
        { key: { groupId: 1, type: 1, createdAt: -1 }, name: "tx_groupId_type_createdAt_index" },
        { key: { status: 1 }, name: "tx_status_index" },
        { key: { paymentProvider: 1, providerTransactionId: 1 }, sparse: true, name: "tx_provider_txId_index" }
      ]);
      
      // Loan indexes
      await db.collection('loans').createIndexes([
        { key: { borrowerId: 1 }, name: "loan_borrowerId_index" },
        { key: { groupId: 1 }, name: "loan_groupId_index" },
        { key: { status: 1 }, name: "loan_status_index" },
        { key: { dueDate: 1 }, name: "loan_dueDate_index" },
        { key: { createdAt: -1 }, name: "loan_createdAt_index" },
        { key: { 'votes.userId': 1 }, name: "loan_votes_userId_index" }
      ]);
      
      // Contribution cycle indexes
      await db.collection('contributioncycles').createIndexes([
        { key: { groupId: 1 }, name: "cycle_groupId_index" },
        { key: { startDate: 1 }, name: "cycle_startDate_index" },
        { key: { endDate: 1 }, name: "cycle_endDate_index" },
        { key: { status: 1 }, name: "cycle_status_index" }
      ]);
      
      // Notification indexes
      await db.collection('notifications').createIndexes([
        { key: { userId: 1 }, name: "notif_userId_index" },
        { key: { read: 1 }, name: "notif_read_index" },
        { key: { createdAt: -1 }, name: "notif_createdAt_index" },
        // TTL index to automatically delete old notifications
        { key: { createdAt: 1 }, expireAfterSeconds: 30 * 24 * 60 * 60, name: "notif_ttl_index" }
      ]);

      console.log('Database indexes created successfully');
    } catch (err) {
      if (err.code === 86) { // IndexKeySpecsConflict
        console.log('Some indexes already exist, skipping index creation');
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Error creating database indexes:', err);
    // Don't exit process, just log the error
  }
};

// Configure database logging
const dbLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'database' },
  transports: [
    new winston.transports.File({ 
      filename: `logs/database-${process.env.NODE_ENV || 'development'}.log` 
    }),
    new winston.transports.Console({ 
      format: winston.format.simple(),
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info'
    })
  ]
});

module.exports = {
  connectDB,
  dbLogger
}; 