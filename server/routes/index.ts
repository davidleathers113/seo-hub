import { Router } from 'express';
import { createAuthRouter } from './auth';
import createNicheRouter from './niches';
import createPillarRouter from './pillars';
import createSubpillarRouter from './subpillars';
import createArticlesRouter from './articles';
import createResearchRouter from './research';
import outlineRouter from './outlines';
import { createDashboardRouter } from './dashboard';
import healthRouter from './health';

import { getDatabase } from '../database';
import { createUserService } from '../services/UserService';
import { createSessionService } from '../services/SessionService';
import { createNicheService } from '../services/NicheService';
import { createPillarService } from '../services/PillarService';
import { createSubpillarService } from '../services/SubpillarService';
import { createArticleService } from '../services/ArticleService';
import { createResearchService } from '../services/ResearchService';
import { createOutlineService } from '../services/OutlineService';
import { createDashboardService } from '../services/DashboardService';
import { initializeServices } from './middleware/auth';
import { logger } from '../utils/log';

const log = logger('routes/index');

export function createRouter(): Router {
  const router = Router();
  const dbClient = getDatabase();

  try {
    // Initialize auth services first
    const services = initializeServices(dbClient);

    // Initialize other services using factory functions
    const nicheService = createNicheService(dbClient);
    const pillarService = createPillarService(dbClient);
    const subpillarService = createSubpillarService(dbClient);
    const articleService = createArticleService(dbClient);
    const researchService = createResearchService(dbClient);
    const dashboardService = createDashboardService(dbClient);

    // Mount routes with all required dependencies
    router.use('/auth', createAuthRouter(services.userService, services.sessionService));
    router.use('/niches', createNicheRouter(nicheService));
    router.use('/pillars', createPillarRouter(pillarService, nicheService));
    router.use('/subpillars', createSubpillarRouter(subpillarService, pillarService));
    router.use('/articles', createArticlesRouter(articleService));
    router.use('/research', createResearchRouter(researchService));
    router.use('/outlines', outlineRouter);
    router.use('/dashboard', createDashboardRouter(dashboardService));
    router.use('/health', healthRouter);

    log.info('All routes mounted successfully');
    return router;
  } catch (error) {
    log.error('Error mounting routes:', error);
    throw error;
  }
}

export default createRouter;
