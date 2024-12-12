// Load environment variables
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import basicRoutes from './routes/index';
import authRouter from './routes/auth';
import nicheRoutes from './routes/niches';
import pillarRoutes from './routes/pillars';
import articlesRoutes from './routes/articles';
import { authenticateWithToken } from './routes/middleware/auth';
import { createUserService } from './services/UserService';
import { generateToken } from './utils/jwt';
import { logger } from './utils/log';
import cors from 'cors';
import net from 'net';
import healthRouter from './routes/health';
import { User } from './database/interfaces';
import { DatabaseFactory } from './database';

// Load environment variables
dotenv.config();

const log = logger('server');

console.log("Starting backend server...");
console.log("Environment variables:");
console.log("PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "Set" : "Not set");

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: DATABASE_URL or SESSION_SECRET variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3001;
const userService = createUserService();

// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - Allow all origins in development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// Initialize database
console.log("Attempting to connect to database...");

async function initializeDatabase() {
  try {
    const dbClient = await DatabaseFactory.createClient('mongodb', {
      uri: process.env.DATABASE_URL
    });
    console.log(`Database connected successfully to ${process.env.DATABASE_URL}`);
    return dbClient;
  } catch (err) {
    console.error(`Database connection error: ${(err as Error).message}`);
    console.error((err as Error).stack);
    process.exit(1);
  }
}

// Session configuration with connect-mongo
// We'll initialize this after database connection
let sessionMiddleware: express.RequestHandler;

app.on("error", (error: Error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req: Request, res: Response, next: NextFunction) => {
  const sess = req.session;
  // Make session available to all views
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

console.log(`Attempting to start server on port ${port}...`);

// Public routes (no authentication required)
app.use('/api/auth', authRouter);

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const sendError = (msg: string) => res.status(400).json({ error: msg });
  const { email, password } = req.body;

  console.log('Login request received for email:', email);

  if (!email || !password) {
    console.log('Missing email or password in request');
    return sendError('Email and password are required');
  }

  try {
    console.log('Attempting to authenticate user...');
    const user = await userService.authenticateWithPassword(email, password);
    console.log('Authentication result:', user ? 'success' : 'failed');

    if (user) {
      console.log('Generating token for user...');
      const token = generateToken(user);
      return res.json({ user, token });
    } else {
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error('Full login error:', error);
    console.error('Error stack:', (error as Error).stack);
    log.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes (authentication required)
app.use(authenticateWithToken);

// Other protected routes
app.use(basicRoutes);
app.use('/api/niches', nicheRoutes);
app.use('/api', pillarRoutes); // Add pillar routes
app.use('/api/articles', articlesRoutes); // Add articles routes
app.use('/api', healthRouter);

// If no routes handled the request, it's a 404
app.use((req: Request, res: Response) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

async function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => server.once('close', () => resolve(false)).close())
      .listen(port);
  });
}

async function startServer() {
  if (await portInUse(port)) {
    console.error(`Port ${port} is already in use. Please free up the port and try again.`);
    process.exit(1);
  }

  // Initialize database first
  await initializeDatabase();

  // Initialize session middleware after database connection
  sessionMiddleware = session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native' // Use MongoDB's TTL index
    }),
  });

  // Apply session middleware
  app.use(sessionMiddleware);

  app.listen(port, () => {
    console.log(`Server is now running and listening on port ${port}. http://localhost:${port}`);
  });
}

startServer();