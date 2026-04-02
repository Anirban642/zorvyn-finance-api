// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 characters)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validate login input
const validateLoginInput = (email, password) => {
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Validate registration input
const validateRegisterInput = (email, password, full_name) => {
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (!isValidPassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!full_name || full_name.trim() === '') {
    errors.push('Full name is required');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Validate user update input
const validateUserUpdate = (data) => {
  const errors = [];

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.full_name && data.full_name.trim() === '') {
    errors.push('Full name cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  validateLoginInput,
  validateRegisterInput,
  validateUserUpdate
};