import { DatabaseClient, User, UserCreateInput, UserUpdateInput } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/log';
import { ValidationError } from '../database/mongodb/client';
import { generateToken } from '../utils/jwt';
import { validatePassword, generatePasswordHash } from '../utils/password';
import { randomUUID } from 'crypto';

const log = logger('services/UserService');

export class UserService {
  private db: DatabaseClient;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
  }

  async list(): Promise<User[]> {
    try {
      log.info('Listing all users');
      return await this.db.findAllUsers();
    } catch (error) {
      log.error('Error in UserService.list:', error);
      throw error;
    }
  }

  async get(id: string): Promise<User | null> {
    try {
      log.info(`Getting user ${id}`);
      return await this.db.findUserById(id);
    } catch (error) {
      log.error('Error in UserService.get:', error);
      throw error;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      log.info(`Getting user by email ${email}`);
      return await this.db.findUserByEmail(email);
    } catch (error) {
      log.error('Error in UserService.getByEmail:', error);
      throw error;
    }
  }

  async update(id: string, data: UserUpdateInput): Promise<User | null> {
    try {
      log.info(`Updating user ${id}`);
      return await this.db.updateUser(id, data);
    } catch (error) {
      log.error('Error in UserService.update:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      log.info(`Deleting user ${id}`);
      return await this.db.deleteUser(id);
    } catch (error) {
      log.error('Error in UserService.delete:', error);
      throw error;
    }
  }

  async authenticateWithPassword(email: string, password: string): Promise<User | null> {
    try {
      log.info(`Authenticating user ${email} with password`);
      const user = await this.getByEmail(email);
      if (!user) {
        log.info(`User not found: ${email}`);
        return null;
      }

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) {
        log.info(`Invalid password for user: ${email}`);
        return null;
      }

      const updatedUser = await this.update(user.id, {
        lastLoginAt: new Date()
      });

      if (!updatedUser) {
        throw new Error('Failed to update last login time');
      }

      return updatedUser;
    } catch (error) {
      log.error('Error in UserService.authenticateWithPassword:', error);
      throw error;
    }
  }

  async authenticateWithToken(token: string): Promise<User | null> {
    try {
      log.info('Authenticating user with token');
      return await this.db.findUserByToken(token);
    } catch (error) {
      log.error('Error in UserService.authenticateWithToken:', error);
      throw error;
    }
  }

  async regenerateToken(user: User): Promise<User> {
    try {
      log.info(`Regenerating token for user ${user.id}`);
      const updatedUser = await this.update(user.id, {
        token: randomUUID()
      });

      if (!updatedUser) {
        throw new Error('Failed to regenerate token');
      }

      return updatedUser;
    } catch (error) {
      log.error('Error in UserService.regenerateToken:', error);
      throw error;
    }
  }

  async createUser({ email, password, name = '' }: { email: string; password: string; name?: string }): Promise<{ user: User; token: string }> {
    try {
      log.info(`Creating new user: ${email}`);

      if (!email) throw new ValidationError('Email is required');
      if (!password) throw new ValidationError('Password is required');

      const existingUser = await this.getByEmail(email);
      if (existingUser) {
        log.info(`User already exists: ${email}`);
        throw new ValidationError('User with this email already exists');
      }

      const hash = await generatePasswordHash(password);
      const userData: UserCreateInput = {
        email,
        password: hash,
        name,
        token: randomUUID(),
      };

      log.info('Saving new user to database');
      const user = await this.db.createUser(userData);
      log.info(`User created successfully: ${user.id}`);

      const token = generateToken(user);
      log.info('Token generated for new user');

      return { user, token };
    } catch (error) {
      log.error('Error in UserService.createUser:', error);
      throw error;
    }
  }

  async setPassword(user: User, password: string): Promise<User> {
    try {
      log.info(`Setting password for user ${user.id}`);

      if (!password) throw new ValidationError('Password is required');

      const hash = await generatePasswordHash(password);
      const updatedUser = await this.update(user.id, {
        password: hash
      });

      if (!updatedUser) {
        throw new Error('Failed to update password');
      }

      return updatedUser;
    } catch (error) {
      log.error('Error in UserService.setPassword:', error);
      throw error;
    }
  }
}

// Factory function to create UserService instance
export function createUserService(dbClient?: DatabaseClient): UserService {
  return new UserService(dbClient);
}