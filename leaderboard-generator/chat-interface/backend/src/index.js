/**
 * Leaderboard Generator Chat Interface Backend
 * 
 * This is the main entry point for the backend server.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { initializeLLMService, shutdownLLMService } from './services/llmService.js';
import { initializeConfigService, shutdownConfigService } from './services/configService.js';
import logger from './utils/logger.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api/v1', routes);

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    // Serve index.html for any routes not handled by the API
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize services
async function initializeServices() {
  try {
    // Ensure config directory exists
    const configDir = path.join(__dirname, '..', 'config');
    await fs.ensureDir(configDir);
    
    // Initialize services
    await initializeLLMService();
    await initializeConfigService();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    process.exit(1);
  }
}

// Start the server
async function startServer() {
  try {
    // Initialize services
    await initializeServices();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api/v1`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('Running in development mode');
      } else {
        logger.info('Running in production mode');
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down server...');
  
  try {
    // Shutdown services
    await shutdownLLMService();
    await shutdownConfigService();
    
    logger.info('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Made with Bob