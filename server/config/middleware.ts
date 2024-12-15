import express, { Application } from 'express';
import cors from 'cors';
import { createSessionMiddleware, sessionLoggingHandler } from './session';
import { logger } from '../utils/log';

const log = logger('middleware-config');

export function setupMiddleware(app: Application, isDbConnected: boolean): void {
  // Basic Express configuration
  app.enable('json spaces');
  app.enable('strict routing');
  
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS configuration
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  }));

  // Session middleware
  const sessionMiddleware = createSessionMiddleware(isDbConnected);
  app.use(sessionMiddleware);
  app.use(sessionLoggingHandler);

  // Add database status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      database: isDbConnected ? 'connected' : 'disconnected',
      server: 'running',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  log.info('Middleware setup completed');
}
