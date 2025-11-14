import { verifyToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

/**
 * Authentication Middleware
 * Verifies that the user is authenticated via JWT
 * @module AuthMiddleware
 */

/**
 * Middleware to verify authentication
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify the token
    const decoded = verifyToken(token);
    
    // Add user information to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    logger.error('Authentication failed', error);
    
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
};
