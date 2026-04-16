/**
 * Global Error Handling Middleware
 * Catches all errors and returns standardized response
 * Must be placed LAST in app.js middleware chain
 */
require('dotenv').config();
const log = require("../utils/logger");
const { AppError, ValidationError, NotFoundError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  // Log the error
  log.error(`Error: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  // Handle different error types
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === "development" ? err.stack : null,
    });
  }

  // Handle MongoDB validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Handle MongoDB cast errors
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate entry: ${field} already exists`,
    });
  }

  // Handle Multer file upload errors
  if (err.name === "MulterError") {
    let message = "File upload error";
    if (err.code === "FILE_TOO_LARGE") {
      message = "File size exceeds maximum limit";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files";
    }
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};

module.exports = errorHandler;
