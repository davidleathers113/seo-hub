import express, { Request, Response } from 'express';
import { createNicheService } from '../services/NicheService';
import { authenticateWithToken, requireUser } from './middleware/auth';
import { ValidationError } from '../database/mongodb/client';
import { logger } from '../utils/log';
import { User } from '../database/interfaces';

// Extend Express Request to include user
declare module 'express' {
  interface Request {
    user?: User;
  }
}

const router = express.Router();
const nicheService = createNicheService();
const log = logger('api/routes/nicheRoutes');

// List all niches for the authenticated user
router.get('/', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const niches = await nicheService.list(req.user!.id);
    log.info(`Retrieved ${niches.length} niches for user ${req.user!.id}`);
    res.json(niches);
  } catch (error) {
    log.error('Error listing niches:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve niches'
    });
  }
});

// Get a specific niche by ID
router.get('/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const niche = await nicheService.getById(req.params.id, req.user!.id);
    if (!niche) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Niche not found'
      });
    }
    log.info(`Retrieved niche ${req.params.id} for user ${req.user!.id}`);
    res.json(niche);
  } catch (error) {
    log.error('Error getting niche:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve niche'
    });
  }
});

// Create a new niche
router.post('/', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required'
      });
    }

    const niche = await nicheService.create(req.user!.id, name.trim());
    log.info(`Created new niche "${name}" for user ${req.user!.id}`);
    res.status(201).json(niche);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    log.error('Error creating niche:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create niche'
    });
  }
});

// Update a niche
router.put('/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { name, status, progress, pillars } = req.body;
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(status && { status }),
      ...(typeof progress === 'number' && { progress }),
      ...(pillars && { pillars })
    };

    const niche = await nicheService.update(req.params.id, req.user!.id, updateData);
    if (!niche) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Niche not found'
      });
    }

    log.info(`Updated niche ${req.params.id} for user ${req.user!.id}`);
    res.json(niche);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    log.error('Error updating niche:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update niche'
    });
  }
});

// Delete a niche
router.delete('/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const success = await nicheService.delete(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Niche not found'
      });
    }

    log.info(`Deleted niche ${req.params.id} for user ${req.user!.id}`);
    res.status(204).send();
  } catch (error) {
    log.error('Error deleting niche:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete niche'
    });
  }
});

// Generate pillars for a niche
router.post('/:id/pillars', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const niche = await nicheService.generatePillars(req.params.id, req.user!.id);
    if (!niche) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Niche not found'
      });
    }

    log.info(`Generated pillars for niche ${req.params.id} for user ${req.user!.id}`);
    res.json(niche);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    log.error('Error generating pillars:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate pillars'
    });
  }
});

export default router;