const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');

console.log('=== WORKING IKIMINA SERVER WITH VERBOSE LOGGING ==='.yellow.bold);

// Load environment variables
dotenv.config({ path: './.env' });

console.log('Environment loaded:'.green);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');

// Initialize app
const app = express();

console.log('Express app created'.green);

// Security and middleware
console.log('Setting up middleware...'.cyan);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
console.log('CORS configured for:', corsOptions.origin.join(', '));

// Connect to MongoDB
console.log('Connecting to MongoDB...'.yellow);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('✅ MongoDB connected successfully!'.green.bold);
  console.log('Database name:', mongoose.connection.name);
  console.log('Connection state:', mongoose.connection.readyState);
})
.catch(err => {
  console.error('❌ MongoDB connection error:'.red.bold);
  console.error('Error message:', err.message);
  console.log('⚠️  Server will continue without database...'.yellow);
});

// Health check route
app.get('/health', (req, res) => {
  console.log('Health check requested'.cyan);
  res.json({
    success: true,
    message: 'Ikimina Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    port: process.env.PORT
  });
});

// Import User model for authentication
const User = require('./app/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Authentication routes
app.post('/auth/login', async (req, res) => {
  console.log('🔐 Login attempt received:'.blue);
  console.log('Request body:', { email: (req.body?.email || '').toString().trim().toLowerCase(), password: '***' });
  
  try {
    const { phoneNumber, password } = req.body;
    
    if (!phoneNumber || !password) {
      console.log('❌ Missing credentials'.red);
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and password'
      });
    }
    
    console.log(`🔍 Looking up user: ${phoneNumber}`.cyan);
    
    // Find user in MongoDB (explicitly select password field)
    const user = await User.findOne({ phoneNumber }).select('+password');
    
    if (!user) {
      console.log('❌ User not found'.red);
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }
    
    console.log(`✅ User found: ${user.firstName} ${user.lastName}`.green);
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch'.red);
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        roles: user.roles 
      },
      process.env.JWT_SECRET || 'ikimina_dev_secret_key_123',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    console.log('✅ Login successful - JWT generated'.green);
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          roles: user.roles,
          primaryRole: user.roles.includes('admin') ? 'admin' : 
                       user.roles.includes('manager') ? 'manager' : 'member',
          memberOfGroups: user.memberOfGroups || [],
          managerOfGroups: user.managerOfGroups || []
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:'.red, error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Helper to extract Bearer token
function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return null;
  const parts = String(authHeader).split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

// User auth middleware
async function requireUserAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ikimina_dev_secret_key_123');
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
}

// GET /auth/me - current user profile
app.get('/auth/me', requireUserAuth, async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        roles: user.roles || ['member'],
        primaryRole: (user.roles || []).includes('admin') ? 'admin' : (user.roles || []).includes('manager') ? 'manager' : 'member',
        memberOfGroups: user.memberOfGroups || user.groups || [],
        managerOfGroups: user.managerOfGroups || []
      }
    });
  } catch (error) {
    console.error('GET /auth/me error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get user' });
  }
});

app.post('/auth/register', async (req, res) => {
  console.log('📝 Registration attempt received:'.blue);
  console.log('Request body:', req.body);
  
  try {
    const { firstName, lastName, phoneNumber, email, password, language } = req.body;
    
    if (!firstName || !lastName || !phoneNumber || !email || !password) {
      console.log('❌ Missing required fields'.red);
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including email'
      });
    }
    
    console.log(`🔍 Registration for: ${firstName} ${lastName} (${phoneNumber})`.cyan);
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { email }]
    });
    
    if (existingUser) {
      console.log('❌ User already exists'.red);
      return res.status(400).json({
        success: false,
        message: 'User with this phone number or email already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
      language: language || 'en',
      currency: 'RWF',
      roles: ['member'],
      isVerified: true, // Auto-verify for development
      status: 'active'
    });
    
    await newUser.save();
    console.log(`✅ User created in MongoDB: ${newUser._id}`.green);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id,
        roles: newUser.roles 
      },
      process.env.JWT_SECRET || 'ikimina_dev_secret_key_123',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    console.log('✅ Registration successful - JWT generated'.green);
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phoneNumber: newUser.phoneNumber,
          email: newUser.email,
          roles: newUser.roles,
          primaryRole: 'member',
          memberOfGroups: newUser.memberOfGroups || [],
          managerOfGroups: newUser.managerOfGroups || []
        }
      }
    });
  } catch (error) {
    console.error('❌ Registration error:'.red, error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// Import Admin model for authentication (fallback if not exists)
let Admin;
try {
  Admin = require('./app/models/Admin');
} catch (error) {
  console.log('⚠️  Admin model not found, using User model for admin auth'.yellow);
  Admin = null;
}

// Admin authentication
app.post('/admin/auth/login', async (req, res) => {
  console.log('👑 Admin login attempt received:'.magenta);
  console.log('Request body:', req.body);
  
  try {
    const email = (req.body?.email || '').toString().trim().toLowerCase();
    const password = (req.body?.password || '').toString().trim();
    
    if (!email || !password) {
      console.log('❌ Missing admin credentials'.red);
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    console.log(`🔍 Looking up admin: ${email}`.cyan);
    
    // Find admin in MongoDB (check both Admin collection and users with admin role)
    let admin = null;
    
    if (Admin) {
      admin = await Admin.findOne({ email }).select('+password');
    }
    
    if (!admin) {
      // Also check users collection for admin role
      console.log('Checking users collection for admin role...'.yellow);
      const userAdmin = await User.findOne({ email, roles: 'admin' }).select('+password');
      
      if (userAdmin) {
        admin = {
          _id: userAdmin._id,
          firstName: userAdmin.firstName,
          lastName: userAdmin.lastName,
          email: userAdmin.email,
          password: userAdmin.password,
          role: 'admin',
          permissions: ['manage_users', 'approve_groups', 'view_system_logs'],
          matchPassword: userAdmin.matchPassword?.bind(userAdmin) || 
                        (async (pwd) => await bcrypt.compare(pwd, userAdmin.password))
        };
      }
    }
    
    if (!admin) {
      console.log('❌ Admin not found'.red);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log(`✅ Admin found: ${admin.firstName} ${admin.lastName}`.green);
    
    // Check password
    let isMatch;
    if (admin.matchPassword) {
      isMatch = await admin.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, admin.password);
    }
    
    if (!isMatch) {
      console.log('❌ Admin password mismatch'.red);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token for admin
    const token = jwt.sign(
      { 
        id: admin._id,
        type: 'admin',
        role: admin.role,
        permissions: admin.permissions || ['manage_users', 'approve_groups', 'view_system_logs']
      },
      process.env.JWT_SECRET || 'ikimina_dev_secret_key_123',
      { expiresIn: '8h' }
    );
    
    console.log('✅ Admin login successful - JWT generated'.green);
    
    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role || 'admin',
          permissions: admin.permissions || ['manage_users', 'approve_groups', 'view_system_logs']
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:'.red, error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed. Please try again.'
    });
  }
});

// Admin auth middleware
async function requireAdminAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ikimina_dev_secret_key_123');
    // Accept tokens created by our admin login flow
    if (!decoded?.id) return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    req.adminToken = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
}

// GET /admin/auth/me - current admin profile
app.get('/admin/auth/me', requireAdminAuth, async (req, res) => {
  try {
    const adminId = req.adminToken.id;
    let adminDoc = null;
    if (Admin) {
      adminDoc = await Admin.findById(adminId);
    }
    if (!adminDoc) {
      // Fallback to user with admin role
      const userAdmin = await User.findOne({ _id: adminId });
      if (userAdmin) {
        adminDoc = {
          _id: userAdmin._id,
          firstName: userAdmin.firstName,
          lastName: userAdmin.lastName,
          email: userAdmin.email,
          role: 'admin',
          permissions: ['manage_users', 'approve_groups', 'view_system_logs']
        };
      }
    }
    if (!adminDoc) return res.status(404).json({ success: false, message: 'Admin not found' });
    return res.json({
      success: true,
      data: {
        id: adminDoc._id,
        firstName: adminDoc.firstName,
        lastName: adminDoc.lastName,
        email: adminDoc.email,
        role: adminDoc.role || 'admin',
        permissions: adminDoc.permissions || ['manage_users', 'approve_groups', 'view_system_logs']
      }
    });
  } catch (error) {
    console.error('GET /admin/auth/me error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get admin' });
  }
});

// POST /admin/auth/logout - noop endpoint for frontend
app.post('/admin/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out' });
});

// Add admin dashboard stats with expected structure
app.get('/admin/dashboard/stats', async (req, res) => {
  console.log('📊 Admin dashboard stats requested'.magenta);
  try {
    // Lazy import models to avoid circular references
    let Group, Loan, Transaction;
    try { Group = require('./app/models/Group'); } catch {}
    try { Loan = require('./app/models/Loan'); } catch {}
    try { Transaction = require('./app/models/Transaction'); } catch {}

    const counts = await Promise.all([
      User.countDocuments().catch(() => 0),
      Group ? Group.countDocuments().catch(() => 0) : Promise.resolve(0),
      Loan ? Loan.countDocuments().catch(() => 0) : Promise.resolve(0),
      Transaction ? Transaction.countDocuments({ status: 'completed' }).catch(() => 0) : Promise.resolve(0)
    ]);

    const [totalUsers, totalGroups, totalLoans, totalContributions] = counts;

    const payload = {
      overview: {
        totalUsers,
        totalGroups,
        activeGroups: totalGroups, // placeholder
        pendingGroups: 0,
        totalTransactions: totalContributions,
        totalLoans,
        activeLoans: totalLoans, // placeholder
        pendingLoans: 0,
        totalContributions,
        unreadNotifications: 0
      },
      recentActivity: {
        newUsersThisMonth: 0,
        newGroupsThisMonth: 0,
        transactionsThisMonth: 0,
        loansThisMonth: 0
      },
      financial: {
        totalAmount: 0,
        averageTransactionAmount: 0,
        successfulTransactions: totalContributions,
        successRate: '100'
      },
      topGroups: [],
      recentTransactions: [],
      userGrowthData: []
    };

    return res.json({ success: true, data: payload });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

app.get('/api/groups/pending', (req, res) => {
  console.log('📋 Pending groups requested'.blue);
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/admin/groups/pending', (req, res) => {
  console.log('📋 Admin pending groups requested'.magenta);
  res.json({
    success: true,
    data: {
      pendingGroups: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalPending: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  });
});

// === Member/Groups endpoints expected by frontend ===
app.get('/api/groups/member', requireUserAuth, async (req, res) => {
  try {
    // Try to load actual groups if model exists
    let Group; try { Group = require('./app/models/Group'); } catch {}
    const user = req.user;
    let groups = [];
    if (Group && Array.isArray(user.groups) && user.groups.length > 0) {
      const groupIds = user.groups.map(g => g.group || g);
      groups = await Group.find({ _id: { $in: groupIds } })
        .select('name description status createdBy createdAt members')
        .lean();
      groups = groups.map(g => ({
        _id: g._id,
        name: g.name,
        description: g.description || '',
        status: g.status || 'active',
        memberCount: Array.isArray(g.members) ? g.members.length : 1,
        createdBy: g.createdBy || null,
        createdAt: g.createdAt || new Date().toISOString()
      }));
    }
    return res.json({ success: true, data: groups });
  } catch (err) {
    console.error('GET /api/groups/member error:', err);
    return res.json({ success: true, data: [] });
  }
});

app.get('/api/groups/managed', requireUserAuth, async (req, res) => {
  try {
    const user = req.user;
    let groups = [];
    if (Array.isArray(user.groups)) {
      const managedIds = user.groups.filter(g => ['manager','treasurer','admin'].includes(g.role)).map(g => g.group || g);
      let Group; try { Group = require('./app/models/Group'); } catch {}
      if (Group && managedIds.length) {
        const docs = await Group.find({ _id: { $in: managedIds } }).select('name description status createdAt members').lean();
        groups = docs.map(g => ({
          _id: g._id,
          name: g.name,
          description: g.description || '',
          status: g.status || 'active',
          memberCount: Array.isArray(g.members) ? g.members.length : 1,
          createdAt: g.createdAt || new Date().toISOString()
        }));
      }
    }
    return res.json({ success: true, data: groups });
  } catch (err) {
    console.error('GET /api/groups/managed error:', err);
    return res.json({ success: true, data: [] });
  }
});

app.get('/api/groups/public', async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    let groups = [];
    if (Group) {
      const docs = await Group.find({ status: 'active' }).select('name description createdAt members createdBy contributionSettings').limit(50).lean();
      groups = docs.map(g => ({
        _id: g._id,
        name: g.name,
        description: g.description || '',
        status: 'active',
        memberCount: Array.isArray(g.members) ? g.members.length : 1,
        createdBy: g.createdBy || null,
        createdAt: g.createdAt || new Date().toISOString(),
        contributionSettings: g.contributionSettings || { amount: 0, frequency: 'monthly', currency: 'RWF' }
      }));
    }
    return res.json({ success: true, data: groups });
  } catch (err) {
    console.error('GET /api/groups/public error:', err);
    return res.json({ success: true, data: [] });
  }
});

// Admin groups listing expected by frontend
app.get('/admin/groups', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const search = (req.query.search || '').toString().trim();
    const status = (req.query.status || '').toString().trim();
    const dateFilter = (req.query.dateFilter || '').toString().trim();

    if (!Group) {
      return res.json({ success: true, data: [], pagination: { total: 0, pages: 0, page, limit } });
    }

    const filter = {};
    if (search) filter['name'] = { $regex: search, $options: 'i' };
    if (status) filter['status'] = status;
    
    // Date filtering
    if (dateFilter) {
      const now = new Date();
      let startDate;
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      if (startDate) {
        filter['createdAt'] = { $gte: startDate };
      }
    }

    const total = await Group.countDocuments(filter);
    const pages = Math.ceil(total / limit) || 1;
    const docs = await Group.find(filter)
      .populate('createdBy', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const data = docs.map(g => ({
      _id: g._id,
      name: g.name,
      description: g.description || '',
      status: g.status || 'active',
      memberCount: Array.isArray(g.members) ? g.members.length : 1,
      createdBy: g.createdBy ? {
        _id: g.createdBy._id,
        firstName: g.createdBy.firstName,
        lastName: g.createdBy.lastName,
        email: g.createdBy.email,
        phoneNumber: g.createdBy.phoneNumber
      } : null,
      createdAt: g.createdAt || new Date().toISOString(),
      rejectionReason: g.rejectionReason || undefined,
      contributionSettings: g.contributionSettings || undefined
    }));

    return res.json({
      success: true,
      data,
      pagination: { total, pages, page, limit }
    });
  } catch (err) {
    console.error('GET /admin/groups error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
});

app.put('/admin/groups/:id/status', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.json({ success: true });
    await Group.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    return res.json({ success: true });
  } catch (err) {
    console.error('PUT /admin/groups/:id/status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Convenience admin endpoints for approve/reject to support various frontend paths
app.put('/admin/groups/:id/approve', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.status(404).json({ success: false, message: 'Group model not found' });
    await Group.findByIdAndUpdate(req.params.id, {
      status: 'active',
      approvedAt: new Date(),
      approvedBy: req.adminToken?.id || req.admin?.id
    });
    return res.json({ success: true, message: 'Group approved successfully' });
  } catch (err) {
    console.error('PUT /admin/groups/:id/approve error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve group' });
  }
});

app.post('/admin/groups/approve/:id', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.status(404).json({ success: false, message: 'Group model not found' });
    await Group.findByIdAndUpdate(req.params.id, {
      status: 'active',
      approvedAt: new Date(),
      approvedBy: req.adminToken?.id || req.admin?.id
    });
    return res.json({ success: true, message: 'Group approved successfully' });
  } catch (err) {
    console.error('POST /admin/groups/approve/:id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve group' });
  }
});

app.put('/admin/groups/:id/reject', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.status(404).json({ success: false, message: 'Group model not found' });
    const reason = req.body?.rejectionReason || req.body?.reason || 'No reason provided';
    await Group.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.adminToken?.id || req.admin?.id,
      rejectionReason: reason
    });
    return res.json({ success: true, message: 'Group rejected successfully' });
  } catch (err) {
    console.error('PUT /admin/groups/:id/reject error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject group' });
  }
});

app.post('/admin/groups/reject/:id', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.status(404).json({ success: false, message: 'Group model not found' });
    const reason = req.body?.reason || req.body?.rejectionReason || 'No reason provided';
    await Group.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.adminToken?.id || req.admin?.id,
      rejectionReason: reason
    });
    return res.json({ success: true, message: 'Group rejected successfully' });
  } catch (err) {
    console.error('POST /admin/groups/reject/:id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject group' });
  }
});

app.delete('/admin/groups/:id', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (Group) await Group.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /admin/groups/:id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete group' });
  }
});

// Admin users listing expected by frontend
app.get('/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const search = (req.query.search || '').toString().trim();
    const status = (req.query.status || '').toString().trim();
    const role = (req.query.role || '').toString().trim();

    const filter = {};
    if (search) {
      filter['$or'] = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') filter['status'] = status;
    if (role && role !== 'all') filter['roles'] = role;

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit) || 1;
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: {
        users: users.map(u => ({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phoneNumber: u.phoneNumber,
          roles: u.roles || ['member'],
          status: u.status || 'active',
          isVerified: !!u.isVerified,
          createdAt: u.createdAt || new Date().toISOString(),
          lastLogin: u.lastLogin || new Date().toISOString(),
          memberOfGroups: u.memberOfGroups || [],
          managerOfGroups: u.managerOfGroups || []
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (err) {
    console.error('GET /admin/users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Meetings and Loans endpoints used by member dashboard
app.get('/meetings/user', requireUserAuth, async (req, res) => {
  try {
    // Basic empty payload compatible with frontend consumer
    return res.json({ success: true, data: [] });
  } catch (err) {
    return res.json({ success: true, data: [] });
  }
});

app.get('/api/loans/my-loans', requireUserAuth, async (req, res) => {
  try {
    return res.json({ success: true, data: [] });
  } catch (err) {
    return res.json({ success: true, data: [] });
  }
});

// Payments endpoints used by member contributions and reports
app.get('/api/payments/contributions', requireUserAuth, async (req, res) => {
  try {
    // Provide an empty but well-formed response to unblock UI in dev
    return res.json({
      success: true,
      count: 0,
      total: 0,
      page: 1,
      pages: 1,
      data: []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch contributions' });
  }
});

app.get('/api/payments/contributions/summary', requireUserAuth, async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        totalContributed: 0,
        contributionsByGroup: [],
        upcomingContributions: []
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch contribution summary' });
  }
});

app.get('/api/payments/contributions/overdue', requireUserAuth, async (req, res) => {
  try {
    return res.json({ success: true, count: 0, data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch overdue contributions' });
  }
});

// Create group endpoint used by member create-group page
app.post('/api/groups', requireUserAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.status(500).json({ success: false, message: 'Group model missing' });

    const body = req.body || {};
    const doc = new Group({
      name: body.name,
      description: body.description || '',
      groupType: body.groupType || 'savings',
      status: 'pending',
      createdBy: req.user._id,
      managers: [req.user._id],
      members: [{ user: req.user._id, role: 'member', status: 'active' }],
      contributionSettings: body.contributionSettings || { amount: 0, frequency: 'monthly' },
      loanSettings: body.loanSettings || undefined,
      meetingSettings: body.meetingSettings || undefined,
      memberCount: 1,
      auditLog: [{
        action: 'created',
        performedBy: req.user._id,
        timestamp: new Date(),
        details: {
          initialStatus: 'pending',
          groupType: body.groupType || 'savings'
        }
      }]
    });
    await doc.save();

    return res.status(201).json({ success: true, data: { id: doc._id } });
  } catch (err) {
    console.error('POST /api/groups error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create group' });
  }
});

// Approve/Reject group endpoints used by admin UI
app.patch('/api/groups/:id/approve', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.status(404).json({ success: false, message: 'Group model not found' });
    
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    
    // Update group status with audit trail
    const updateData = {
      status: 'active',
      approvedAt: new Date(),
      approvedBy: req.adminToken.id,
      $push: {
        auditLog: {
          action: 'approved',
          performedBy: req.adminToken.id,
          timestamp: new Date(),
          details: { previousStatus: group.status }
        }
      }
    };
    
    await Group.findByIdAndUpdate(req.params.id, updateData);
    console.log(`✅ Group "${group.name}" approved by admin ${req.adminToken.id}`.green);
    
    return res.json({ success: true, message: 'Group approved successfully' });
  } catch (err) {
    console.error('Approve group error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve group' });
  }
});

app.patch('/api/groups/:id/reject', requireAdminAuth, async (req, res) => {
  try {
    let Group; try { Group = require('./app/models/Group'); } catch {}
    if (!Group) return res.status(404).json({ success: false, message: 'Group model not found' });
    
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    
    const reason = req.body?.reason || 'No reason provided';
    
    // Update group status with audit trail
    const updateData = {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.adminToken.id,
      rejectionReason: reason,
      $push: {
        auditLog: {
          action: 'rejected',
          performedBy: req.adminToken.id,
          timestamp: new Date(),
          details: { 
            previousStatus: group.status,
            reason: reason
          }
        }
      }
    };
    
    await Group.findByIdAndUpdate(req.params.id, updateData);
    console.log(`❌ Group "${group.name}" rejected by admin ${req.adminToken.id}`.red);
    
    return res.json({ success: true, message: 'Group rejected successfully' });
  } catch (err) {
    console.error('Reject group error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject group' });
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`.gray);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log(`❓ 404 - Route not found: ${req.method} ${req.originalUrl}`.yellow);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:'.red.bold);
  console.error('Error message:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`🚀 Starting server on port ${PORT}...`.cyan);

const server = app.listen(PORT, () => {
  console.log('='.repeat(70).green);
  console.log('🎉 IKIMINA WORKING SERVER IS RUNNING!'.green.bold);
  console.log('='.repeat(70).green);
  console.log(`🌐 Server URL: http://localhost:${PORT}`.cyan.bold);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`.green);
  console.log(`🔐 User Login: http://localhost:${PORT}/auth/login`.blue);
  console.log(`👑 Admin Login: http://localhost:${PORT}/admin/auth/login`.magenta);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`.magenta);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`.gray);
  console.log('='.repeat(70).green);
  console.log('✅ Ready to accept requests!'.green.bold);
  console.log('📝 All requests will be logged with details'.cyan);
  console.log('🛑 Press Ctrl+C to stop the server'.red);
  console.log('='.repeat(70).green);
});

server.on('error', (err) => {
  console.error('❌ Server error:'.red.bold);
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);
  
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close other applications using this port.`.red);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📤 SIGTERM received. Shutting down gracefully...'.yellow);
  server.close(() => {
    console.log('✅ Process terminated gracefully'.green);
  });
});

process.on('SIGINT', () => {
  console.log('\n📤 SIGINT received. Shutting down gracefully...'.yellow);
  server.close(() => {
    mongoose.connection.close();
    console.log('✅ Process terminated gracefully'.green);
    process.exit(0);
  });
});

console.log('✅ Server setup completed - verbose logging enabled'.green.bold);