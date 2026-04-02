const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { successResponse, errorResponse } = require('../utils/response');
const { validateUserUpdate } = require('../utils/validation');

class UserController {
  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.findAll();

      return successResponse(res, 200, 'Users retrieved successfully', {
        count: users.length,
        users: users
      });

    } catch (error) {
      console.error('Get all users error:', error);
      return errorResponse(res, 500, 'Failed to retrieve users');
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);

      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      return successResponse(res, 200, 'User retrieved successfully', {
        user: user
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      return errorResponse(res, 500, 'Failed to retrieve user');
    }
  }

  // Update user (Admin only)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { full_name, role, is_active } = req.body;

      // Validate input
      const validation = validateUserUpdate(req.body);
      if (!validation.isValid) {
        return errorResponse(res, 400, 'Validation failed', validation.errors);
      }

      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      // Get role ID if role is being updated
      let role_id = null;
      if (role) {
        const roleData = await RoleModel.findByName(role);
        if (!roleData) {
          return errorResponse(res, 400, 'Invalid role specified');
        }
        role_id = roleData.id;
      }

      // Update user
      const updatedUser = await UserModel.update(id, {
        full_name,
        role_id,
        is_active
      });

      return successResponse(res, 200, 'User updated successfully', {
        user: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      return errorResponse(res, 500, 'Failed to update user');
    }
  }

  // Deactivate user (Admin only)
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deactivating themselves
      if (parseInt(id) === req.user.id) {
        return errorResponse(res, 400, 'You cannot deactivate your own account');
      }

      const user = await UserModel.deactivate(id);

      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      return successResponse(res, 200, 'User deactivated successfully', {
        user: user
      });

    } catch (error) {
      console.error('Deactivate user error:', error);
      return errorResponse(res, 500, 'Failed to deactivate user');
    }
  }

  // Get all roles
  static async getAllRoles(req, res) {
    try {
      const roles = await RoleModel.findAll();

      return successResponse(res, 200, 'Roles retrieved successfully', {
        count: roles.length,
        roles: roles
      });

    } catch (error) {
      console.error('Get all roles error:', error);
      return errorResponse(res, 500, 'Failed to retrieve roles');
    }
  }
}

module.exports = UserController;