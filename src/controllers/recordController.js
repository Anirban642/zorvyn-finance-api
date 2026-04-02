const RecordModel = require('../models/recordModel');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRecordInput, validateFilters } = require('../utils/recordValidation');

class RecordController {
  // Create new record
  static async createRecord(req, res) {
    try {
      const { amount, type, category, date, description, notes } = req.body;

      // Validate input
      const validation = validateRecordInput(req.body);
      if (!validation.isValid) {
        return errorResponse(res, 400, 'Validation failed', validation.errors);
      }

      // Create record
      const newRecord = await RecordModel.create({
        user_id: req.user.id,
        amount: parseFloat(amount),
        type: type.toLowerCase(),
        category: category.trim(),
        date,
        description: description?.trim(),
        notes: notes?.trim()
      });

      return successResponse(res, 201, 'Record created successfully', {
        record: newRecord
      });

    } catch (error) {
      console.error('Create record error:', error);
      return errorResponse(res, 500, 'Failed to create record');
    }
  }

  // Get all records with filters
  static async getAllRecords(req, res) {
    try {
      const { type, category, startDate, endDate, minAmount, maxAmount, limit, offset } = req.query;

      // Prepare filters
      const filters = {
        type,
        category,
        startDate,
        endDate,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      };

      // Validate filters
      const validation = validateFilters(filters);
      if (!validation.isValid) {
        return errorResponse(res, 400, 'Invalid filter parameters', validation.errors);
      }

      // Get records
      const records = await RecordModel.findAll(req.user.id, req.user.role, filters);
      const total = await RecordModel.getCount(req.user.id, req.user.role, filters);

      return successResponse(res, 200, 'Records retrieved successfully', {
        total,
        count: records.length,
        records
      });

    } catch (error) {
      console.error('Get all records error:', error);
      return errorResponse(res, 500, 'Failed to retrieve records');
    }
  }

  // Get record by ID
  static async getRecordById(req, res) {
    try {
      const { id } = req.params;

      const record = await RecordModel.findById(id, req.user.id, req.user.role);

      if (!record) {
        return errorResponse(res, 404, 'Record not found or access denied');
      }

      return successResponse(res, 200, 'Record retrieved successfully', {
        record
      });

    } catch (error) {
      console.error('Get record by ID error:', error);
      return errorResponse(res, 500, 'Failed to retrieve record');
    }
  }

  // Update record
  static async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const { amount, type, category, date, description, notes } = req.body;

      // Validate input
      const validation = validateRecordInput(req.body, true);
      if (!validation.isValid) {
        return errorResponse(res, 400, 'Validation failed', validation.errors);
      }

      // Update record
      const updatedRecord = await RecordModel.update(
        id,
        req.user.id,
        req.user.role,
        {
          amount: amount ? parseFloat(amount) : undefined,
          type: type?.toLowerCase(),
          category: category?.trim(),
          date,
          description: description?.trim(),
          notes: notes?.trim()
        }
      );

      if (!updatedRecord) {
        return errorResponse(res, 404, 'Record not found or access denied');
      }

      return successResponse(res, 200, 'Record updated successfully', {
        record: updatedRecord
      });

    } catch (error) {
      console.error('Update record error:', error);
      return errorResponse(res, 500, 'Failed to update record');
    }
  }

  // Delete record
  static async deleteRecord(req, res) {
    try {
      const { id } = req.params;

      const deletedRecord = await RecordModel.delete(id, req.user.id, req.user.role);

      if (!deletedRecord) {
        return errorResponse(res, 404, 'Record not found or access denied');
      }

      return successResponse(res, 200, 'Record deleted successfully', {
        record: deletedRecord
      });

    } catch (error) {
      console.error('Delete record error:', error);
      return errorResponse(res, 500, 'Failed to delete record');
    }
  }

  // Get recent records
  static async getRecentRecords(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      const records = await RecordModel.getRecent(req.user.id, req.user.role, limit);

      return successResponse(res, 200, 'Recent records retrieved successfully', {
        count: records.length,
        records
      });

    } catch (error) {
      console.error('Get recent records error:', error);
      return errorResponse(res, 500, 'Failed to retrieve recent records');
    }
  }

  // Get categories
  static async getCategories(req, res) {
    try {
      const categories = await RecordModel.getCategories(req.user.id, req.user.role);

      return successResponse(res, 200, 'Categories retrieved successfully', {
        count: categories.length,
        categories
      });

    } catch (error) {
      console.error('Get categories error:', error);
      return errorResponse(res, 500, 'Failed to retrieve categories');
    }
  }
}

module.exports = RecordController;