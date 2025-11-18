import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Validation Middleware
 * Handles input data validation
 * @module ValidationMiddleware
 */

/**
 * Middleware to check validation errors
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const validate = (req: Request, res: Response, next: NextFunction): void | Response => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(err => ({
        field: 'path' in err ? err.path : ('param' in err ? err.param : 'unknown'),
        message: err.msg
      }))
    });
  }
  
  next();
};
