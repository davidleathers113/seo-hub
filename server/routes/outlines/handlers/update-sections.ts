import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { OutlineService } from '../../../services/OutlineService';
import { UpdateSectionsRequest } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/outlines/handlers/update-sections');

export function createUpdateSectionsHandler(outlineService: OutlineService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { sections } = req.body as UpdateSectionsRequest;

      if (!Array.isArray(sections)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Sections must be an array'
        });
        return;
      }

      const outline = await outlineService.update(id, req.user.id, { sections });
      
      if (!outline) {
        res.status(404).json({
          error: 'Not found',
          message: 'Outline not found'
        });
        return;
      }

      log.info(`Updated sections for outline ${id}`);
      res.json({ data: outline });
    } catch (error) {
      log.error('Error updating outline sections:', error);
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
