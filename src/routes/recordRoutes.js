const express = require('express');
const router = express.Router();
const RecordController = require('../controllers/recordController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All record routes require authentication
router.use(authenticate);

// Get categories (all roles)
router.get('/categories', RecordController.getCategories);

// Get recent records (all roles)
router.get('/recent', RecordController.getRecentRecords);

// Get all records (all roles - but viewers see only their own)
router.get('/', RecordController.getAllRecords);

// Get record by ID (all roles - with access control)
router.get('/:id', RecordController.getRecordById);

// Create record (admin only - viewers cannot create)
router.post('/', authorize('admin', 'analyst'), RecordController.createRecord);

// Update record (admin and record owner)
router.put('/:id', authorize('admin', 'analyst'), RecordController.updateRecord);

// Delete record (admin only)
router.delete('/:id', authorize('admin'), RecordController.deleteRecord);

module.exports = router;