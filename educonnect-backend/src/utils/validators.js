/**
 * Input Validation Utilities
 * Reusable validation functions for all endpoints
 */

const sanitizeText = (text) => {
  if (typeof text !== "string") return "";

  // Remove dangerous characters and trim
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRequiredFields = (fields, requiredFields) => {
  const errors = [];

  for (const field of requiredFields) {
    if (!fields[field] || (typeof fields[field] === "string" && !fields[field].trim())) {
      errors.push(`${field} is required`);
    }
  }

  return errors;
};

const validateFileSize = (fileSize, maxSizeInMB = 10) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

const validateFileType = (filename, allowedTypes = []) => {
  if (!allowedTypes || allowedTypes.length === 0) return true;

  const ext = filename.split(".").pop()?.toLowerCase();
  return allowedTypes.includes(ext);
};

const validateStringLength = (text, minLength = 1, maxLength = 5000) => {
  if (typeof text !== "string") return false;
  const len = text.trim().length;
  return len >= minLength && len <= maxLength;
};

const validateNumberRange = (num, min = 0, max = Infinity) => {
  return !isNaN(num) && num >= min && num <= max;
};

const validateDateFormat = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const validateArray = (arr, minLength = 0, maxLength = Infinity) => {
  if (!Array.isArray(arr)) return false;
  return arr.length >= minLength && arr.length <= maxLength;
};

const validateMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  sanitizeText,
  validateEmail,
  validateRequiredFields,
  validateFileSize,
  validateFileType,
  validateStringLength,
  validateNumberRange,
  validateDateFormat,
  validateArray,
  validateMongoId,
};
