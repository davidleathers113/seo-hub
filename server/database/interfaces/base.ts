import { Document } from 'mongoose';

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DatabaseConfig {
    uri: string;
    dbName?: string;
}

// Base interface for database client with connection methods
export interface BaseClient {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
    ping?(): Promise<boolean>;
}
