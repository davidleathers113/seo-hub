import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { SubpillarService } from '../../../services/SubpillarService';
import { SubpillarRequest, CreateSubpillarRequest } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/subpillars/handlers/create');

type SubpillarAuthenticatedRequest = AuthenticatedRequest & SubpillarRequest;

export function createCreateSubpillarHandler(subpillarService: SubpillarService): BaseHandler {
  return async (req: SubpillarAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { pillarId } = req.params;
      const { title } = req.body;

      const createRequest: CreateSubpillarRequest = {
        title: title.trim(),
        pillarId,
        createdById: req.user.id,
        status: 'draft'
      };

      const subpillar = await subpillarService.create(createRequest);

      log.info(`Created subpillar ${subpillar.id} for pillar ${pillarId}`);
      res.status(201).json({ data: subpillar });
    } catch (error) {
      log.error('Error creating subpillar:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
