import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { PillarService } from '../../../services/PillarService';
import { handleRouteError } from '../../shared/errors';
import { PillarUpdateRequest } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/pillars/handlers/update');

export function createUpdatePillarHandler(pillarService: PillarService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: PillarUpdateRequest = {
        title: req.body.title?.trim(),
        status: req.body.status
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof PillarUpdateRequest] === undefined) {
          delete updateData[key as keyof PillarUpdateRequest];
        }
      });

      const pillar = await pillarService.update(id, req.user.id, updateData);
      if (!pillar) {
        res.status(404).json({
          error: 'Not found',
          message: 'Pillar not found'
        });
        return;
      }

      log.info(`Updated pillar ${id}`);
      res.json({ data: pillar });
    } catch (error) {
      handleRouteError(error, res);
    }
  };
}
