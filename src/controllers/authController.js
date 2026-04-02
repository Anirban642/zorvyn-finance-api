const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { validateLoginInput, validateRegisterInput } = require('../utils/validation');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      const validation = validateLoginInput(email, password);
      if (!validation.isValid) {
        return errorResponse(res, 400, 'Validation failed', validation.errors);
      }

      // Find user
      const user = await UserModel.findByEmail(email.toLowerCase().trim());

      if (!user) {
        return errorResponse(res, 401, 'Invalid email or password');
      }

      // Check if user is active
      if (!user.is_active) {
        return errorResponse(res, 403, 'Your account has been deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return errorResponse(res, 401, 'Invalid email or password');
      }

      // Generate token
      const token = generateToken(user.id, user.email, user.role_name);

      // Return success response
      return successResponse(res, 200, 'Login successful', {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role_name
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 500, 'Login failed. Please try again.');
    }
  }

  // Register (Admin only - will be protected by middleware)
  static async register(req, res) {
    try {
      const { email, password, full_name, role } = req.body;

      // Validate input
      const validation = validateRegisterInput(email, password, full_name);
      if (!validation.isValid) {
        return errorResponse(res, 400, 'Validation failed', validation.errors);
      }

      // Check if email already exists
      const emailExists = await UserModel.emailExists(email.toLowerCase().trim());
      if (emailExists) {
        return errorResponse(res, 409, 'Email already registered');
      }

      // Get role ID
      const roleName = role || 'viewer'; // Default to viewer
      const roleData = await RoleModel.findByName(roleName);

      if (!roleData) {
        return errorResponse(res, 400, 'Invalid role specified');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await UserModel.create({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        full_name: full_name.trim(),
        role_id: roleData.id
      });

      // Return success response (without password)
      return successResponse(res, 201, 'User registered successfully', {
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: roleName,
          is_active: newUser.is_active
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      return errorResponse(res, 500, 'Registration failed. Please try again.');
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      return successResponse(res, 200, 'Profile retrieved successfully', {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role_name,
          is_active: user.is_active
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, 500, 'Failed to retrieve profile');
    }
  }

  // Logout (client-side token removal, but we can track it)
  static async logout(req, res) {
    try {
      // In a real-world scenario, you might want to blacklist the token
      // For now, we'll just send a success response
      return successResponse(res, 200, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return errorResponse(res, 500, 'Logout failed');
    }
  }
}

module.exports = AuthController;