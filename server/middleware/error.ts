import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/log';

const log = logger('error-middleware');

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    log.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    log.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
    });

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
};
