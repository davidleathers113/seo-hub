import { v4 as uuidv4 } from 'uuid';
import { DatabaseClient, Session, SessionCreateInput } from '../database/interfaces';
import { logger } from '../utils/log';

const log = logger('services/SessionService');

export class SessionService {
  constructor(private readonly db: DatabaseClient) {}

  async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<Session> {
    try {
      const now = new Date();
      const sessionData: SessionCreateInput = {
        userId,
        token: uuidv4(),
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
        lastActivityAt: now,
        userAgent,
        ipAddress,
        isActive: true
      };

      const session = await this.db.createSession(sessionData);
      log.info(`Created session for user ${userId}`);
      return session;
    } catch (error) {
      log.error('Error creating session:', error);
      throw error;
    }
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    try {
      const session = await this.db.findSessionByToken(token);
      if (!session) {
        log.warn(`Session not found for token ${token}`);
        return null;
      }
      return session;
    } catch (error) {
      log.error('Error getting session by token:', error);
      throw error;
    }
  }

  async updateSessionActivity(id: string): Promise<Session | null> {
    try {
      const session = await this.db.updateSession(id, {
        lastActivityAt: new Date()
      });
      if (!session) {
        log.warn(`Session not found for id ${id}`);
        return null;
      }
      return session;
    } catch (error) {
      log.error('Error updating session activity:', error);
      throw error;
    }
  }

  async invalidateSession(token: string): Promise<boolean> {
    try {
      const session = await this.db.findSessionByToken(token);
      if (!session) {
        log.warn(`Session not found for token ${token}`);
        return false;
      }
      await this.db.updateSession(session.id, { isActive: false });
      log.info(`Invalidated session ${session.id}`);
      return true;
    } catch (error) {
      log.error('Error invalidating session:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessions = await this.db.findSessionsByUserId(userId);
      return sessions;
    } catch (error) {
      log.error('Error getting user sessions:', error);
      throw error;
    }
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      await this.db.deleteUserSessions(userId);
      log.info(`Invalidated all sessions for user ${userId}`);
    } catch (error) {
      log.error('Error invalidating user sessions:', error);
      throw error;
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      await this.db.cleanupSessions();
      log.info('Cleaned up expired sessions');
    } catch (error) {
      log.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }
}

// Factory function to create SessionService instance
export function createSessionService(db: DatabaseClient): SessionService {
  if (!db) {
    throw new Error('Database client is required for SessionService');
  }
  return new SessionService(db);
}
