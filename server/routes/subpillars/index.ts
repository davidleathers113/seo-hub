import express, { Router } from 'express';
import { SubpillarService } from '../../services/SubpillarService';
import { PillarService } from '../../services/PillarService';
import { authenticateWithToken, requireUser, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, handleAsyncRoute } from '../shared/middleware';
import { createLoadPillarMiddleware } from './middleware';
import { createListSubpillarsHandler } from './handlers/list';
import { createCreateSubpillarHandler } from './handlers/create';
import { createUpdateSubpillarHandler } from './handlers/update';
import { createDeleteSubpillarHandler } from './handlers/delete';
import { createGenerateSubpillarsHandler } from './handlers/generate';
import { createSubpillarSchema, updateSubpillarSchema } from './types';
import { logger } from '../../utils/log';

const log = logger('routes/subpillars');

export function createSubpillarRouter(
  subpillarService: SubpillarService,
  pillarService: PillarService
): Router {
  const router = express.Router();

  // Create middleware
  const loadPillar = createLoadPillarMiddleware(pillarService);

  // Create handlers
  const listSubpillars = createListSubpillarsHandler(subpillarService);
  const createSubpillar = createCreateSubpillarHandler(subpillarService);
  const updateSubpillar = createUpdateSubpillarHandler(subpillarService);
  const deleteSubpillar = createDeleteSubpillarHandler(subpillarService);
  const generateSubpillars = createGenerateSubpillarsHandler(subpillarService);

  // Register routes with middleware
  router.get(
    '/pillars/:pillarId/subpillars',
    authenticateWithToken,
    requireUser,
    loadPillar as any, // Type assertion needed due to middleware chain typing
    handleAsyncRoute(listSubpillars)
  );

  router.post(
    '/pillars/:pillarId/subpillars',
    authenticateWithToken,
    requireUser,
    loadPillar as any, // Type assertion needed due to middleware chain typing
    validateRequest(createSubpillarSchema),
    handleAsyncRoute(createSubpillar)
  );

  router.put(
    '/subpillars/:id',
    authenticateWithToken,
    requireUser,
    validateRequest(updateSubpillarSchema),
    handleAsyncRoute(updateSubpillar)
  );

  router.delete(
    '/subpillars/:id',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(deleteSubpillar)
  );

  router.post(
    '/pillars/:pillarId/subpillars/generate',
    authenticateWithToken,
    requireUser,
    loadPillar as any, // Type assertion needed due to middleware chain typing
    handleAsyncRoute(generateSubpillars)
  );

  // Log successful router creation
  log.info('Subpillar router created successfully');

  return router;
}

export default createSubpillarRouter;
