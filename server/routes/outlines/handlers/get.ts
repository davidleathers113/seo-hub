import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { OutlineService } from '../../../services/OutlineService';
import { logger } from '../../../utils/log';

const log = logger('routes/outlines/handlers/get');

export function createGetOutlineHandler(outlineService: OutlineService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const outline = await outlineService.getById(id);
      
      if (!outline) {
        res.status(404).json({
          error: 'Not found',
          message: 'Outline not found'
        });
        return;
      }

      log.info(`Retrieved outline ${id}`);
      res.json({ data: outline });
    } catch (error) {
      log.error('Error fetching outline:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch outline'
      });
    }
  };
}

export function createGetOutlineBySubpillarHandler(outlineService: OutlineService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { subpillarId } = req.params;
      
      const outline = await outlineService.getBySubpillarId(subpillarId);
      
      if (!outline) {
        res.status(404).json({
          error: 'Not found',
          message: 'Outline not found'
        });
        return;
      }

      log.info(`Retrieved outline for subpillar ${subpillarId}`);
      res.json({ data: outline });
    } catch (error) {
      log.error('Error fetching outline:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch outline'
      });
    }
  };
}
