const jwt = require('jsonwebtoken');
const User = require('../app/models/User');
const logger = require('../app/utils/logger');

/**
 * Authentication Middleware
 * Supports development mode bypass with DEV_AUTH_BYPASS env variable
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    // Development mode bypass
    if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
      logger.debug('Development mode: Authentication bypassed');
      
      // If specific user ID is provided, use it
      if (process.env.DEV_AUTH_USER_ID) {
        const user = await User.findById(process.env.DEV_AUTH_USER_ID);
        if (user) {
          req.user = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            groups: user.groups
          };
          return next();
        }
      }
      
      // Otherwise, create a mock user object
      req.user = {
        id: 'dev-user-id',
        firstName: 'Dev',
        lastName: 'User',
        email: 'dev@ikimina.rw',
        phoneNumber: '+250700000000',
        role: process.env.DEV_AUTH_ROLE || 'member',
        groups: []
      };
      return next();
    }

    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and have proper permissions
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Attach user to request
    req.user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      groups: user.groups
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Role-based authorization middleware
 * Supports multiple roles per user
 * @param {Array} roles - Array of allowed roles
 */
exports.authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Skip in development mode if bypass is enabled
    if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
      logger.debug(`Development mode: Role authorization bypassed`);
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required'
      });
    }

    // Check if user has any of the required roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Insufficient permissions'
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
exports.verifyGroupMembership = (paramName = 'groupId') => {
  return async (req, res, next) => {
    try {
      const groupId = req.params[paramName];
      
      // Skip in development mode if bypass is enabled
      if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
        logger.debug(`Development mode: Group membership check bypassed for group ${groupId}`);
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
      
      const isMember = user.groups.some(group => 
        group.group.toString() === groupId && 
        ['active', 'pending'].includes(group.status)
      );
      
      if (!isMember && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this group'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Group membership verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during group membership verification'
      });
    }
  };
};

/**
 * Group management verification middleware
 * Ensures user is an admin of the specified group
 * @param {String} paramName - Name of the URL parameter containing the group ID
 */
exports.verifyGroupAdmin = (paramName = 'groupId') => {
  return async (req, res, next) => {
    try {
      const groupId = req.params[paramName];
      
      // Skip in development mode if bypass is enabled
      if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
        logger.debug(`Development mode: Group admin check bypassed for group ${groupId}`);
        return next();
      }
      
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: `Group ID parameter '${paramName}' is required`
        });
      }
      
      // Check if user is an admin of the group
      const user = await User.findById(req.user.id);
      
      const isAdmin = user.groups.some(group => 
        group.group.toString() === groupId && 
        group.role === 'admin' && 
        group.status === 'active'
      );
      
      if (!isAdmin && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not an admin of this group'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Group admin verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during group admin verification'
      });
    }
  };
}; 