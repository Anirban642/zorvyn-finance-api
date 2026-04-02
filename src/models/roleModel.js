const pool = require('../config/database');

class RoleModel {
  // Get all roles
  static async findAll() {
    const query = 'SELECT id, name, description FROM roles ORDER BY id';
    const result = await pool.query(query);
    return result.rows;
  }

  // Find role by name
  static async findByName(name) {
    const query = 'SELECT id, name, description FROM roles WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Find role by ID
  static async findById(id) {
    const query = 'SELECT id, name, description FROM roles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = RoleModel;