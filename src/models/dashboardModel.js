const pool = require('../config/database');

class DashboardModel {
  // Get financial summary
  static async getSummary(userId, userRole, filters = {}) {
    let query = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_balance,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM financial_records
      WHERE is_deleted = false
    `;
    
    const params = [];
    let paramCount = 1;

    // Viewers can only see their own data
    if (userRole === 'viewer') {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    // Apply date filters
    if (filters.startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    const result = await pool.query(query, params);
    
    const summary = result.rows[0];
    return {
      total_income: parseFloat(summary.total_income) || 0,
      total_expense: parseFloat(summary.total_expense) || 0,
      net_balance: parseFloat(summary.net_balance) || 0,
      total_transactions: parseInt(summary.total_transactions) || 0,
      income_count: parseInt(summary.income_count) || 0,
      expense_count: parseInt(summary.expense_count) || 0
    };
  }

  // Get category-wise breakdown
  static async getCategoryBreakdown(userId, userRole, type = null, filters = {}) {
    let query = `
      SELECT 
        category,
        type,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(amount) as average_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount
      FROM financial_records
      WHERE is_deleted = false
    `;
    
    const params = [];
    let paramCount = 1;

    if (userRole === 'viewer') {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    query += ` GROUP BY category, type ORDER BY total_amount DESC`;

    const result = await pool.query(query, params);
    
    return result.rows.map(row => ({
      category: row.category,
      type: row.type,
      total_amount: parseFloat(row.total_amount),
      transaction_count: parseInt(row.transaction_count),
      average_amount: parseFloat(row.average_amount),
      min_amount: parseFloat(row.min_amount),
      max_amount: parseFloat(row.max_amount)
    }));
  }

  // Get monthly trends
  static async getMonthlyTrends(userId, userRole, months = 6) {
    let query = `
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net,
        COUNT(*) as transactions
      FROM financial_records
      WHERE is_deleted = false
        AND date >= CURRENT_DATE - INTERVAL '${months} months'
    `;
    
    const params = [];
    let paramCount = 1;

    if (userRole === 'viewer') {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    query += ` GROUP BY TO_CHAR(date, 'YYYY-MM') ORDER BY month DESC`;

    const result = await pool.query(query, params);
    
    return result.rows.map(row => ({
      month: row.month,
      income: parseFloat(row.income),
      expense: parseFloat(row.expense),
      net: parseFloat(row.net),
      transactions: parseInt(row.transactions)
    }));
  }

  // Get weekly trends
  static async getWeeklyTrends(userId, userRole, weeks = 4) {
    let query = `
      SELECT 
        DATE_TRUNC('week', date) as week_start,
        TO_CHAR(DATE_TRUNC('week', date), 'YYYY-MM-DD') as week,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net,
        COUNT(*) as transactions
      FROM financial_records
      WHERE is_deleted = false
        AND date >= CURRENT_DATE - INTERVAL '${weeks} weeks'
    `;
    
    const params = [];
    let paramCount = 1;

    if (userRole === 'viewer') {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    query += ` GROUP BY DATE_TRUNC('week', date) ORDER BY week_start DESC`;

    const result = await pool.query(query, params);
    
    return result.rows.map(row => ({
      week: row.week,
      income: parseFloat(row.income),
      expense: parseFloat(row.expense),
      net: parseFloat(row.net),
      transactions: parseInt(row.transactions)
    }));
  }

  // Get top spending categories
  static async getTopCategories(userId, userRole, type = 'expense', limit = 5, filters = {}) {
    let query = `
      SELECT 
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(amount) as average_amount
      FROM financial_records
      WHERE is_deleted = false
        AND type = $1
    `;
    
    const params = [type];
    let paramCount = 2;

    if (userRole === 'viewer') {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    query += ` GROUP BY category ORDER BY total_amount DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);
    
    return result.rows.map(row => ({
      category: row.category,
      total_amount: parseFloat(row.total_amount),
      transaction_count: parseInt(row.transaction_count),
      average_amount: parseFloat(row.average_amount)
    }));
  }

  // Get insights and statistics
  static async getInsights(userId, userRole, filters = {}) {
    const summary = await this.getSummary(userId, userRole, filters);
    const monthlyTrends = await this.getMonthlyTrends(userId, userRole, 3);
    const topExpenses = await this.getTopCategories(userId, userRole, 'expense', 5, filters);
    const topIncome = await this.getTopCategories(userId, userRole, 'income', 5, filters);

    // Calculate savings rate
    const savingsRate = summary.total_income > 0 
      ? ((summary.total_income - summary.total_expense) / summary.total_income * 100).toFixed(2)
      : 0;

    // Calculate average transaction amounts
    const avgIncome = summary.income_count > 0 
      ? (summary.total_income / summary.income_count).toFixed(2)
      : 0;
    
    const avgExpense = summary.expense_count > 0 
      ? (summary.total_expense / summary.expense_count).toFixed(2)
      : 0;

    return {
      summary,
      savings_rate: parseFloat(savingsRate),
      average_income_per_transaction: parseFloat(avgIncome),
      average_expense_per_transaction: parseFloat(avgExpense),
      monthly_trends: monthlyTrends,
      top_expense_categories: topExpenses,
      top_income_categories: topIncome
    };
  }

  // Get current month comparison with previous month
  static async getMonthComparison(userId, userRole) {
    const query = `
      SELECT 
        CASE 
          WHEN date >= DATE_TRUNC('month', CURRENT_DATE) THEN 'current'
          ELSE 'previous'
        END as period,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        COUNT(*) as transactions
      FROM financial_records
      WHERE is_deleted = false
        AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        ${userRole === 'viewer' ? 'AND user_id = $1' : ''}
      GROUP BY period
    `;
    
    const params = userRole === 'viewer' ? [userId] : [];
    const result = await pool.query(query, params);
    
    const currentMonth = result.rows.find(r => r.period === 'current') || { income: 0, expense: 0, transactions: 0 };
    const previousMonth = result.rows.find(r => r.period === 'previous') || { income: 0, expense: 0, transactions: 0 };

    return {
      current_month: {
        income: parseFloat(currentMonth.income) || 0,
        expense: parseFloat(currentMonth.expense) || 0,
        net: (parseFloat(currentMonth.income) || 0) - (parseFloat(currentMonth.expense) || 0),
        transactions: parseInt(currentMonth.transactions) || 0
      },
      previous_month: {
        income: parseFloat(previousMonth.income) || 0,
        expense: parseFloat(previousMonth.expense) || 0,
        net: (parseFloat(previousMonth.income) || 0) - (parseFloat(previousMonth.expense) || 0),
        transactions: parseInt(previousMonth.transactions) || 0
      },
      changes: {
        income_change: this.calculatePercentageChange(
          parseFloat(previousMonth.income) || 0,
          parseFloat(currentMonth.income) || 0
        ),
        expense_change: this.calculatePercentageChange(
          parseFloat(previousMonth.expense) || 0,
          parseFloat(currentMonth.expense) || 0
        ),
        transaction_change: this.calculatePercentageChange(
          parseInt(previousMonth.transactions) || 0,
          parseInt(currentMonth.transactions) || 0
        )
      }
    };
  }

  // Helper function to calculate percentage change
  static calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return parseFloat(((newValue - oldValue) / oldValue * 100).toFixed(2));
  }
}

module.exports = DashboardModel;