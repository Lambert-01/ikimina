const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('./app/models/User');
const Admin = require('./app/models/Admin');
const Group = require('./app/models/Group');
const Meeting = require('./app/models/Meeting');
const Transaction = require('./app/models/Transaction');
const Loan = require('./app/models/Loan');
const Contribution = require('./app/models/Contribution');
const ContributionCycle = require('./app/models/ContributionCycle');
const Notification = require('./app/models/Notification');

/**
 * Initialize database with required collections and default data
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Create default admin account
    await createDefaultAdmin();
    
    // Ensure all collections exist by creating sample documents if empty
    await ensureCollectionsExist();
    
    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create default admin account if it doesn't exist
 */
async function createDefaultAdmin() {
  try {
    // Check if any admin exists in User collection with admin role
    const existingAdmin = await User.findOne({ roles: 'admin' });
    
    if (!existingAdmin) {
      console.log('👤 Creating default admin account...');
      
      // Create admin user
      const adminUser = await User.create({
        firstName: 'Lambert',
        lastName: 'Admin',
        email: 'lambert@admin.com',
        phoneNumber: '+250700000000',
        password: 'umuneke',
        roles: ['admin', 'user'],
        isVerified: true,
        status: 'active'
      });
      
      console.log('✅ Default admin account created successfully!');
      console.log('📧 Email: lambert@admin.com');
      console.log('📱 Phone: +250700000000');
      console.log('🔐 Password: umuneke');
    } else {
      console.log('✅ Admin account already exists');
    }

    // Also check Admin collection for separate admin accounts
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('👤 Creating admin in Admin collection...');
      
      await Admin.create({
        firstName: 'Lambert',
        lastName: 'SystemAdmin',
        email: 'admin@ikimina.com',
        // Use a password that satisfies Admin min length (>=8) to avoid seed failure
        password: 'umuneke1',
        role: 'super-admin',
        isActive: true
      });
      
      console.log('✅ Admin collection initialized with default account!');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    throw error;
  }
}

/**
 * Ensure all collections exist with proper indexes
 */
async function ensureCollectionsExist() {
  const collections = [
    { name: 'Users', model: User },
    { name: 'Admins', model: Admin },
    { name: 'Groups', model: Group },
    { name: 'Meetings', model: Meeting },
    { name: 'Transactions', model: Transaction },
    { name: 'Loans', model: Loan },
    { name: 'Contributions', model: Contribution },
    { name: 'ContributionCycles', model: ContributionCycle },
    { name: 'Notifications', model: Notification }
  ];

  for (const collection of collections) {
    try {
      const count = await collection.model.countDocuments();
      console.log(`📊 ${collection.name}: ${count} documents`);
      
      // Create indexes for better performance
      if (collection.model.schema.indexes) {
        await collection.model.createIndexes();
      }
      
      // Initialize with sample data if needed
      if (count === 0) {
        await initializeCollectionData(collection.name, collection.model);
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${collection.name}:`, error.message);
    }
  }
}

/**
 * Initialize collection with sample data if empty
 */
async function initializeCollectionData(collectionName, model) {
  try {
    switch (collectionName) {
      case 'Groups':
        // Don't create sample groups - they should be created by users
        console.log(`📝 ${collectionName} collection ready for user data`);
        break;
        
      case 'Meetings':
        // Don't create sample meetings - they should be scheduled by groups
        console.log(`📝 ${collectionName} collection ready for user data`);
        break;
        
      case 'Transactions':
        // Don't create sample transactions - they should be created by actual activity
        console.log(`📝 ${collectionName} collection ready for user data`);
        break;
        
      case 'Loans':
        // Don't create sample loans - they should be requested by users
        console.log(`📝 ${collectionName} collection ready for user data`);
        break;
        
      case 'Contributions':
        // Don't create sample contributions - they should be made by users
        console.log(`📝 ${collectionName} collection ready for user data`);
        break;
        
      case 'ContributionCycles':
        // Don't create sample cycles - they should be created when groups are created
        console.log(`📝 ${collectionName} collection ready for user data`);
        break;
        
      case 'Notifications':
        // Don't create sample notifications - they should be generated by system events
        console.log(`📝 ${collectionName} collection ready for user data`);
        break;
        
      default:
        console.log(`📝 ${collectionName} collection initialized`);
    }
  } catch (error) {
    console.error(`❌ Error initializing ${collectionName}:`, error);
  }
}

/**
 * Verify database health
 */
async function verifyDatabaseHealth() {
  try {
    console.log('🏥 Verifying database health...');
    
    // Check if we can connect and perform basic operations
    const adminExists = await User.findOne({ roles: 'admin' });
    const collectionsCount = (await mongoose.connection.db.listCollections().toArray()).length;
    
    console.log(`✅ Database connection: OK`);
    console.log(`✅ Admin account: ${adminExists ? 'EXISTS' : 'MISSING'}`);
    console.log(`✅ Collections count: ${collectionsCount}`);
    
    return {
      connected: true,
      adminExists: !!adminExists,
      collectionsCount
    };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      connected: false,
      error: error.message
    };
  }
}

module.exports = {
  initializeDatabase,
  createDefaultAdmin,
  ensureCollectionsExist,
  verifyDatabaseHealth
};