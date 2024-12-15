import { BaseEntity } from './base';

export interface User extends BaseEntity {
    email: string;
    password: string;
    name?: string;
    token?: string;
    lastLoginAt?: Date;
    isActive?: boolean;
    role?: 'user' | 'admin';
}

export interface Session extends BaseEntity {
    userId: string;
    token: string;
    expiresAt: Date;
    lastActivityAt: Date;
    isActive: boolean;
    userAgent?: string;
    ipAddress?: string;
}

export interface SessionCreateInput extends Omit<Session, keyof BaseEntity> {}
export interface SessionUpdateInput extends Partial<Omit<Session, keyof BaseEntity>> {}

export interface UserClient {
    // User operations
    findUsers(): Promise<User[]>;
    findUserById(id: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByToken(token: string): Promise<User | null>;
    createUser(data: Omit<User, keyof BaseEntity>): Promise<User>;
    updateUser(id: string, data: Partial<User>): Promise<User | null>;
    deleteUser(id: string): Promise<boolean>;

    // Session operations
    createSession(data: SessionCreateInput): Promise<Session>;
    findSessionById(id: string): Promise<Session | null>;
    findSessionByToken(token: string): Promise<Session | null>;
    findSessionsByUserId(userId: string): Promise<Session[]>;
    updateSession(id: string, data: SessionUpdateInput): Promise<Session | null>;
    deleteSession(id: string): Promise<boolean>;
    deleteExpiredSessions(): Promise<number>;
    deleteUserSessions(userId: string): Promise<number>;
    cleanupSessions(): Promise<void>;
}
