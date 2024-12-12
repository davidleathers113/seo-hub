// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const basicRoutes = require("./routes/index");
const { router: authRouter } = require("./routes/auth");  // Properly destructure the router
const nicheRoutes = require('./routes/niches');
const pillarRoutes = require('./routes/pillars');
const articlesRoutes = require('./routes/articles');
const { authenticateWithToken } = require('./routes/middleware/auth');
const UserService = require('./services/user');
const { generateToken } = require('./utils/jwt');
const { logger } = require('./utils/log');
const cors = require("cors");
const net = require('net');
const healthRouter = require('./routes/health');

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

// Database connection
require('./models/init');

console.log("Attempting to connect to database...");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log(`Database connected successfully to ${process.env.DATABASE_URL}`);
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
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
app.use('/api/auth', authRouter);  // Use the auth router for all auth routes except login
app.post('/api/auth/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ error: msg });
  const { email, password } = req.body;

  console.log('Login request received for email:', email);

  if (!email || !password) {
    console.log('Missing email or password in request');
    return sendError('Email and password are required');
  }

  try {
    console.log('Attempting to authenticate user...');
    const user = await UserService.authenticateWithPassword(email, password);
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
    console.error('Error stack:', error.stack);
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
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

async function startServer() {
  if (await portInUse(port)) {
    console.error(`Port ${port} is already in use. Please free up the port and try again.`);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server is now running and listening on port ${port}. http://localhost:${port}`);
  });
}

function portInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => server.once('close', () => resolve(false)).close())
      .listen(port);
  });
}

startServer();
