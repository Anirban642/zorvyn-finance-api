const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// Public routes
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;