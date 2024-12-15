import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { PillarService } from '../../../services/PillarService';
import { handleRouteError } from '../../shared/errors';
import { logger } from '../../../utils/log';

const log = logger('routes/pillars/handlers/get');

export function createGetPillarHandler(pillarService: PillarService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const pillar = await pillarService.getById(id);
      
      if (!pillar) {
        res.status(404).json({
          error: 'Not found',
          message: 'Pillar not found'
        });
        return;
      }

      log.info(`Retrieved pillar ${id}`);
      res.json({ data: pillar });
    } catch (error) {
      handleRouteError(error, res);
    }
  };
}
