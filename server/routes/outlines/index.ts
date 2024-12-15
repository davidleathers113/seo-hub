import express, { Router } from 'express';
import { OutlineService } from '../../services/OutlineService';
import { authenticateWithToken, requireUser } from '../middleware/auth';
import { validateRequest, handleAsyncRoute } from '../shared/middleware';
import { createCreateOutlineHandler } from './handlers/create';
import { createGetOutlineHandler, createGetOutlineBySubpillarHandler } from './handlers/get';
import { createUpdateSectionsHandler } from './handlers/update-sections';
import { createAddSectionHandler } from './handlers/add-section';
import { createUpdateStatusHandler } from './handlers/update-status';
import { createDeleteOutlineHandler } from './handlers/delete';
import {
  createOutlineSchema,
  updateSectionsSchema,
  addSectionSchema,
  updateStatusSchema
} from './types';
import { logger } from '../../utils/log';

const log = logger('routes/outlines');

export function createOutlineRouter(outlineService: OutlineService): Router {
  const router = express.Router();

  // Create handlers
  const createOutline = createCreateOutlineHandler(outlineService);
  const getOutline = createGetOutlineHandler(outlineService);
  const getOutlineBySubpillar = createGetOutlineBySubpillarHandler(outlineService);
  const updateSections = createUpdateSectionsHandler(outlineService);
  const addSection = createAddSectionHandler(outlineService);
  const updateStatus = createUpdateStatusHandler(outlineService);
  const deleteOutline = createDeleteOutlineHandler(outlineService);

  // Register routes with middleware
  router.post(
    '/subpillars/:subpillarId/outline',
    authenticateWithToken,
    requireUser,
    validateRequest(createOutlineSchema),
    handleAsyncRoute(createOutline)
  );

  router.get(
    '/subpillars/:subpillarId/outline',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(getOutlineBySubpillar)
  );

  router.get(
    '/outlines/:id',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(getOutline)
  );

  router.put(
    '/outlines/:id',
    authenticateWithToken,
    requireUser,
    validateRequest(updateSectionsSchema),
    handleAsyncRoute(updateSections)
  );

  router.post(
    '/outlines/:id/sections',
    authenticateWithToken,
    requireUser,
    validateRequest(addSectionSchema),
    handleAsyncRoute(addSection)
  );

  router.put(
    '/outlines/:id/status',
    authenticateWithToken,
    requireUser,
    validateRequest(updateStatusSchema),
    handleAsyncRoute(updateStatus)
  );

  router.delete(
    '/outlines/:id',
    authenticateWithToken,
    requireUser,
    handleAsyncRoute(deleteOutline)
  );

  // Log successful router creation
  log.info('Outline router created successfully');

  return router;
}

export default createOutlineRouter;
