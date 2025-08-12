const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const Admin = require('./app/models/Admin');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.error(`Error: ${err.message}`.red.bold);
    process.exit(1);
  }
};

const createSuperAdmin = async () => {
  try {
    await connectDB();

    console.log('🚀 Creating Super Admin for Ikimina Platform...'.yellow.bold);

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists!'.yellow);
      console.log(`Email: ${existingSuperAdmin.email}`.cyan);
      console.log('If you want to reset the password, please delete the existing super admin first.'.yellow);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await Admin.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@ikimina.com',
      password: 'SuperAdmin123!',
      role: 'super_admin',
      permissions: [
        'manage_users',
        'approve_groups', 
        'suspend_accounts',
        'view_system_logs',
        'manage_platform_settings',
        'generate_reports',
        'handle_disputes',
        'monitor_compliance',
        'manage_admins'
      ],
      status: 'active'
    });

    console.log('✅ Super Admin created successfully!'.green.bold);
    console.log('');
    console.log('🔐 Super Admin Credentials:'.cyan.bold);
    console.log(`📧 Email: ${superAdmin.email}`.white);
    console.log(`🔑 Password: SuperAdmin123!`.white);
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:'.red.bold);
    console.log('1. Change the default password immediately after first login'.yellow);
    console.log('2. Use this account only for initial setup and creating other admins'.yellow);
    console.log('3. Store these credentials securely'.yellow);
    console.log('');
    console.log('🌐 Admin Login URL: http://localhost:5173/admin/login'.cyan);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:'.red.bold);
    console.error(error.message.red);
    
    if (error.code === 11000) {
      console.log('Super admin with this email already exists.'.yellow);
    }
    
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`.red.bold);
  process.exit(1);
});

// Run the script
createSuperAdmin();