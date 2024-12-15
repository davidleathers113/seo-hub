import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { SubpillarService } from '../../../services/SubpillarService';
import { SubpillarRequest } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/subpillars/handlers/list');

type SubpillarAuthenticatedRequest = AuthenticatedRequest & SubpillarRequest;

export function createListSubpillarsHandler(subpillarService: SubpillarService): BaseHandler {
  return async (req: SubpillarAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { pillarId } = req.params;
      
      const subpillars = await subpillarService.getByPillarId(pillarId);
      
      log.info(`Listed subpillars for pillar ${pillarId}`);
      res.json({ data: subpillars });
    } catch (error) {
      log.error('Error listing subpillars:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
