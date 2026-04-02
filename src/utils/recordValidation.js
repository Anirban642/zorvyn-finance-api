// Validate record creation/update input
const validateRecordInput = (data, isUpdate = false) => {
  const errors = [];

  // Amount validation
  if (!isUpdate || data.amount !== undefined) {
    if (!data.amount && data.amount !== 0) {
      errors.push('Amount is required');
    } else if (isNaN(data.amount) || parseFloat(data.amount) <= 0) {
      errors.push('Amount must be a positive number');
    }
  }

  // Type validation
  if (!isUpdate || data.type !== undefined) {
    if (!data.type) {
      errors.push('Type is required');
    } else if (!['income', 'expense'].includes(data.type.toLowerCase())) {
      errors.push('Type must be either "income" or "expense"');
    }
  }

  // Category validation
  if (!isUpdate || data.category !== undefined) {
    if (!data.category || data.category.trim() === '') {
      errors.push('Category is required');
    }
  }

  // Date validation
  if (data.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    } else {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Validate filter parameters
const validateFilters = (filters) => {
  const errors = [];

  if (filters.type && !['income', 'expense'].includes(filters.type.toLowerCase())) {
    errors.push('Filter type must be either "income" or "expense"');
  }

  if (filters.startDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(filters.startDate)) {
      errors.push('Start date must be in YYYY-MM-DD format');
    }
  }

  if (filters.endDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(filters.endDate)) {
      errors.push('End date must be in YYYY-MM-DD format');
    }
  }

  if (filters.minAmount && (isNaN(filters.minAmount) || parseFloat(filters.minAmount) < 0)) {
    errors.push('Minimum amount must be a positive number');
  }

  if (filters.maxAmount && (isNaN(filters.maxAmount) || parseFloat(filters.maxAmount) < 0)) {
    errors.push('Maximum amount must be a positive number');
  }

  if (filters.limit && (isNaN(filters.limit) || parseInt(filters.limit) < 1)) {
    errors.push('Limit must be a positive integer');
  }

  if (filters.offset && (isNaN(filters.offset) || parseInt(filters.offset) < 0)) {
    errors.push('Offset must be a non-negative integer');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

module.exports = {
  validateRecordInput,
  validateFilters
};