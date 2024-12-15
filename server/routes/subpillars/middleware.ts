import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
import { PillarService } from '../../services/PillarService';
import { SubpillarRequest } from './types';
import { logger } from '../../utils/log';

const log = logger('routes/subpillars/middleware');

type SubpillarAuthenticatedRequest = AuthenticatedRequest & SubpillarRequest;

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function createLoadPillarMiddleware(pillarService: PillarService) {
  return async (
    req: SubpillarAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { pillarId } = req.params;
    log.info('Loading pillar:', { pillarId });

    try {
      if (!pillarId) {
        throw new ValidationError('Pillar ID is required');
      }

      const pillar = await pillarService.getById(pillarId);
      if (!pillar) {
        res.status(404).json({ error: 'Pillar not found' });
        return;
      }

      if (pillar.createdById !== req.user.id) {
        res.status(403).json({ error: 'Not authorized to access this pillar' });
        return;
      }

      req.pillar = pillar as any; // Type assertion since we know the structure matches
      next();
    } catch (error) {
      log.error('Error loading pillar:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
