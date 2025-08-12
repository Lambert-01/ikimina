const jwt = require('jsonwebtoken');
const Admin = require('../app/models/Admin');

/**
 * Admin Authentication Middleware
 * Protects admin routes and verifies admin JWT tokens
 */
const adminAuth = async (req, res, next) => {
  try {
    let token;
    
    // Check if token is in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check if token is in cookie
    else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123456789');
      
      // Ensure this is an admin token
      if (decoded.type !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin token'
        });
      }
      
      // Find admin by id
      const admin = await Admin.findById(decoded.id);
      
      // Check if admin exists
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found'
        });
      }
      
      // Check if admin account is active
      if (admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Admin account is not active. Please contact super admin.'
        });
      }
      
      // Attach admin to request
      req.admin = {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      };
      
      next();
    } catch (error) {
      console.error('Admin token verification error:', error);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Admin authentication error'
    });
  }
};

/**
 * Admin Permission-based authorization middleware
 * @param {Array|String} permissions - Required permissions
 */
const requirePermission = (permissions = []) => {
  if (typeof permissions === 'string') {
    permissions = [permissions];
  }

  return async (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin authentication required'
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // If no specific permissions required, proceed
    if (permissions.length === 0) {
      return next();
    }

    // Check if admin has any of the required permissions
    const adminPermissions = req.admin.permissions || [];
    const hasRequiredPermission = adminPermissions.some(perm => permissions.includes(perm));
    
    if (!hasRequiredPermission) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: This action requires one of these permissions: ${permissions.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Super Admin only middleware
 */
const requireSuperAdmin = async (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required'
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Super admin access required'
    });
  }

  next();
};

/**
 * Admin Role-based authorization middleware
 * @param {Array|String} roles - Required admin roles
 */
const requireAdminRole = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin authentication required'
      });
    }

    // Super admin has access to everything
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // If no specific roles required, proceed
    if (roles.length === 0) {
      return next();
    }

    // Check if admin has required role
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  adminAuth,
  requirePermission,
  requireSuperAdmin,
  requireAdminRole
};