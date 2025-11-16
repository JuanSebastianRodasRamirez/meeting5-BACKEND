import { validationResult } from 'express-validator';

/**
 * Validation Middleware
 * Handles input data validation
 * @module ValidationMiddleware
 */

/**
 * Middleware to check validation errors
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};
