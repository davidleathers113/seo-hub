import express, { Request, Response } from 'express';
import { createResearchService } from '../services/ResearchService';
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
const researchService = createResearchService();
const log = logger('api/routes/researchRoutes');

// Create a research item
router.post('/subpillars/:subpillarId/research', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { subpillarId } = req.params;
    const { content, source, notes } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Content is required'
      });
    }

    if (!source || typeof source !== 'string' || source.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Source is required'
      });
    }

    const research = await researchService.create(subpillarId, req.user!.id, {
      content: content.trim(),
      source: source.trim(),
      notes: notes?.trim()
    });

    log.info(`Created research ${research.id} for subpillar ${subpillarId}`);
    res.status(201).json(research);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    log.error('Error creating research:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create research'
    });
  }
});

// Get all research items for a subpillar
router.get('/subpillars/:subpillarId/research', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { subpillarId } = req.params;
    const researchItems = await researchService.getBySubpillarId(subpillarId);
    log.info(`Retrieved ${researchItems.length} research items for subpillar ${subpillarId}`);
    res.json(researchItems);
  } catch (error) {
    log.error('Error fetching research items:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch research items'
    });
  }
});

// Update a research item
router.put('/research/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { content, source, notes } = req.body;

    // Validate update fields
    const allowedFields = ['content', 'source', 'notes'];
    const updateFields = Object.keys(req.body);
    const hasInvalidFields = updateFields.some(field => !allowedFields.includes(field));

    if (hasInvalidFields) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid fields in request'
      });
    }

    const updateData = {
      ...(content && { content: content.trim() }),
      ...(source && { source: source.trim() }),
      ...(notes && { notes: notes.trim() })
    };

    const research = await researchService.update(req.params.id, req.user!.id, updateData);
    if (!research) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Research item not found'
      });
    }

    log.info(`Updated research ${req.params.id}`);
    res.json(research);
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
    log.error('Error updating research:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update research'
    });
  }
});

// Delete a research item
router.delete('/research/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const success = await researchService.delete(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Research item not found'
      });
    }

    log.info(`Deleted research ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('Not authorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }
    log.error('Error deleting research:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete research'
    });
  }
});

export default router;