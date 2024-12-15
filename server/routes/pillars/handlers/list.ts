import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { PillarService } from '../../../services/PillarService';
import { handleRouteError } from '../../shared/errors';
import { logger } from '../../../utils/log';

const log = logger('routes/pillars/handlers/list');

export function createListPillarsHandler(pillarService: PillarService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { nicheId } = req.query;
      
      if (typeof nicheId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'nicheId query parameter is required'
        });
        return;
      }

      const pillars = await pillarService.getByNicheId(nicheId);

      log.info(`Listed pillars for niche ${nicheId}`);
      res.json({ data: pillars });
    } catch (error) {
      handleRouteError(error, res);
    }
  };
}
