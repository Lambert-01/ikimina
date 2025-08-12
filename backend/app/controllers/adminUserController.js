const User = require('../models/User');

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /admin/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (role && role !== 'all') {
      filter.roles = role;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .populate('memberOfGroups', 'name')
        .populate('managerOfGroups', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -verificationCode'),
      User.countDocuments(filter)
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

/**
 * @desc    Get single user details
 * @route   GET /admin/users/:userId
 * @access  Private (Admin)
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('memberOfGroups', 'name description status createdAt')
      .populate('managerOfGroups', 'name description status createdAt')
      .select('-password -verificationCode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activity stats
    const stats = {
      totalGroups: user.memberOfGroups.length + user.managerOfGroups.length,
      memberGroups: user.memberOfGroups.length,
      managerGroups: user.managerOfGroups.length
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        stats
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

/**
 * @desc    Update user status
 * @route   PUT /admin/users/:userId/status
 * @access  Private (Admin)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password -verificationCode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

/**
 * @desc    Update user roles
 * @route   PUT /admin/users/:userId/roles
 * @access  Private (Admin)
 */
exports.updateUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    // Validate roles
    const validRoles = ['member', 'manager', 'admin', 'user'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(', ')}`
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { roles, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password -verificationCode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User roles updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user roles'
    });
  }
};

/**
 * @desc    Verify user account
 * @route   PUT /admin/users/:userId/verify
 * @access  Private (Admin)
 */
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isVerified: true, 
        verificationCode: undefined,
        verificationExpires: undefined,
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    ).select('-password -verificationCode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      data: user
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user'
    });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /admin/users/:userId
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has active transactions or loans
    const hasActiveTransactions = await require('../models/Transaction').countDocuments({
      userId,
      status: { $in: ['pending', 'processing'] }
    });

    if (hasActiveTransactions > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active transactions'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /admin/users/stats
 * @access  Private (Admin)
 */
exports.getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      unverifiedUsers,
      suspendedUsers,
      adminUsers,
      managerUsers,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isVerified: false }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ roles: 'admin' }),
      User.countDocuments({ roles: 'manager' }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstName lastName email createdAt status')
    ]);

    // User growth over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          unverifiedUsers,
          suspendedUsers,
          adminUsers,
          managerUsers
        },
        recentUsers,
        userGrowth
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};