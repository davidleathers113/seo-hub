import { Application, RequestHandler } from 'express';
import { DatabaseClient } from '../database/interfaces';
import { authenticateToken } from '../middleware/auth';
import { notFoundHandler, errorHandler } from '../middleware/error';
import { logger } from '../utils/log';

// Import route creators
import basicRoutes from '../routes/index';
import healthRouter from '../routes/health';
import { createAuthRouter } from '../routes/auth';
import { createNicheRouter } from '../routes/niches';
import { createPillarRouter } from '../routes/pillars';
import { createArticlesRouter } from '../routes/articles';
import { createWorkflowRouter } from '../routes/workflow';

// Import service creators
import { createUserService } from '../services/UserService';
import { createNicheService } from '../services/NicheService';
import { createSessionService } from '../services/SessionService';
import { createPillarService } from '../services/PillarService';
import { createArticleService } from '../services/ArticleService';
import { WorkflowService } from '../services/WorkflowService';

const log = logger('routes-config');

export function setupRoutes(app: Application, dbClient: DatabaseClient): void {
  log.info('Initializing services...');
  
  // Initialize all services first
  const userService = createUserService(dbClient);
  const nicheService = createNicheService(dbClient);
  const sessionService = createSessionService(dbClient);
  const pillarService = createPillarService(dbClient);
  const articleService = createArticleService(dbClient);
  const workflowService = new WorkflowService();

  log.info('Services initialized');

  // Initialize route handlers with services
  const authRouterInstance = createAuthRouter(userService, sessionService);
  const nicheRouterInstance = createNicheRouter(nicheService);
  const pillarRouterInstance = createPillarRouter(pillarService, nicheService);
  const articlesRouterInstance = createArticlesRouter(articleService);
  const workflowRouterInstance = createWorkflowRouter(workflowService);

  // Apply routes
  app.use('/', basicRoutes);
  app.use('/health', healthRouter);
  app.use('/auth', authRouterInstance);
  
  // Protected routes
  app.use('/api/niches', authenticateToken as RequestHandler, nicheRouterInstance);
  app.use('/api/pillars', authenticateToken as RequestHandler, pillarRouterInstance);
  app.use('/api/articles', authenticateToken as RequestHandler, articlesRouterInstance);
  app.use('/api/workflow', authenticateToken as RequestHandler, workflowRouterInstance);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  log.info('Routes setup completed');
}
