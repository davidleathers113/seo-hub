import express from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/log';
import { initializeDatabase } from './config/database';
import { setupMiddleware } from './config/middleware';
import { setupRoutes } from './config/routes';
import { portInUse } from './utils/port';

// Load environment variables
dotenv.config();

const log = logger('server');
const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

async function startServer() {
  log.info('Starting server initialization...');

  try {
    // Check port availability
    if (await portInUse(port)) {
      log.error(`Port ${port} is already in use. Please free up the port and try again.`);
      process.exit(1);
    }

    // Initialize database
    const dbClient = await initializeDatabase();
    const isDbConnected = await dbClient.healthCheck();

    // Setup middleware and routes
    setupMiddleware(app, isDbConnected);
    setupRoutes(app, dbClient);

    // Start the server
    app.listen(port, () => {
      log.info(`Server is running at http://localhost:${port}`);
      log.info('Server Status:');
      log.info(`- Database: ${isDbConnected ? 'Connected' : 'Disconnected (running with limited functionality)'}`);
      log.info(`- Environment: ${process.env.NODE_ENV || 'development'}`);
      log.info('\nAvailable routes:');
      log.info('- GET /api/status (Check system status)');
      log.info('- GET /api/health');
      log.info('- POST /api/auth/login');
      log.info('- POST /api/auth/register');
      log.info('- GET /api/niches (authenticated)');
      log.info('- POST /api/niches (authenticated)');
      log.info('- GET /api/workflow/llms (authenticated)');
      log.info('- GET /api/workflow/settings (authenticated)');
    });
  } catch (error) {
    log.error('Error during server initialization:', error);
    // Don't exit on initialization error, try to run with limited functionality
    log.warn('Server starting with limited functionality');
  }
}

// Start server with error handling
startServer().catch(error => {
  log.error('Failed to start server:', error);
  log.warn('Attempting to run with limited functionality...');
});
