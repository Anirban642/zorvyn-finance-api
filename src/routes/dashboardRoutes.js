const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All dashboard routes require authentication
router.use(authenticate);

// Get complete dashboard (all roles)
router.get('/', DashboardController.getDashboard);

// Get summary (all roles)
router.get('/summary', DashboardController.getSummary);

// Get category breakdown (all roles)
router.get('/categories', DashboardController.getCategoryBreakdown);

// Get monthly trends (all roles)
router.get('/trends/monthly', DashboardController.getMonthlyTrends);

// Get weekly trends (all roles)
router.get('/trends/weekly', DashboardController.getWeeklyTrends);

// Get top categories (all roles)
router.get('/top-categories', DashboardController.getTopCategories);

// Get comprehensive insights (admin and analyst only)
router.get('/insights', authorize('admin', 'analyst'), DashboardController.getInsights);

// Get month comparison (all roles)
router.get('/comparison/month', DashboardController.getMonthComparison);

module.exports = router;