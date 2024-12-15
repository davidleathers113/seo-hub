import express, { Request, Response, Router } from 'express';
import { ArticleService } from '../services/ArticleService';
import { authenticateWithToken, requireUser, AuthenticatedRequest } from './middleware/auth';
import { ValidationError } from '../database/mongodb/client';
import { logger } from '../utils/log';

const log = logger('api/routes/articleRoutes');

// Type guard to ensure request is authenticated
function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return 'user' in req && req.user !== undefined;
}

// Create a function to initialize the router with services
export function createArticlesRouter(articleService: ArticleService): Router {
  const router = express.Router();

  // Rest of the file remains exactly the same
  router.post('/subpillars/:subpillarId/articles', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { subpillarId } = req.params;
      const { title, content, metaDescription, keywords } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          error: 'Title and content are required'
        });
      }

      const article = await articleService.create(subpillarId, req.user.id, {
        title: title.trim(),
        content: content.trim(),
        metaDescription: metaDescription || '',
        keywords: keywords || [],
        status: 'draft'
      });

      log.info(`Created article ${article.id} for subpillar ${subpillarId}`);
      res.status(201).json(article);
    } catch (error) {
      log.error('Error creating article:', error);
      res.status(500).json({
        error: 'Failed to create article'
      });
    }
  });

  // Get all articles for a subpillar
  router.get('/subpillars/:subpillarId/articles', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { subpillarId } = req.params;
      const articles = await articleService.getBySubpillarId(subpillarId);
      log.info(`Retrieved ${articles.length} articles for subpillar ${subpillarId}`);
      res.json(articles);
    } catch (error) {
      log.error('Error fetching articles:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch articles'
      });
    }
  });

  // Get all articles by author
  router.get('/authors/:authorId/articles', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { authorId } = req.params;
      const articles = await articleService.getByAuthorId(authorId);
      log.info(`Retrieved ${articles.length} articles by author ${authorId}`);
      res.json(articles);
    } catch (error) {
      log.error('Error fetching articles:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch articles'
      });
    }
  });

  // Get a specific article
  router.get('/articles/:id', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const article = await articleService.getById(req.params.id);
      if (!article) {
        return res.status(404).json({
          error: 'Article not found'
        });
      }
      log.info(`Retrieved article ${req.params.id}`);
      res.json(article);
    } catch (error) {
      log.error('Error getting article:', error);
      res.status(500).json({
        error: 'Failed to get article'
      });
    }
  });

  // Update an article
  router.put('/articles/:id', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { title, content, metaDescription, keywords, status } = req.body;

      const article = await articleService.update(req.params.id, req.user.id, {
        title: title?.trim(),
        content: content?.trim(),
        metaDescription,
        keywords,
        status
      });

      if (!article) {
        return res.status(404).json({
          error: 'Article not found'
        });
      }

      log.info(`Updated article ${req.params.id}`);
      res.json(article);
    } catch (error) {
      log.error('Error updating article:', error);
      res.status(500).json({
        error: 'Failed to update article'
      });
    }
  });

  // Update article SEO data
  router.put('/articles/:id/seo', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { seoScore, keywords, metaDescription } = req.body;

      const article = await articleService.updateSEO(req.params.id, req.user.id, {
        seoScore,
        keywords,
        metaDescription
      });

      if (!article) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Article not found'
        });
      }

      log.info(`Updated SEO data for article ${req.params.id}`);
      res.json(article);
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.message.includes('Not authorized')) {
          return res.status(403).json({
            error: 'Forbidden',
            message: error.message
          });
        }
        return res.status(400).json({
          error: 'Validation error',
          message: error.message
        });
      }
      log.error('Error updating article SEO:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update article SEO'
      });
    }
  });

  // Update article status
  router.put('/articles/:id/status', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { status } = req.body;

      if (!status || !['draft', 'review', 'published'].includes(status)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid status value'
        });
      }

      const article = await articleService.updateStatus(req.params.id, req.user.id, status);
      if (!article) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Article not found'
        });
      }

      log.info(`Updated status to ${status} for article ${req.params.id}`);
      res.json(article);
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.message.includes('Not authorized')) {
          return res.status(403).json({
            error: 'Forbidden',
            message: error.message
          });
        }
        return res.status(400).json({
          error: 'Validation error',
          message: error.message
        });
      }
      log.error('Error updating article status:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update article status'
      });
    }
  });

  // Delete an article
  router.delete('/articles/:id', authenticateWithToken as express.RequestHandler, requireUser as express.RequestHandler, async (req: Request, res: Response) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const success = await articleService.delete(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({
          error: 'Article not found'
        });
      }

      log.info(`Deleted article ${req.params.id}`);
      res.status(204).send();
    } catch (error) {
      log.error('Error deleting article:', error);
      res.status(500).json({
        error: 'Failed to delete article'
      });
    }
  });

  return router;
}

export default createArticlesRouter;
