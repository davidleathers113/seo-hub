import { DatabaseClient, User } from '../database/interfaces';
import { generateToken } from '../utils/jwt';
import { validatePassword, generatePasswordHash } from '../utils/password';
import { randomUUID } from 'crypto';
import { DatabaseOperationError, ValidationError } from '../database/mongodb/client';
import { getDatabase } from '../database';

export class UserService {
  constructor(private db: DatabaseClient) {}

  async list(): Promise<User[]> {
    try {
      const users = await this.db.findUsers();
      return users;
    } catch (err) {
      throw new DatabaseOperationError('Failed to list users', 'list', err as Error);
    }
  }

  async get(id: string): Promise<User | null> {
    try {
      return await this.db.findUserById(id);
    } catch (err) {
      throw new DatabaseOperationError('Failed to get user', 'get', err as Error);
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      return await this.db.findUserByEmail(email);
    } catch (err) {
      throw new DatabaseOperationError('Failed to get user by email', 'getByEmail', err as Error);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      return await this.db.updateUser(id, data);
    } catch (err) {
      throw new DatabaseOperationError('Failed to update user', 'update', err as Error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await this.db.deleteUser(id);
    } catch (err) {
      throw new DatabaseOperationError('Failed to delete user', 'delete', err as Error);
    }
  }

  async authenticateWithPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.db.findUserByEmail(email);
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      // Update last login
      const updatedUser = await this.db.updateUser(user.id, {
        lastLoginAt: new Date()
      });

      return updatedUser;
    } catch (err) {
      throw new DatabaseOperationError(
        'Failed to authenticate user with password',
        'authenticateWithPassword',
        err as Error
      );
    }
  }

  async authenticateWithToken(token: string): Promise<User | null> {
    try {
      return await this.db.findUserByToken(token);
    } catch (err) {
      throw new DatabaseOperationError(
        'Failed to authenticate user with token',
        'authenticateWithToken',
        err as Error
      );
    }
  }

  async regenerateToken(user: User): Promise<User> {
    try {
      const newToken = randomUUID();
      const updatedUser = await this.db.updateUser(user.id, { token: newToken });
      if (!updatedUser) {
        throw new ValidationError('User not found');
      }
      return updatedUser;
    } catch (err) {
      throw new DatabaseOperationError(
        'Failed to regenerate user token',
        'regenerateToken',
        err as Error
      );
    }
  }

  async createUser({ email, password, name = '' }: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ user: User; token: string }> {
    if (!email) throw new ValidationError('Email is required');
    if (!password) throw new ValidationError('Password is required');

    try {
      const existingUser = await this.db.findUserByEmail(email);
      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }

      const hash = await generatePasswordHash(password);
      const token = randomUUID();

      const user = await this.db.createUser({
        email,
        password: hash,
        name,
        token,
        isActive: true,
        lastLoginAt: new Date()
      });

      const authToken = generateToken(user);
      return { user, token: authToken };
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new DatabaseOperationError(
        'Failed to create user',
        'createUser',
        err as Error
      );
    }
  }

  async setPassword(user: User, password: string): Promise<User> {
    if (!password) throw new ValidationError('Password is required');

    try {
      const hash = await generatePasswordHash(password);
      const updatedUser = await this.db.updateUser(user.id, { password: hash });
      if (!updatedUser) {
        throw new ValidationError('User not found');
      }
      return updatedUser;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new DatabaseOperationError(
        'Failed to set user password',
        'setPassword',
        err as Error
      );
    }
  }
}

// Factory function to create UserService instances
export function createUserService(db: DatabaseClient = getDatabase()): UserService {
  return new UserService(db);
}

// Export a default instance using the default database
export default createUserService();