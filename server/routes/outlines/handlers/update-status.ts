import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { OutlineService } from '../../../services/OutlineService';
import { UpdateStatusRequest } from '../types';
import { Outline } from '../../../database/interfaces';
import { logger } from '../../../utils/log';

const log = logger('routes/outlines/handlers/update-status');

type OutlineStatus = Outline['status'];
const validStatuses: OutlineStatus[] = ['draft', 'approved', 'in_progress'];

export function createUpdateStatusHandler(outlineService: OutlineService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateStatusRequest;

      if (!status || !validStatuses.includes(status as OutlineStatus)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Valid status is required (draft, approved, or in_progress)'
        });
        return;
      }

      const outline = await outlineService.updateStatus(id, req.user.id, status as OutlineStatus);
      
      if (!outline) {
        res.status(404).json({
          error: 'Not found',
          message: 'Outline not found'
        });
        return;
      }

      log.info(`Updated status to ${status} for outline ${id}`);
      res.json({ data: outline });
    } catch (error) {
      log.error('Error updating outline status:', error);
      if (error instanceof Error && error.message.includes('Not authorized')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
