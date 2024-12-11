const { logger } = require('./log');
const log = logger('validation');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

const validateRegistration = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRegistration
};