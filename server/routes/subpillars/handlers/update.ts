import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { SubpillarService } from '../../../services/SubpillarService';
import { UpdateSubpillarRequest } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/subpillars/handlers/update');

export function createUpdateSubpillarHandler(subpillarService: SubpillarService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateSubpillarRequest = {
        title: req.body.title?.trim(),
        status: req.body.status
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateSubpillarRequest] === undefined) {
          delete updateData[key as keyof UpdateSubpillarRequest];
        }
      });

      const subpillar = await subpillarService.update(id, req.user.id, updateData);
      if (!subpillar) {
        res.status(404).json({
          error: 'Not found',
          message: 'Subpillar not found'
        });
        return;
      }

      log.info(`Updated subpillar ${id}`);
      res.json({ data: subpillar });
    } catch (error) {
      log.error('Error updating subpillar:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
