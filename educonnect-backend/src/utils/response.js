/**
 * Standardized API Response Format
 * All endpoints should use this utility
 */

const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = "An error occurred", statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.toString() : null,
  });
};

const sendValidationError = (res, message = "Validation failed", errors = []) => {
  return res.status(400).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
};
