import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { SubpillarService } from '../../../services/SubpillarService';
import { logger } from '../../../utils/log';

const log = logger('routes/subpillars/handlers/delete');

export function createDeleteSubpillarHandler(subpillarService: SubpillarService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const success = await subpillarService.delete(id, req.user.id);
      if (!success) {
        res.status(404).json({
          error: 'Not found',
          message: 'Subpillar not found'
        });
        return;
      }

      log.info(`Deleted subpillar ${id}`);
      res.status(204).send();
    } catch (error) {
      log.error('Error deleting subpillar:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
