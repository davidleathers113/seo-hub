import express, { Request, Response, Router } from 'express';
import { logger } from '../utils/log';
import { authenticateToken } from '../middleware/auth';
import { DashboardService } from '../services/DashboardService';
import { AuthUser } from '../types/user';

const log = logger('dashboard-routes');

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function createDashboardRouter(dashboardService: DashboardService): Router {
  const router = express.Router();

  // GET /api/dashboard/stats
  router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const stats = await dashboardService.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      log.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  return router;
}

export default createDashboardRouter;
