const pool = require('../config/database');

class RecordModel {
  // Create new financial record
  static async create(recordData) {
    const { user_id, amount, type, category, date, description, notes } = recordData;
    const query = `
      INSERT INTO financial_records (user_id, amount, type, category, date, description, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_id, amount, type, category, date, description, notes, created_at
    `;
    const result = await pool.query(query, [
      user_id,
      amount,
      type,
      category,
      date || new Date().toISOString().split('T')[0],
      description,
      notes
    ]);
    return result.rows[0];
  }

  // Get all records (Admin and Analyst can see all, Viewer sees only own)
  static async findAll(userId, userRole, filters = {}) {
    let query = `
      SELECT fr.id, fr.user_id, fr.amount, fr.type, fr.category, 
             fr.date, fr.description, fr.notes, fr.created_at,
             u.full_name as user_name
      FROM financial_records fr
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE fr.is_deleted = false
    `;
    const params = [];
    let paramCount = 1;

    // Viewers can only see their own records
    if (userRole === 'viewer') {
      query += ` AND fr.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    // Apply filters
    if (filters.type) {
      query += ` AND fr.type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.category) {
      query += ` AND fr.category ILIKE $${paramCount}`;
      params.push(`%${filters.category}%`);
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND fr.date >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND fr.date <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    if (filters.minAmount) {
      query += ` AND fr.amount >= $${paramCount}`;
      params.push(filters.minAmount);
      paramCount++;
    }

    if (filters.maxAmount) {
      query += ` AND fr.amount <= $${paramCount}`;
      params.push(filters.maxAmount);
      paramCount++;
    }

    query += ` ORDER BY fr.date DESC, fr.created_at DESC`;

    // Add pagination if provided
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get record by ID
  static async findById(id, userId, userRole) {
    let query = `
      SELECT fr.id, fr.user_id, fr.amount, fr.type, fr.category, 
             fr.date, fr.description, fr.notes, fr.created_at,
             u.full_name as user_name
      FROM financial_records fr
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE fr.id = $1 AND fr.is_deleted = false
    `;
    const params = [id];

    // Viewers can only see their own records
    if (userRole === 'viewer') {
      query += ` AND fr.user_id = $2`;
      params.push(userId);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Update record
  static async update(id, userId, userRole, updateData) {
    const { amount, type, category, date, description, notes } = updateData;

    let query = `
      UPDATE financial_records
      SET amount = COALESCE($1, amount),
          type = COALESCE($2, type),
          category = COALESCE($3, category),
          date = COALESCE($4, date),
          description = COALESCE($5, description),
          notes = COALESCE($6, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND is_deleted = false
    `;
    const params = [amount, type, category, date, description, notes, id];

    // Viewers and analysts can only update their own records
    if (userRole !== 'admin') {
      query += ` AND user_id = $8`;
      params.push(userId);
    }

    query += ` RETURNING id, user_id, amount, type, category, date, description, notes, updated_at`;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Delete record (soft delete)
  static async delete(id, userId, userRole) {
    let query = `
      UPDATE financial_records
      SET is_deleted = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_deleted = false
    `;
    const params = [id];

    // Only admin can delete any record
    if (userRole !== 'admin') {
      query += ` AND user_id = $2`;
      params.push(userId);
    }

    query += ` RETURNING id, type, amount, category`;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Get total count for pagination
  static async getCount(userId, userRole, filters = {}) {
    let query = `
      SELECT COUNT(*) as total
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

    if (filters.type) {
      query += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.category) {
      query += ` AND category ILIKE $${paramCount}`;
      params.push(`%${filters.category}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total);
  }

  // Get recent records
  static async getRecent(userId, userRole, limit = 10) {
    let query = `
      SELECT fr.id, fr.amount, fr.type, fr.category, fr.date, fr.description,
             u.full_name as user_name
      FROM financial_records fr
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE fr.is_deleted = false
    `;
    const params = [];

    if (userRole === 'viewer') {
      query += ` AND fr.user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY fr.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get categories list
  static async getCategories(userId, userRole) {
    let query = `
      SELECT DISTINCT category
      FROM financial_records
      WHERE is_deleted = false
    `;
    const params = [];

    if (userRole === 'viewer') {
      query += ` AND user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY category`;

    const result = await pool.query(query, params);
    return result.rows.map(row => row.category);
  }
}

module.exports = RecordModel;