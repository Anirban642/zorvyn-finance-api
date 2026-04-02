const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const UserModel = require('../models/userModel');

// Authenticate user
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided. Please login.');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 401, 'Invalid or expired token. Please login again.');
    }

    // Check if user still exists and is active
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'User no longer exists.');
    }

    if (!user.is_active) {
      return errorResponse(res, 403, 'Your account has been deactivated.');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role_name,
      role_id: user.role_id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 500, 'Authentication failed');
  }
};

module.exports = authenticate;