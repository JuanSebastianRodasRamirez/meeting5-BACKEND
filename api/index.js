import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import meetingsRoutes from './routes/meetingsRoutes.js';
import socialAuthRoutes from './routes/socialAuthRoutes.js';
import logger from './utils/logger.js';

dotenv.config();

/**
 * Main Application Entry Point
 * Configures and runs the Express server
 * @module Index
 */

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Global middlewares
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Logging middleware
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server running correctly',
    timestamp: new Date().toISOString()
  });
});

/**
 * Main routes
 */
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/auth/social', socialAuthRoutes);

/**
 * 404 route
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Mode: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
