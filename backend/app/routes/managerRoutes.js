const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { protect, authorize } = require('../../middleware/auth');

// Protect all routes
router.use(protect);

// In development mode, don't strictly enforce manager role
if (process.env.NODE_ENV === 'development') {
  // Skip role authorization in development
  router.use((req, res, next) => {
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      return next();
    }
    return authorize(['manager', 'admin'])(req, res, next);
  });
} else {
  // Enforce role authorization in production
  router.use(authorize(['manager', 'admin']));
}

// Get manager dashboard data
router.get('/dashboard', managerController.getDashboard);

// Get manager's managed groups
router.get('/groups', managerController.getManagedGroups);

// Get group members
router.get('/groups/:groupId/members', managerController.getGroupMembers);

// Get group contributions
router.get('/groups/:groupId/contributions', managerController.getGroupContributions);

// Get group loans
router.get('/groups/:groupId/loans', managerController.getGroupLoans);

// Approve/reject loan
router.put('/loans/:loanId/status', managerController.updateLoanStatus);

// Generate reports
router.get('/reports/:groupId', managerController.generateGroupReport);

module.exports = router;
