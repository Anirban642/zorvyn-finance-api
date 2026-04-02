const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    {
      id: userId,
      email: email,
      role: role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};