const jwt = require('jsonwebtoken');
const User = require('../app/models/User');

/**
 * Protect routes - Middleware to verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token is in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check if token is in cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Check if token exists
    if (!token) {
      // In development mode, create a mock user for testing
      if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
        console.log('Development mode: Creating mock user');
        
        // Try to find an existing user first
        const existingUser = await User.findOne();
        
        if (existingUser) {
          req.user = {
            id: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            roles: existingUser.roles || ['member']
          };
          
          console.log('Using existing user:', req.user);
          return next();
        }
        
        // If no user exists, create a mock user object
        req.user = {
          id: 'dev-user-id',
          firstName: 'Dev',
          lastName: 'User',
          roles: ['member', 'manager', 'admin'] // All roles in dev mode
        };
        
        console.log('Created mock user:', req.user);
        return next();
      }
      
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123456789');
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      // Check if user exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is active
      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.'
        });
      }
      
      // Attach user to request
      req.user = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || ['member'],
        phoneNumber: user.phoneNumber,
        email: user.email
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Role-based authorization middleware
 * Supports multiple roles per user
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    // Skip in development mode if bypass is enabled
    if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
      console.log(`Development mode: Role authorization bypassed`);
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required'
      });
    }

    // If no specific roles required, proceed
    if (roles.length === 0) {
      return next();
    }

    // Check if user has any of the required roles
    const userRoles = req.user.roles || ['member'];
    const hasRequiredRole = userRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Group membership verification middleware
 * Ensures user is a member of the specified group
 * @param {String} paramName - Name of the URL parameter containing the group ID
 */
const verifyGroupMembership = (paramName = 'groupId') => {
  return async (req, res, next) => {
    try {
      const groupId = req.params[paramName];
      
      // Skip in development mode if bypass is enabled
      if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
        console.log(`Development mode: Group membership check bypassed for group ${groupId}`);
        return next();
      }
      
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: `Group ID parameter '${paramName}' is required`
        });
      }
      
      // Check if user is a member of the group
      const user = await User.findById(req.user.id);
      
      // Check if user is a member or manager of the group
      const isMember = user.isMemberOf(groupId);
      const isManager = user.isManagerOf(groupId);
      const isAdmin = user.roles.includes('admin');
      
      if (!isMember && !isManager && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this group'
        });
      }
      
      next();
    } catch (error) {
      console.error('Group membership verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during group membership verification'
      });
    }
  };
};

/**
 * Group management verification middleware
 * Ensures user is a manager of the specified group
 * @param {String} paramName - Name of the URL parameter containing the group ID
 */
const verifyGroupManager = (paramName = 'groupId') => {
  return async (req, res, next) => {
    try {
      const groupId = req.params[paramName];
      
      // Skip in development mode if bypass is enabled
      if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
        console.log(`Development mode: Group manager check bypassed for group ${groupId}`);
        return next();
      }
      
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: `Group ID parameter '${paramName}' is required`
        });
      }
      
      // Check if user is a manager of the group
      const user = await User.findById(req.user.id);
      
      const isManager = user.isManagerOf(groupId);
      const isAdmin = user.roles.includes('admin');
      
      if (!isManager && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not a manager of this group'
        });
      }
      
      next();
    } catch (error) {
      console.error('Group manager verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during group manager verification'
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  verifyGroupMembership,
  verifyGroupManager
}; 