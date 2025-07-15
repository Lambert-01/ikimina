/**
 * MongoDB Connection Test for Ikimina
 * 
 * This script tests whether we can connect to MongoDB and creates a test user
 * if the connection is successful.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection settings
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ikimina';

console.log('Testing MongoDB connection to:', MONGODB_URI);

async function testMongoDBConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');

    // Get the connection status
    const dbStatus = mongoose.connection.readyState;
    console.log('Connection state:', 
      dbStatus === 0 ? 'Disconnected' :
      dbStatus === 1 ? 'Connected' :
      dbStatus === 2 ? 'Connecting' :
      dbStatus === 3 ? 'Disconnecting' : 'Unknown'
    );
    
    // Print MongoDB server info
    const serverInfo = await mongoose.connection.db.admin().serverInfo();
    console.log('MongoDB server version:', serverInfo.version);

    // Check if User model is available
    let User;
    try {
      User = mongoose.model('User');
      console.log('✅ User model loaded from existing models');
    } catch (err) {
      console.log('Loading User model schema...');
      try {
        User = require('./app/models/User');
        console.log('✅ User model loaded successfully');
      } catch (modelError) {
        console.error('❌ Error loading User model:', modelError.message);
        return;
      }
    }
    
    // Create a test user
    console.log('\nCreating test user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpassword123', salt);
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@ikimina.rw' });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
    } else {
      // Create new test user
      const newUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ikimina.rw',
        phoneNumber: '+250712345678',
        password: hashedPassword,
        role: 'admin',
        kycStatus: 'verified',
        kycVerified: true,
        notificationPreferences: {
          sms: { enabled: true },
          email: { enabled: true }
        }
      });
      
      await newUser.save();
      console.log('✅ Test user created successfully:', newUser.email);
    }

    console.log('\nDatabase test completed successfully!');
    console.log('You can use these credentials for testing:');
    console.log('Email: test@ikimina.rw');
    console.log('Password: testpassword123');

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nPossible causes:');
      console.error('1. MongoDB service is not running');
      console.error('2. MongoDB is running on a different port');
      console.error('3. MongoDB connection URI is incorrect');
    }
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
testMongoDBConnection(); 