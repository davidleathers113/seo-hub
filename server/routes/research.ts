import express, { Request, Response, Router } from 'express';
import { createResearchService } from '../services/ResearchService';
import { authenticateWithToken, requireUser } from './middleware/auth';
import { ValidationError } from '../database/mongodb/client';
import { logger } from '../utils/log';
import { ResearchService } from '../services/ResearchService';

const log = logger('api/routes/researchRoutes');

export function createResearchRouter(researchService: ResearchService): Router {
  const router = express.Router();

  // Create a research item
  router.post('/subpillars/:subpillarId/research', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
    try {
      const { subpillarId } = req.params;
      const { content, source, notes, relevance } = req.body;

      if (!content || !source) {
        return res.status(400).json({
          error: 'Content and source are required'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const research = await researchService.create(subpillarId, req.user.id, {
        content: content.trim(),
        source: source.trim(),
        notes: notes?.trim(),
        relevance: relevance || 5 // Default relevance if not provided
      });

      log.info(`Created research ${research.id} for subpillar ${subpillarId}`);
      res.status(201).json(research);
    } catch (error) {
      log.error('Error creating research:', error);
      return res.status(500).json({
        error: 'Failed to create research'
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
      const { content, source, notes, relevance } = req.body;

      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const research = await researchService.update(req.params.id, req.user.id, {
        content: content?.trim(),
        source: source?.trim(),
        notes: notes?.trim(),
        relevance
      });

      if (!research) {
        return res.status(404).json({
          error: 'Research not found'
        });
      }

      log.info(`Updated research ${req.params.id}`);
      res.json(research);
    } catch (error) {
      log.error('Error updating research:', error);
      return res.status(500).json({
        error: 'Failed to update research'
      });
    }
  });

  // Delete a research item
  router.delete('/research/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const success = await researchService.delete(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({
          error: 'Research not found'
        });
      }

      log.info(`Deleted research ${req.params.id}`);
      res.status(204).send();
    } catch (error) {
      log.error('Error deleting research:', error);
      return res.status(500).json({
        error: 'Failed to delete research'
      });
    }
  });

  return router;
}

export default createResearchRouter;
