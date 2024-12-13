import express, { Request as ExpressRequest, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { UserDocument } from '../database/mongodb/models/User';
import { ValidationError } from '../utils/errors';
import { authenticateWithToken, requireUser } from './middleware/auth';
import { logger } from '../utils/logger';
import { sendLLMRequest, LLMProvider, LLMModel } from '../services/llm';
import { createSubpillarService } from '../services/SubpillarService';
import { createPillarService } from '../services/PillarService';
import { PillarDocument } from '../database/mongodb/models/Pillar';
import { SubpillarDocument } from '../database/mongodb/models/Subpillar';

const router = express.Router({ mergeParams: true });
const log = logger('api/routes/subpillarsRoutes');
const subpillarService = createSubpillarService();
const pillarService = createPillarService();

type PillarStatus = 'pending' | 'approved' | 'rejected' | 'in_progress';
type SubpillarStatus = 'draft' | 'active' | 'archived';

// Extend Express Request to include user and pillar
interface AuthenticatedRequest extends ExpressRequest {
  user?: UserDocument;
  params: ParamsDictionary & {
    pillarId?: string;
    id?: string;
  };
  body: any;
  pillar?: PillarDocument;
}

interface UpdateSubpillarRequest {
  title?: string;
  status?: SubpillarStatus;
}

interface CreateSubpillarRequest {
  title: string;
  pillarId: string;
  createdById: string;
  status: SubpillarStatus;
}

// Middleware to load and validate pillar
const loadPillar = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { pillarId } = req.params;
  log.info('Loading pillar:', { pillarId });

  try {
    if (!pillarId) {
      throw new ValidationError('Pillar ID is required');
    }

    const pillar = await pillarService.getById(pillarId);
    if (!pillar) {
      return res.status(404).json({ error: 'Pillar not found' });
    }

    if (pillar.createdById.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to access this pillar' });
    }

    req.pillar = pillar;
    next();
  } catch (error: unknown) {
    log.error('Error loading pillar:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// List subpillars
router.get('/pillars/:pillarId/subpillars',
  authenticateWithToken,
  requireUser,
  loadPillar,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subpillars = await subpillarService.getByPillarId(req.pillar!.id);
      res.json(subpillars);
    } catch (error: unknown) {
      log.error('Error listing subpillars:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate subpillars
router.post('/pillars/:pillarId/subpillars/generate',
  authenticateWithToken,
  requireUser,
  loadPillar,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pillar = req.pillar!;

      if (pillar.status !== 'approved') {
        throw new ValidationError('Can only generate subpillars for approved pillars');
      }

      const prompt = `Generate 3 detailed subpillars for the content pillar: "${pillar.title}".
        Each subpillar should be a specific subtopic or aspect that falls under this main pillar.
        The subpillars should be comprehensive enough to form the basis of detailed content pieces.
        Format the response as a numbered list (1., 2., etc.).`;

      const provider: LLMProvider = 'openai';
      const model: LLMModel = 'gpt-4';
      const response = await sendLLMRequest(provider, model, prompt);
      const subpillarTitles: string[] = response
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, ''));

      if (subpillarTitles.length === 0) {
        throw new ValidationError('Failed to generate valid subpillars from AI response');
      }

      const createdSubpillars = await Promise.all(
        subpillarTitles.map(async (title: string) => {
          const createRequest: CreateSubpillarRequest = {
            title,
            pillarId: pillar.id,
            createdById: req.user!.id,
            status: 'draft'
          };
          return await subpillarService.create(createRequest);
        })
      );

      res.status(201).json(createdSubpillars);
    } catch (error: unknown) {
      log.error('Error generating subpillars:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof Error && error.message === 'AI Service Error') {
        res.status(500).json({
          error: 'Failed to generate subpillars',
          details: 'AI service encountered an error'
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
});

// Update subpillar
router.put('/subpillars/:id',
  authenticateWithToken,
  requireUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body as UpdateSubpillarRequest;

      if (!id) {
        throw new ValidationError('Subpillar ID is required');
      }

      if (updates.status && !['draft', 'active', 'archived'].includes(updates.status)) {
        throw new ValidationError('Invalid status value');
      }

      const subpillar = await subpillarService.update(id, req.user!.id, updates);
      if (!subpillar) {
        return res.status(404).json({ error: 'Subpillar not found' });
      }

      res.json(subpillar);
    } catch (error: unknown) {
      log.error('Error updating subpillar:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
});

// Delete subpillar
router.delete('/subpillars/:id',
  authenticateWithToken,
  requireUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError('Subpillar ID is required');
      }

      const success = await subpillarService.delete(id, req.user!.id);
      if (!success) {
        return res.status(404).json({ error: 'Subpillar not found' });
      }

      res.status(204).send();
    } catch (error: unknown) {
      log.error('Error deleting subpillar:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
});

export default router;