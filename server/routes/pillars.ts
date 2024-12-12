import express, { Request, Response } from 'express';
import { createPillarService } from '../services/PillarService';
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
const pillarService = createPillarService();
const nicheService = createNicheService();
const log = logger('api/routes/pillarRoutes');

// Create a pillar manually
router.post('/niches/:nicheId/pillars', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { nicheId } = req.params;
    const { title, status } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title is required'
      });
    }

    const pillar = await pillarService.create(nicheId, req.user!.id, {
      title: title.trim(),
      status: status || 'pending',
      nicheId,
      createdById: req.user!.id
    });

    log.info(`Created pillar ${pillar.id} for niche ${nicheId}`);
    res.status(201).json(pillar);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    log.error('Error creating pillar:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create pillar'
    });
  }
});

// Generate pillars using AI
router.post('/niches/:nicheId/pillars/generate', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { nicheId } = req.params;

    const niche = await nicheService.generatePillars(nicheId, req.user!.id);
    if (!niche) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Niche not found'
      });
    }

    // Create pillar documents from the generated pillars
    const pillars = await pillarService.createMany(nicheId, req.user!.id,
      niche.pillars.map(pillar => ({
        title: pillar.title,
        status: pillar.status,
        nicheId,
        createdById: req.user!.id
      }))
    );

    log.info(`Generated ${pillars.length} pillars for niche ${nicheId}`);
    res.status(201).json({ data: pillars });
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

// Get all pillars for a niche
router.get('/niches/:nicheId/pillars', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { nicheId } = req.params;
    const pillars = await pillarService.getByNicheId(nicheId);
    log.info(`Retrieved ${pillars.length} pillars for niche ${nicheId}`);
    res.json(pillars);
  } catch (error) {
    log.error('Error fetching pillars:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch pillars'
    });
  }
});

// Approve a pillar
router.put('/pillars/:id/approve', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const pillar = await pillarService.approve(req.params.id, req.user!.id);
    if (!pillar) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Pillar not found'
      });
    }

    log.info(`Approved pillar ${req.params.id}`);
    res.json(pillar);
  } catch (error) {
    if (error instanceof ValidationError) {
      if (error.message.includes('already approved')) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.message
        });
      }
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
      }
    }
    log.error('Error approving pillar:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to approve pillar'
    });
  }
});

// Update a pillar
router.put('/pillars/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { title, status } = req.body;

    // Validate update fields
    const allowedFields = ['title', 'status'];
    const updateFields = Object.keys(req.body);
    const hasInvalidFields = updateFields.some(field => !allowedFields.includes(field));

    if (hasInvalidFields) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid fields in request'
      });
    }

    const updateData = {
      ...(title && { title: title.trim() }),
      ...(status && { status })
    };

    const pillar = await pillarService.update(req.params.id, req.user!.id, updateData);
    if (!pillar) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Pillar not found'
      });
    }

    log.info(`Updated pillar ${req.params.id}`);
    res.json(pillar);
  } catch (error) {
    if (error instanceof ValidationError) {
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
      }
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    log.error('Error updating pillar:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update pillar'
    });
  }
});

// Delete a pillar
router.delete('/pillars/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const success = await pillarService.delete(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Pillar not found'
      });
    }

    log.info(`Deleted pillar ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('Not authorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }
    log.error('Error deleting pillar:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete pillar'
    });
  }
});

export default router;