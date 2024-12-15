import session from 'express-session';
import { RequestHandler } from 'express';
import { logger } from '../utils/log';

const log = logger('session-config');

// Extend express-session types
declare module 'express-session' {
  interface Session {
    views?: number;
    userId?: string;
    lastActivityAt?: Date;
    token?: string;
  }
}

export function createSessionMiddleware(isDbConnected: boolean): RequestHandler {
  // Use memory store for development
  const sessionStore = new session.MemoryStore();

  // Initialize session middleware
  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-do-not-use-in-production',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  });
}

// Session activity logging middleware
export const sessionLoggingHandler: RequestHandler = (req, res, next) => {
  const sess = req.session;
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    log.info("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    log.info(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
};
