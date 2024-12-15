import express, { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { authenticateToken } from '../middleware/auth';
import { NicheService } from '../services/NicheService';
import { AuthUser } from '../types/user';
import { logger } from '../utils/log';

const log = logger('niche-routes');

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function createNicheRouter(nicheService: NicheService) {
  const router = express.Router();

  const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response) => Promise<any>) => {
    return (req: AuthenticatedRequest, res: Response) => {
      Promise.resolve(fn(req, res)).catch(error => {
        log.error('Unhandled error in niche router:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
        });
      });
    };
  };

  router.get('/', authenticateToken as express.RequestHandler, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    log.info('GET /api/niches - Request received');
    log.info('User:', req.user);

    if (!req.user?.id) {
      log.warn('GET /api/niches - User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      log.info('GET /api/niches - Fetching niches for user:', req.user.id);
      const niches = await nicheService.list(req.user.id);
      log.info('GET /api/niches - Found niches:', niches);
      res.json(niches);
    } catch (error) {
      log.error('GET /api/niches - Error:', error);
      throw error;
    }
  }));

  router.post('/', authenticateToken as express.RequestHandler, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    log.info('POST /api/niches - Request received');
    log.info('User:', req.user);
    log.info('Body:', req.body);

    if (!req.user?.id) {
      log.warn('POST /api/niches - User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { name } = req.body;
      if (!name) {
        log.warn('POST /api/niches - Name is required');
        return res.status(400).json({ error: 'Name is required' });
      }

      log.info('POST /api/niches - Creating niche:', name);
      const niche = await nicheService.create(req.user.id, name);
      log.info('POST /api/niches - Created niche:', niche);
      res.status(201).json(niche);
    } catch (error) {
      log.error('POST /api/niches - Error:', error);
      throw error;
    }
  }));

  router.get('/:id', authenticateToken as express.RequestHandler, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    log.info('GET /api/niches/:id - Request received');
    log.info('User:', req.user);
    log.info('Params:', req.params);

    if (!req.user?.id) {
      log.warn('GET /api/niches/:id - User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const niche = await nicheService.getById(req.params.id, req.user.id);
      if (!niche) {
        log.warn('GET /api/niches/:id - Niche not found');
        return res.status(404).json({ error: 'Niche not found' });
      }
      log.info('GET /api/niches/:id - Found niche:', niche);
      res.json(niche);
    } catch (error) {
      log.error('GET /api/niches/:id - Error:', error);
      throw error;
    }
  }));

  router.put('/:id', authenticateToken as express.RequestHandler, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    log.info('PUT /api/niches/:id - Request received');
    log.info('User:', req.user);
    log.info('Params:', req.params);
    log.info('Body:', req.body);

    if (!req.user?.id) {
      log.warn('PUT /api/niches/:id - User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const updatedNiche = await nicheService.update(req.params.id, req.user.id, req.body);
      if (!updatedNiche) {
        log.warn('PUT /api/niches/:id - Niche not found');
        return res.status(404).json({ error: 'Niche not found' });
      }
      log.info('PUT /api/niches/:id - Updated niche:', updatedNiche);
      res.json(updatedNiche);
    } catch (error) {
      log.error('PUT /api/niches/:id - Error:', error);
      throw error;
    }
  }));

  router.delete('/:id', authenticateToken as express.RequestHandler, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    log.info('DELETE /api/niches/:id - Request received');
    log.info('User:', req.user);
    log.info('Params:', req.params);

    if (!req.user?.id) {
      log.warn('DELETE /api/niches/:id - User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const deleted = await nicheService.delete(req.params.id, req.user.id);
      if (!deleted) {
        log.warn('DELETE /api/niches/:id - Niche not found');
        return res.status(404).json({ error: 'Niche not found' });
      }
      log.info('DELETE /api/niches/:id - Deleted niche:', req.params.id);
      res.status(204).send();
    } catch (error) {
      log.error('DELETE /api/niches/:id - Error:', error);
      throw error;
    }
  }));

  router.post('/:nicheId/pillars/generate', authenticateToken as express.RequestHandler, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    log.info('POST /api/niches/:nicheId/pillars/generate - Request received');
    log.info('User:', req.user);
    log.info('Params:', req.params);

    if (!req.user?.id) {
      log.warn('POST /api/niches/:nicheId/pillars/generate - User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const pillars = await nicheService.generatePillars(req.params.nicheId, req.user.id);
      log.info('POST /api/niches/:nicheId/pillars/generate - Generated pillars:', pillars);
      res.json(pillars);
    } catch (error) {
      log.error('POST /api/niches/:nicheId/pillars/generate - Error:', error);
      throw error;
    }
  }));

  return router;
}

export default createNicheRouter;
