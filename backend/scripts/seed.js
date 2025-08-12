/* eslint-disable no-console */
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const mongoose = require('mongoose');
const colors = require('colors');

const { initializeDatabase } = require('../initializeDatabase');

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ikimina';
    console.log(`Connecting to MongoDB: ${uri}`.cyan);
    await mongoose.connect(uri);
    console.log('MongoDB connected'.green);

    await initializeDatabase();

    console.log('Seeding completed'.green.bold);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();

