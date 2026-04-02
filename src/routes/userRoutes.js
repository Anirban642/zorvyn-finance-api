const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All user routes require authentication
router.use(authenticate);

// Register new user (Admin only)
const AuthController = require('../controllers/authController');
router.post('/register', authorize('admin'), AuthController.register);

// Get all users (Admin only)
router.get('/', authorize('admin'), UserController.getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', authorize('admin'), UserController.getUserById);

// Update user (Admin only)
router.put('/:id', authorize('admin'), UserController.updateUser);

// Deactivate user (Admin only)
router.delete('/:id', authorize('admin'), UserController.deactivateUser);

// Get all roles (Admin and Analyst)
router.get('/roles/all', authorize('admin', 'analyst'), UserController.getAllRoles);

module.exports = router;