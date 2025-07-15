require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./app/models/User');
const logger = require('./app/utils/logger');
const dbConfig = require('./config/database');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbConfig.url, dbConfig.options);
    logger.info('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ phoneNumber: '250700000000' });
    if (existingUser) {
      logger.info('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '250700000000',
      email: 'test@example.com',
      password: 'password123',
      role: 'member',
      isVerified: true
    });

    logger.info(`Test user created with ID: ${testUser._id}`);
    logger.info('Use the following credentials to log in:');
    logger.info('Phone: 250700000000');
    logger.info('Password: password123');

  } catch (error) {
    logger.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestUser();
