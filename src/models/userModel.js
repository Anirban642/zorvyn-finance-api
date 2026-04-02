const pool = require('../config/database');

class UserModel {
  // Find user by email
  static async findByEmail(email) {
    const query = `
      SELECT u.id, u.email, u.password, u.full_name, u.is_active,
             r.name as role_name, r.id as role_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = `
      SELECT u.id, u.email, u.full_name, u.is_active,
             r.name as role_name, r.id as role_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create new user
  static async create(userData) {
    const { email, password, full_name, role_id } = userData;
    const query = `
      INSERT INTO users (email, password, full_name, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, full_name, role_id, is_active, created_at
    `;
    const result = await pool.query(query, [email, password, full_name, role_id]);
    return result.rows[0];
  }

  // Get all users (admin only)
  static async findAll() {
    const query = `
      SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
             r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Update user
  static async update(id, userData) {
    const { full_name, role_id, is_active } = userData;
    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          role_id = COALESCE($2, role_id),
          is_active = COALESCE($3, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, email, full_name, role_id, is_active
    `;
    const result = await pool.query(query, [full_name, role_id, is_active, id]);
    return result.rows[0];
  }

  // Delete user (soft delete by deactivating)
  static async deactivate(id) {
    const query = `
      UPDATE users
      SET is_active = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, is_active
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Check if email exists
  static async emailExists(email) {
    const query = 'SELECT id FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }
}

module.exports = UserModel;