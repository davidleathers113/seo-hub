import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { OutlineService } from '../../../services/OutlineService';
import { logger } from '../../../utils/log';

const log = logger('routes/outlines/handlers/delete');

export function createDeleteOutlineHandler(outlineService: OutlineService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const success = await outlineService.delete(id, req.user.id);
      
      if (!success) {
        res.status(404).json({
          error: 'Not found',
          message: 'Outline not found'
        });
        return;
      }

      log.info(`Deleted outline ${id}`);
      res.status(204).send();
    } catch (error) {
      log.error('Error deleting outline:', error);
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
