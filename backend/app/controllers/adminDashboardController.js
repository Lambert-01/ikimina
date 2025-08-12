const User = require('../models/User');
const Group = require('../models/Group');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const Contribution = require('../models/Contribution');
const Notification = require('../models/Notification');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /admin/dashboard/stats
 * @access  Private (Admin)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for main entities
    const [
      totalUsers,
      totalGroups,
      activeGroups,
      pendingGroups,
      totalTransactions,
      totalLoans,
      activeLoans,
      pendingLoans,
      totalContributions,
      unreadNotifications
    ] = await Promise.all([
      User.countDocuments(),
      Group.countDocuments(),
      Group.countDocuments({ status: 'active' }),
      Group.countDocuments({ status: 'pending' }),
      Transaction.countDocuments(),
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'active' }),
      Loan.countDocuments({ status: 'pending' }),
      Contribution.countDocuments(),
      Notification.countDocuments({ read: false })
    ]);

    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersThisMonth,
      newGroupsThisMonth,
      transactionsThisMonth,
      loansThisMonth
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Group.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Transaction.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Loan.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Calculate financial stats
    const financialStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const totalFinancialAmount = financialStats[0]?.totalAmount || 0;
    const averageTransactionAmount = financialStats[0]?.averageAmount || 0;
    const successfulTransactions = financialStats[0]?.successfulTransactions || 0;

    // Get top groups by member count
    const topGroups = await Group.aggregate([
      {
        $addFields: {
          memberCount: { $size: '$members' }
        }
      },
      {
        $sort: { memberCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: 1,
          memberCount: 1,
          status: 1,
          createdAt: 1
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('userId', 'firstName lastName')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount type status createdAt userId groupId description');

    // User growth data (last 7 days)
    const userGrowthData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await User.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      userGrowthData.push({
        date: startOfDay.toISOString().split('T')[0],
        users: count
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalGroups,
          activeGroups,
          pendingGroups,
          totalTransactions,
          totalLoans,
          activeLoans,
          pendingLoans,
          totalContributions,
          unreadNotifications
        },
        recentActivity: {
          newUsersThisMonth,
          newGroupsThisMonth,
          transactionsThisMonth,
          loansThisMonth
        },
        financial: {
          totalAmount: totalFinancialAmount,
          averageTransactionAmount,
          successfulTransactions,
          successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions * 100).toFixed(2) : 0
        },
        topGroups,
        recentTransactions,
        userGrowthData
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

/**
 * @desc    Get system health metrics
 * @route   GET /admin/dashboard/health
 * @access  Private (Admin)
 */
exports.getSystemHealth = async (req, res) => {
  try {
    const dbConnection = require('mongoose').connection;
    
    const health = {
      database: {
        status: dbConnection.readyState === 1 ? 'connected' : 'disconnected',
        host: dbConnection.host,
        name: dbConnection.name
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health'
    });
  }
}; 