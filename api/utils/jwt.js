import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * JWT Utility Module
 * Handles JWT token generation and verification
 * @module JWTUtils
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generates a JWT token for a user
 * @param {Object} payload - Data to encode in the token
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE
    });
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
};

/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error(`Failed to verify token: ${error.message}`);
  }
};

/**
 * Decodes a JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
