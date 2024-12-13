import express, { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { authenticateWithToken as auth } from './middleware/auth';
import { NicheService } from '../services/NicheService';
import { User } from '../database/interfaces';

// Extend Request type to include authenticated user
interface AuthenticatedRequest extends Request<ParamsDictionary, any, any, ParsedQs> {
  user: User;
  body: any;
  params: ParamsDictionary;
}

// Type guard to ensure request is authenticated
function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined;
}

export function createNicheRouter(nicheService: NicheService) {
  const router = express.Router();

  router.get('/', auth, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const niches = await nicheService.list(req.user.id);
      res.json(niches);
    } catch (error) {
      console.error('Error fetching niches:', error);
      res.status(500).json({ error: 'Failed to fetch niches' });
    }
  });

  router.post('/', auth, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { name } = req.body;
      const niche = await nicheService.create(req.user.id, name);
      res.status(201).json(niche);
    } catch (error) {
      console.error('Error creating niche:', error);
      res.status(500).json({ error: 'Failed to create niche' });
    }
  });

  router.get('/:id', auth, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const niche = await nicheService.getById(req.params.id, req.user.id);
      if (!niche) {
        return res.status(404).json({ error: 'Niche not found' });
      }
      res.json(niche);
    } catch (error) {
      console.error('Error fetching niche:', error);
      res.status(500).json({ error: 'Failed to fetch niche' });
    }
  });

  router.put('/:id', auth, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const updatedNiche = await nicheService.update(req.params.id, req.user.id, req.body);
      if (!updatedNiche) {
        return res.status(404).json({ error: 'Niche not found' });
      }
      res.json(updatedNiche);
    } catch (error) {
      console.error('Error updating niche:', error);
      res.status(500).json({ error: 'Failed to update niche' });
    }
  });

  router.delete('/:id', auth, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const deleted = await nicheService.delete(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Niche not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting niche:', error);
      res.status(500).json({ error: 'Failed to delete niche' });
    }
  });

  router.post('/:nicheId/pillars/generate', auth, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const pillars = await nicheService.generatePillars(req.params.nicheId, req.user.id);
      res.json(pillars);
    } catch (error) {
      console.error('Error generating pillars:', error);
      res.status(500).json({ error: 'Failed to generate pillars' });
    }
  });

  return router;
}

// Export the default router for backward compatibility
export default createNicheRouter;