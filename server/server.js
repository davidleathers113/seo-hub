// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const nicheRoutes = require('./routes/niches');
const { authenticateWithToken } = require('./routes/middleware/auth');
const UserService = require('./services/user');
const { generateToken } = require('./utils/jwt');
const logger = require('./utils/log');
const cors = require("cors");

const log = logger('server');

console.log("Backend starting up...");

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

// CORS middleware - moved before routes
app.use(cors({
  origin: 'http://localhost:5174',
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

// Public routes (no authentication required)
app.post('/api/register', authRoutes.registerUser);
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

// Protected auth routes (must come after authenticateWithToken)
app.use('/api/auth', authRoutes.router);

// Other protected routes
app.use(basicRoutes);
app.use('/api/niches', nicheRoutes);

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

console.log(`Attempting to start server on port ${port}...`);

app.listen(port, () => {
  console.log(`Server is now running and listening on port ${port}`);
});