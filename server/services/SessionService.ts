import { DatabaseClient, Session, SessionCreateInput, SessionUpdateInput } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/logger';
import { ValidationError } from '../database/mongodb/client';
import { randomUUID } from 'crypto';

const log = logger('services/SessionService');

// Default session expiration time (24 hours)
const DEFAULT_SESSION_EXPIRY = 24 * 60 * 60 * 1000;

export class SessionService {
  private db: DatabaseClient;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
  }

  async createSession(userId: string, options: {
    userAgent?: string;
    ipAddress?: string;
    expiresIn?: number;
  } = {}): Promise<Session> {
    try {
      const { userAgent, ipAddress, expiresIn = DEFAULT_SESSION_EXPIRY } = options;

      const sessionData: SessionCreateInput = {
        userId,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + expiresIn),
        userAgent,
        ipAddress
      };

      log.info(`Creating session for user ${userId}`);
      const session = await this.db.createSession(sessionData);
      log.info(`Created session ${session.id} for user ${userId}`);

      return session;
    } catch (error) {
      log.error('Error in SessionService.createSession:', error);
      throw error;
    }
  }

  async validateSession(token: string): Promise<Session | null> {
    try {
      log.info('Validating session token');
      const session = await this.db.findSessionByToken(token);

      if (!session) {
        log.info('Session not found');
        return null;
      }

      if (!session.isActive) {
        log.info(`Session ${session.id} is inactive`);
        return null;
      }

      if (session.expiresAt < new Date()) {
        log.info(`Session ${session.id} has expired`);
        await this.db.deleteSession(session.id);
        return null;
      }

      // Update last activity
      await this.db.updateSession(session.id, {
        lastActivityAt: new Date()
      });

      return session;
    } catch (error) {
      log.error('Error in SessionService.validateSession:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      log.info(`Fetching sessions for user ${userId}`);
      const sessions = await this.db.findSessionsByUserId(userId);
      log.info(`Found ${sessions.length} active sessions for user ${userId}`);
      return sessions;
    } catch (error) {
      log.error('Error in SessionService.getUserSessions:', error);
      throw error;
    }
  }

  async invalidateSession(token: string): Promise<boolean> {
    try {
      log.info('Invalidating session');
      const session = await this.db.findSessionByToken(token);

      if (!session) {
        log.info('Session not found');
        return false;
      }

      await this.db.updateSession(session.id, {
        isActive: false
      });

      log.info(`Invalidated session ${session.id}`);
      return true;
    } catch (error) {
      log.error('Error in SessionService.invalidateSession:', error);
      throw error;
    }
  }

  async invalidateUserSessions(userId: string): Promise<number> {
    try {
      log.info(`Invalidating all sessions for user ${userId}`);
      const count = await this.db.deleteUserSessions(userId);
      log.info(`Invalidated ${count} sessions for user ${userId}`);
      return count;
    } catch (error) {
      log.error('Error in SessionService.invalidateUserSessions:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      log.info('Running session cleanup');
      await this.db.cleanupSessions();
      log.info('Session cleanup completed');
    } catch (error) {
      log.error('Error in SessionService.cleanup:', error);
      throw error;
    }
  }
}

// Factory function to create SessionService instance
export function createSessionService(dbClient?: DatabaseClient): SessionService {
  return new SessionService(dbClient);
}