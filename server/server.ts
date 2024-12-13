// Load environment variables
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction, Application } from 'express';
import session, { Session } from 'express-session';
import MongoStore from 'connect-mongo';
import basicRoutes from './routes/index';
import authRouter, { createAuthRouter } from './routes/auth';
import nicheRoutes, { createNicheRouter } from './routes/niches';
import pillarRoutes from './routes/pillars';
import articlesRoutes from './routes/articles';
import { authenticateWithToken } from './routes/middleware/auth';
import { createUserService } from './services/UserService';
import { createNicheService } from './services/NicheService';
import { createSessionService } from './services/SessionService';
import { generateToken } from './utils/jwt';
import { logger } from './utils/log';
import cors from 'cors';
import net from 'net';
import healthRouter from './routes/health';
import { User } from './database/interfaces';
import { DatabaseFactory } from './database';
import { createPillarRouter } from './routes/pillars';
import { createPillarService } from './services/PillarService';

// Load environment variables
dotenv.config();

const log = logger('server');
const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Declare session middleware
let sessionMiddleware: express.RequestHandler;

// Extend express-session types
declare module 'express-session' {
  interface Session {
    views?: number;
    userId?: string;
    lastActivityAt?: Date;
    token?: string;
  }
}

console.log("Starting backend server...");
console.log("Environment variables:");
console.log("PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "Set" : "Not set");

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: DATABASE_URL or SESSION_SECRET variables in .env missing.");
  process.exit(-1);
}

async function startServer() {
  console.log('Starting server initialization...');

  try {
    // Check port availability
    if (await portInUse(port)) {
      console.error(`Port ${port} is already in use. Please free up the port and try again.`);
      process.exit(1);
    }
    console.log(`Port ${port} is available`);

    // Initialize database first
    console.log('Attempting to connect to database...');
    const dbClient = await DatabaseFactory.createClient('mongodb', {
      uri: process.env.DATABASE_URL
    });
    console.log('Database connected successfully');

    // Initialize session store first
    const sessionStore = MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      ttl: 24 * 60 * 60,
      autoRemove: 'native'
    });

    // Initialize session middleware
    sessionMiddleware = session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      }
    });

    // Initialize services
    console.log('Initializing services...');
    const userService = createUserService(dbClient);
    const nicheService = createNicheService(dbClient);
    const sessionService = createSessionService(dbClient);
    const pillarService = createPillarService(dbClient);
    console.log('Services initialized successfully');

    // Basic middleware setup
    app.enable('json spaces');
    app.enable('strict routing');

    // Apply core middleware in correct order
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }));
    app.use(sessionMiddleware);

    // Session activity logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const sess = req.session;
      res.locals.session = sess;
      if (!sess.views) {
        sess.views = 1;
        console.log("Session created at: ", new Date().toISOString());
      } else {
        sess.views++;
        console.log(
          `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
        );
      }
      next();
    });

    // Health check route (no auth required)
    app.use('/api/health', healthRouter);

    // Auth routes (no auth required)
    app.use('/api/auth', createAuthRouter(userService, sessionService));

    // Apply authentication middleware for protected routes
    app.use(authenticateWithToken);

    // Protected routes
    app.use('/api/niches', createNicheRouter(nicheService));
    app.use('/api/pillars', createPillarRouter(pillarService, nicheService));
    app.use('/api/articles', articlesRoutes);
    app.use('/api', basicRoutes);

    // 404 handler
    app.use((req: Request, res: Response) => {
      res.status(404).json({ error: "Route not found" });
    });

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
      console.log('Available routes:');
      console.log('- GET /api/health');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/auth/register');
      console.log('- GET /api/niches (authenticated)');
      console.log('- POST /api/niches (authenticated)');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    console.error((err as Error).stack);
    process.exit(1);
  }
}

async function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

startServer();