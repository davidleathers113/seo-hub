import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { PillarService } from '../../../services/PillarService';
import { handleRouteError } from '../../shared/errors';
import { logger } from '../../../utils/log';

const log = logger('routes/pillars/handlers/delete');

export function createDeletePillarHandler(pillarService: PillarService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const success = await pillarService.delete(id, req.user.id);
      
      if (!success) {
        res.status(404).json({
          error: 'Not found',
          message: 'Pillar not found'
        });
        return;
      }

      log.info(`Deleted pillar ${id}`);
      res.status(204).send();
    } catch (error) {
      handleRouteError(error, res);
    }
  };
}
