import express, { Router } from 'express';
import { PillarService } from '../../services/PillarService';
import { NicheService } from '../../services/NicheService';
import { authenticateWithToken, requireUser } from '../middleware/auth';
import { validateRequest, handleAsyncRoute } from '../shared/middleware';
import { createGeneratePillarsHandler } from './handlers/generate';
import { createUpdatePillarHandler } from './handlers/update';
import { createListPillarsHandler } from './handlers/list';
import { createCreatePillarHandler } from './handlers/create';
import { createGetPillarHandler } from './handlers/get';
import { createDeletePillarHandler } from './handlers/delete';
import { createApprovePillarHandler } from './handlers/approve';
import { createPillarSchema, updatePillarSchema, generatePillarSchema } from './types';
import { logger } from '../../utils/log';

const log = logger('routes/pillars');

export function createPillarRouter(
  pillarService: PillarService,
  nicheService: NicheService
): Router {
  const router = express.Router();

  // Create handlers
  const generatePillars = createGeneratePillarsHandler(pillarService, nicheService);
  const updatePillar = createUpdatePillarHandler(pillarService);
  const listPillars = createListPillarsHandler(pillarService);
  const createPillar = createCreatePillarHandler(pillarService);
  const getPillar = createGetPillarHandler(pillarService);
  const deletePillar = createDeletePillarHandler(pillarService);
  const approvePillar = createApprovePillarHandler(pillarService);

  // Register routes with middleware
  router.get(
    '/pillars',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(listPillars)
  );

  router.post(
    '/pillars',
    authenticateWithToken,
    requireUser,
    validateRequest(createPillarSchema),
    handleAsyncRoute(createPillar)
  );

  router.get(
    '/pillars/:id',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(getPillar)
  );

  router.put(
    '/pillars/:id',
    authenticateWithToken,
    requireUser,
    validateRequest(updatePillarSchema),
    handleAsyncRoute(updatePillar)
  );

  router.delete(
    '/pillars/:id',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(deletePillar)
  );

  router.put(
    '/pillars/:id/approve',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(approvePillar)
  );

  router.post(
    '/niches/:nicheId/pillars/generate',
    authenticateWithToken,
    requireUser,
    validateRequest(generatePillarSchema),
    handleAsyncRoute(generatePillars)
  );

  // Log successful router creation
  log.info('Pillar router created successfully');

  return router;
}

export default createPillarRouter;
