const mongoose = require('mongoose');
const winston = require('winston');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB connection options
    useNewUrlParser: true,
    useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better query performance
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
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
        { key: { phone: 1 }, unique: true, name: "user_phone_unique" },
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
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'database' },
  transports: [
    new winston.transports.File({ filename: 'logs/database.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

module.exports = {
  connectDB,
  dbLogger
}; 