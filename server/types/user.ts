export interface User {
    id: string;
    email: string;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AuthUser {
    id: string;
    email: string;
}
