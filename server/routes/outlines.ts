import express, { Request as ExpressRequest, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { User } from '../database/mongodb/models/User';
import { OutlineSection } from '../database/interfaces';
import { ValidationError } from '../utils/errors';
import { authenticateWithToken, requireUser } from './middleware/auth';
import { log } from '../utils/logger';
import { createOutlineService } from '../services/OutlineService';

const router = express.Router();
const outlineService = createOutlineService();

// Extend Express Request to include user
interface AuthenticatedRequest extends ExpressRequest {
  user?: User;
  params: ParamsDictionary;
  body: any;
}

interface CreateOutlineRequest {
  title: string;
  description?: string;
}

interface UpdateSectionsRequest {
  sections: OutlineSection[];
}

interface AddSectionRequest {
  title: string;
  content: string;
  keywords?: string[];
}

interface UpdateStatusRequest {
  status: string;
}

// Create an outline
router.post('/subpillars/:subpillarId/outline', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subpillarId } = req.params;
    const input = req.body as CreateOutlineRequest;

    if (!input.title) {
      throw new ValidationError('Title is required');
    }

    const outline = await outlineService.create(subpillarId, input.title, input.description || '', req.user!.id);
    res.json(outline);
  } catch (error) {
    log.error('Error creating outline:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get outline by subpillar ID
router.get('/subpillars/:subpillarId/outline', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subpillarId } = req.params;
    const outline = await outlineService.getBySubpillarId(subpillarId);
    if (!outline) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Outline not found'
      });
    }
    log.info(`Retrieved outline for subpillar ${subpillarId}`);
    res.json(outline);
  } catch (error) {
    log.error('Error fetching outline:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch outline'
    });
  }
});

// Get outline by ID
router.get('/outlines/:id', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const outline = await outlineService.getById(req.params.id);
    if (!outline) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Outline not found'
      });
    }
    log.info(`Retrieved outline ${req.params.id}`);
    res.json(outline);
  } catch (error) {
    log.error('Error fetching outline:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch outline'
    });
  }
});

// Update outline sections
router.put('/outlines/:id', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const input = req.body as UpdateSectionsRequest;

    if (!Array.isArray(input.sections)) {
      throw new ValidationError('Sections must be an array');
    }

    const outline = await outlineService.updateSections(req.params.id, input.sections, req.user!.id);
    res.json(outline);
  } catch (error) {
    log.error('Error updating outline sections:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Add section to outline
router.post('/outlines/:id/sections', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const input = req.body as AddSectionRequest;

    if (!input.title || !input.content) {
      throw new ValidationError('Title and content are required');
    }

    const section: OutlineSection = {
      title: input.title,
      content: input.content,
      keywords: input.keywords || []
    };

    const outline = await outlineService.addSection(req.params.id, section, req.user!.id);
    res.json(outline);
  } catch (error) {
    log.error('Error adding outline section:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update a specific section
router.put('/outlines/:id/sections/:index', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const section = req.body;
    const sectionIndex = parseInt(req.params.index, 10);

    if (isNaN(sectionIndex)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid section index'
      });
    }

    if (!section || typeof section !== 'object') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid section data'
      });
    }

    const outline = await outlineService.updateSection(req.params.id, req.user!.id, sectionIndex, section);
    if (!outline) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Outline not found'
      });
    }

    log.info(`Updated section ${sectionIndex} in outline ${req.params.id}`);
    res.json(outline);
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
    log.error('Error updating section:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update section'
    });
  }
});

// Update outline status
router.put('/outlines/:id/status', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const input = req.body as UpdateStatusRequest;

    if (!input.status) {
      throw new ValidationError('Status is required');
    }

    const outline = await outlineService.updateStatus(req.params.id, input.status, req.user!.id);
    res.json(outline);
  } catch (error) {
    log.error('Error updating outline status:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete an outline
router.delete('/outlines/:id', authenticateWithToken, requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await outlineService.delete(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Outline not found'
      });
    }

    log.info(`Deleted outline ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('Not authorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }
    log.error('Error deleting outline:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete outline'
    });
  }
});

export default router;