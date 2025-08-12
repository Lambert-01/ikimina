const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function resetPasswords() {
  try {
    console.log('🔄 Resetting passwords to "password123"...');
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Update all users to have the same password for testing
    const users = await mongoose.connection.db.collection('users').find().toArray();
    
    for (const user of users) {
      await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`✅ Updated password for: ${user.firstName} ${user.lastName} (${user.phoneNumber})`);
    }
    
    // Also update admin password
    const admins = await mongoose.connection.db.collection('admins').find().toArray();
    
    for (const admin of admins) {
      await mongoose.connection.db.collection('admins').updateOne(
        { _id: admin._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`✅ Updated admin password for: ${admin.firstName} ${admin.lastName} (${admin.email})`);
    }
    
    console.log('');
    console.log('🎉 All passwords have been reset to: password123');
    console.log('');
    console.log('👤 Test User Credentials:');
    users.forEach(user => {
      console.log(`   📱 ${user.phoneNumber} / password123`);
    });
    
    console.log('');
    console.log('👑 Test Admin Credentials:');
    admins.forEach(admin => {
      console.log(`   📧 ${admin.email} / password123`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPasswords();
