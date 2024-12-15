import { DatabaseClient, User } from '../database/interfaces';
import { logger } from '../utils/logger';
import { generateToken } from '../utils/jwt';
import { generatePasswordHash, validatePassword } from '../utils/password';

const log = logger('UserService');

export class UserService {
  constructor(private db: DatabaseClient) {}

  async list(): Promise<User[]> {
    try {
      log.info('Fetching all users');
      return await this.db.findUsers();
    } catch (error) {
      log.error('Failed to list users', { error });
      throw error;
    }
  }

  async get(id: string): Promise<User | null> {
    try {
      log.info('Fetching user by ID', { userId: id });
      return await this.db.findUserById(id);
    } catch (error) {
      log.error('Failed to get user', { userId: id, error });
      throw error;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      log.info('Fetching user by email', { email });
      const user = await this.db.findUserByEmail(email);
      log.info('User lookup result', { 
        email,
        found: !!user,
        userId: user?.id
      });
      return user;
    } catch (error) {
      log.error('Failed to get user by email', { email, error });
      throw error;
    }
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      log.info('Updating user', { 
        userId: id, 
        fields: Object.keys(data),
        isPasswordUpdate: !!data.password 
      });
      
      if (data.password) {
        data.password = await generatePasswordHash(data.password);
      }
      return await this.db.updateUser(id, data);
    } catch (error) {
      log.error('Failed to update user', { userId: id, error });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      log.info('Deleting user', { userId: id });
      return await this.db.deleteUser(id);
    } catch (error) {
      log.error('Failed to delete user', { userId: id, error });
      throw error;
    }
  }

  async authenticateWithPassword(email: string, password: string): Promise<User | null> {
    try {
      log.info('Attempting password authentication', { email });
      const user = await this.getByEmail(email);
      
      if (!user) {
        log.info('Authentication failed - user not found', { email });
        return null;
      }

      log.debug('Validating password', {
        userId: user.id,
        email: user.email
      });

      const isValid = await validatePassword(password, user.password);
      
      if (!isValid) {
        log.info('Authentication failed - invalid password', { email });
        return null;
      }

      const updatedUser = await this.update(user.id, {
        lastLoginAt: new Date()
      });

      if (!updatedUser) {
        throw new Error('Failed to update last login time');
      }

      log.info('Authentication successful', { userId: user.id, email });
      return updatedUser;
    } catch (error) {
      log.error('Authentication error', {
        email,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }

  async authenticateWithToken(token: string): Promise<User | null> {
    try {
      log.info('Attempting token authentication');
      return await this.db.findUserByToken(token);
    } catch (error) {
      log.error('Token authentication failed', { error });
      throw error;
    }
  }

  async regenerateToken(user: User): Promise<User> {
    try {
      log.info('Regenerating user token', { userId: user.id });
      const token = generateToken({ _id: user.id, email: user.email });
      const updatedUser = await this.update(user.id, { token });

      if (!updatedUser) {
        throw new Error('Failed to regenerate token');
      }

      return updatedUser;
    } catch (error) {
      log.error('Failed to regenerate token', { userId: user.id, error });
      throw error;
    }
  }

  async createUser({ email, password, name = '' }: { email: string; password: string; name?: string }): Promise<User> {
    try {
      log.info('Creating new user', { email, hasName: !!name });

      if (!email) throw new Error('Email is required');
      if (!password) throw new Error('Password is required');

      const existingUser = await this.getByEmail(email);
      if (existingUser) {
        log.info('User creation failed - email already exists', { email });
        throw new Error('User with this email already exists');
      }

      log.debug('Hashing password for new user');
      const hashedPassword = await generatePasswordHash(password);

      const userData = {
        email,
        password: hashedPassword,
        name,
        role: 'user' as const
      };

      log.info('Creating user in database', { email });
      const user = await this.db.createUser(userData);
      log.info('User created successfully', { userId: user.id, email });

      return user;
    } catch (error) {
      log.error('Failed to create user', {
        email,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }
}

// Factory function to create UserService instance
export function createUserService(db: DatabaseClient): UserService {
  return new UserService(db);
}
