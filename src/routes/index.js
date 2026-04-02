const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const recordRoutes = require('./recordRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// API version prefix
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Backend API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        logout: 'POST /api/auth/logout'
      },
      users: {
        register: 'POST /api/users/register (Admin only)',
        getAll: 'GET /api/users (Admin only)',
        getById: 'GET /api/users/:id (Admin only)',
        update: 'PUT /api/users/:id (Admin only)',
        deactivate: 'DELETE /api/users/:id (Admin only)',
        roles: 'GET /api/users/roles/all (Admin, Analyst)'
      },
      records: {
        create: 'POST /api/records (Admin, Analyst)',
        getAll: 'GET /api/records (All - filtered by role)',
        getById: 'GET /api/records/:id (All - with access control)',
        update: 'PUT /api/records/:id (Admin, Analyst)',
        delete: 'DELETE /api/records/:id (Admin only)',
        recent: 'GET /api/records/recent (All)',
        categories: 'GET /api/records/categories (All)'
      },
      dashboard: {
        main: 'GET /api/dashboard (All)',
        summary: 'GET /api/dashboard/summary (All)',
        categories: 'GET /api/dashboard/categories (All)',
        monthlyTrends: 'GET /api/dashboard/trends/monthly (All)',
        weeklyTrends: 'GET /api/dashboard/trends/weekly (All)',
        topCategories: 'GET /api/dashboard/top-categories (All)',
        insights: 'GET /api/dashboard/insights (Admin, Analyst)',
        monthComparison: 'GET /api/dashboard/comparison/month (All)'
      }
    }
  });
});

module.exports = router;