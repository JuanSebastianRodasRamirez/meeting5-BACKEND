/**
 * Logger Utility Module
 * Simple logging utility for application events and errors
 * @module Logger
 */

/**
 * Log levels
 */
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

/**
 * Formats a log message with timestamp and level
 * @param level - Log level
 * @param message - Log message
 * @returns Formatted message
 */
const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * Logs an information message
 * @param message - Message to log
 */
export const info = (message: string): void => {
  console.log(formatMessage(LogLevel.INFO, message));
};

/**
 * Logs a warning message
 * @param message - Message to log
 */
export const warn = (message: string): void => {
  console.warn(formatMessage(LogLevel.WARN, message));
};

/**
 * Logs an error message
 * @param message - Message to log
 * @param err - Error object
 */
export const error = (message: string, err: Error | null = null): void => {
  console.error(formatMessage(LogLevel.ERROR, message));
  if (err && err.stack) {
    console.error(err.stack);
  }
};

/**
 * Logs a debug message (development only)
 * @param message - Message to log
 */
export const debug = (message: string): void => {
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
