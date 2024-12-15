import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/user';

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthUser;
    }
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Development bypass for authentication
    if (process.env.NODE_ENV === 'development') {
        req.user = {
            id: 'be2fd6c8-e974-4927-ab4e-d182ec3c369b',
            email: 'test@example.com'
        };
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = {
            id: typeof decoded === 'object' && 'id' in decoded ? String(decoded.id) : '0',
            email: typeof decoded === 'object' && 'email' in decoded ? String(decoded.email) : ''
        };
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
