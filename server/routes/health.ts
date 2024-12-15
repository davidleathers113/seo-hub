import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

interface HealthResponse {
  status: string;
  timestamp: string;
  version?: string;
  uptime: number;
}

router.get('/', (_req: Request, res: Response) => {
  try {
    const healthData: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Service unavailable'
    });
  }
});

export default router;