import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { PillarService } from '../../../services/PillarService';
import { handleRouteError } from '../../shared/errors';
import { PillarCreateRequest } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/pillars/handlers/create');

export function createCreatePillarHandler(pillarService: PillarService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { nicheId, title, status = 'pending' }: PillarCreateRequest = req.body;

      const pillar = await pillarService.create(nicheId, req.user.id, {
        title: title.trim(),
        nicheId,
        status,
        createdById: req.user.id
      });

      log.info(`Created pillar ${pillar.id} for niche ${nicheId}`);
      res.status(201).json({ data: pillar });
    } catch (error) {
      handleRouteError(error, res);
    }
  };
}
