import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { OutlineService } from '../../../services/OutlineService';
import { CreateOutlineRequest } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/outlines/handlers/create');

export function createCreateOutlineHandler(outlineService: OutlineService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { subpillarId } = req.params;
      const { title } = req.body as CreateOutlineRequest;

      // Initialize with a single empty section using the title
      const sections = [{
        title,
        contentPoints: [],
        order: 0
      }];

      const outline = await outlineService.create(
        subpillarId,
        req.user.id,
        sections
      );

      log.info(`Created outline for subpillar ${subpillarId}`);
      res.status(201).json({ data: outline });
    } catch (error) {
      log.error('Error creating outline:', error);
      if (error instanceof Error && error.message.includes('required')) {
        res.status(400).json({
          error: 'Validation Error',
          message: error.message
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
