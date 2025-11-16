/**
 * Logger Utility Module
 * Simple logging utility for application events and errors
 * @module Logger
 */

/**
 * Log levels
 */
const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

/**
 * Formats a log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @returns {string} Formatted message
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * Logs an information message
 * @param {string} message - Message to log
 */
export const info = (message) => {
  console.log(formatMessage(LogLevel.INFO, message));
};

/**
 * Logs a warning message
 * @param {string} message - Message to log
 */
export const warn = (message) => {
  console.warn(formatMessage(LogLevel.WARN, message));
};

/**
 * Logs an error message
 * @param {string} message - Message to log
 * @param {Error} error - Error object
 */
export const error = (message, err = null) => {
  console.error(formatMessage(LogLevel.ERROR, message));
  if (err && err.stack) {
    console.error(err.stack);
  }
};

/**
 * Logs a debug message (development only)
 * @param {string} message - Message to log
 */
export const debug = (message) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatMessage(LogLevel.DEBUG, message));
  }
};

export default {
  info,
  warn,
  error,
  debug
};
