import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { PillarService } from '../../../services/PillarService';
import { NicheService } from '../../../services/NicheService';
import { handleRouteError } from '../../shared/errors';
import { PillarStatus } from '../types';
import { logger } from '../../../utils/log';

const log = logger('routes/pillars/handlers/generate');

export function createGeneratePillarsHandler(
  pillarService: PillarService,
  nicheService: NicheService
): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { nicheId } = req.params;

      // Generate pillars using niche service
      const niche = await nicheService.generatePillars(nicheId, req.user.id);
      if (!niche) {
        res.status(404).json({
          error: 'Not found',
          message: 'Niche not found'
        });
        return;
      }

      // Create pillar documents from the generated pillars
      const pillars = await pillarService.createMany(
        nicheId,
        req.user.id,
        (niche as any).pillars.map((pillar: any) => ({
          title: pillar.title,
          status: (pillar.status || 'pending') as PillarStatus,
          nicheId,
          createdById: req.user.id
        }))
      );

      log.info(`Generated ${pillars.length} pillars for niche ${nicheId}`);
      res.status(201).json({ data: pillars });
    } catch (error) {
      handleRouteError(error, res);
    }
  };
}
