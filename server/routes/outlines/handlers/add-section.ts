import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { OutlineService } from '../../../services/OutlineService';
import { AddSectionRequest } from '../types';
import { OutlineSection } from '../../../database/interfaces';
import { logger } from '../../../utils/log';

const log = logger('routes/outlines/handlers/add-section');

export function createAddSectionHandler(outlineService: OutlineService): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content, keywords = [] } = req.body as AddSectionRequest;

      if (!title || !content) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Title and content are required'
        });
        return;
      }

      const section: OutlineSection = {
        title,
        contentPoints: [{
          point: content,
          generated: false
        }],
        order: 0 // The service will adjust this based on existing sections
      };

      const outline = await outlineService.addSection(id, req.user.id, section);
      
      if (!outline) {
        res.status(404).json({
          error: 'Not found',
          message: 'Outline not found'
        });
        return;
      }

      log.info(`Added section to outline ${id}`);
      res.json({ data: outline });
    } catch (error) {
      log.error('Error adding outline section:', error);
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
