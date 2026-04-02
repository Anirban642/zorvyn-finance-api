const DashboardModel = require('../models/dashboardModel');
const { successResponse, errorResponse } = require('../utils/response');

class DashboardController {
  // Get dashboard summary
  static async getSummary(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const filters = {
        startDate,
        endDate
      };

      const summary = await DashboardModel.getSummary(req.user.id, req.user.role, filters);

      return successResponse(res, 200, 'Summary retrieved successfully', {
        summary,
        filters: filters.startDate || filters.endDate ? filters : null
      });

    } catch (error) {
      console.error('Get summary error:', error);
      return errorResponse(res, 500, 'Failed to retrieve summary');
    }
  }

  // Get category breakdown
  static async getCategoryBreakdown(req, res) {
    try {
      const { type, startDate, endDate } = req.query;

      const filters = { startDate, endDate };

      const breakdown = await DashboardModel.getCategoryBreakdown(
        req.user.id,
        req.user.role,
        type,
        filters
      );

      return successResponse(res, 200, 'Category breakdown retrieved successfully', {
        type: type || 'all',
        count: breakdown.length,
        breakdown
      });

    } catch (error) {
      console.error('Get category breakdown error:', error);
      return errorResponse(res, 500, 'Failed to retrieve category breakdown');
    }
  }

  // Get monthly trends
  static async getMonthlyTrends(req, res) {
    try {
      const months = req.query.months ? parseInt(req.query.months) : 6;

      if (months < 1 || months > 24) {
        return errorResponse(res, 400, 'Months must be between 1 and 24');
      }

      const trends = await DashboardModel.getMonthlyTrends(req.user.id, req.user.role, months);

      return successResponse(res, 200, 'Monthly trends retrieved successfully', {
        months: months,
        count: trends.length,
        trends
      });

    } catch (error) {
      console.error('Get monthly trends error:', error);
      return errorResponse(res, 500, 'Failed to retrieve monthly trends');
    }
  }

  // Get weekly trends
  static async getWeeklyTrends(req, res) {
    try {
      const weeks = req.query.weeks ? parseInt(req.query.weeks) : 4;

      if (weeks < 1 || weeks > 52) {
        return errorResponse(res, 400, 'Weeks must be between 1 and 52');
      }

      const trends = await DashboardModel.getWeeklyTrends(req.user.id, req.user.role, weeks);

      return successResponse(res, 200, 'Weekly trends retrieved successfully', {
        weeks: weeks,
        count: trends.length,
        trends
      });

    } catch (error) {
      console.error('Get weekly trends error:', error);
      return errorResponse(res, 500, 'Failed to retrieve weekly trends');
    }
  }

  // Get top categories
  static async getTopCategories(req, res) {
    try {
      const { type, limit, startDate, endDate } = req.query;

      const categoryType = type || 'expense';
      const categoryLimit = limit ? parseInt(limit) : 5;

      if (!['income', 'expense'].includes(categoryType)) {
        return errorResponse(res, 400, 'Type must be either "income" or "expense"');
      }

      if (categoryLimit < 1 || categoryLimit > 20) {
        return errorResponse(res, 400, 'Limit must be between 1 and 20');
      }

      const filters = { startDate, endDate };

      const topCategories = await DashboardModel.getTopCategories(
        req.user.id,
        req.user.role,
        categoryType,
        categoryLimit,
        filters
      );

      return successResponse(res, 200, `Top ${categoryType} categories retrieved successfully`, {
        type: categoryType,
        count: topCategories.length,
        categories: topCategories
      });

    } catch (error) {
      console.error('Get top categories error:', error);
      return errorResponse(res, 500, 'Failed to retrieve top categories');
    }
  }

  // Get comprehensive insights
  static async getInsights(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const filters = { startDate, endDate };

      const insights = await DashboardModel.getInsights(req.user.id, req.user.role, filters);

      return successResponse(res, 200, 'Insights retrieved successfully', {
        insights,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get insights error:', error);
      return errorResponse(res, 500, 'Failed to retrieve insights');
    }
  }

  // Get month comparison
  static async getMonthComparison(req, res) {
    try {
      const comparison = await DashboardModel.getMonthComparison(req.user.id, req.user.role);

      return successResponse(res, 200, 'Month comparison retrieved successfully', {
        comparison
      });

    } catch (error) {
      console.error('Get month comparison error:', error);
      return errorResponse(res, 500, 'Failed to retrieve month comparison');
    }
  }

  // Get complete dashboard data
  static async getDashboard(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const filters = { startDate, endDate };

      const [
        summary,
        monthlyTrends,
        topExpenses,
        topIncome,
        monthComparison
      ] = await Promise.all([
        DashboardModel.getSummary(req.user.id, req.user.role, filters),
        DashboardModel.getMonthlyTrends(req.user.id, req.user.role, 6),
        DashboardModel.getTopCategories(req.user.id, req.user.role, 'expense', 5, filters),
        DashboardModel.getTopCategories(req.user.id, req.user.role, 'income', 5, filters),
        DashboardModel.getMonthComparison(req.user.id, req.user.role)
      ]);

      return successResponse(res, 200, 'Dashboard data retrieved successfully', {
        summary,
        monthly_trends: monthlyTrends,
        top_expenses: topExpenses,
        top_income: topIncome,
        month_comparison: monthComparison,
        user: {
          id: req.user.id,
          role: req.user.role,
          email: req.user.email
        },
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get dashboard error:', error);
      return errorResponse(res, 500, 'Failed to retrieve dashboard data');
    }
  }
}

module.exports = DashboardController;