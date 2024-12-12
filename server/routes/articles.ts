import express, { Request, Response } from 'express';
import { createArticleService } from '../services/ArticleService';
import { authenticateWithToken, requireUser } from './middleware/auth';
import { ValidationError } from '../database/mongodb/client';
import { logger } from '../utils/log';
import { User } from '../database/interfaces';

// Extend Express Request to include user
declare module 'express' {
  interface Request {
    user?: User;
  }
}

const router = express.Router();
const articleService = createArticleService();
const log = logger('api/routes/articleRoutes');

// Create an article
router.post('/subpillars/:subpillarId/articles', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { subpillarId } = req.params;
    const { title, content, metaDescription, keywords } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title is required'
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Content is required'
      });
    }

    const article = await articleService.create(subpillarId, req.user!.id, {
      title: title.trim(),
      content: content.trim(),
      metaDescription: metaDescription?.trim(),
      keywords: keywords || []
    });

    log.info(`Created article ${article.id} for subpillar ${subpillarId}`);
    res.status(201).json(article);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    log.error('Error creating article:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create article'
    });
  }
});

// Get all articles for a subpillar
router.get('/subpillars/:subpillarId/articles', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
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
router.get('/authors/:authorId/articles', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
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
router.get('/articles/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const article = await articleService.getById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Article not found'
      });
    }
    log.info(`Retrieved article ${req.params.id}`);
    res.json(article);
  } catch (error) {
    log.error('Error fetching article:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch article'
    });
  }
});

// Update an article
router.put('/articles/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { title, content, metaDescription, keywords } = req.body;

    // Validate update fields
    const allowedFields = ['title', 'content', 'metaDescription', 'keywords'];
    const updateFields = Object.keys(req.body);
    const hasInvalidFields = updateFields.some(field => !allowedFields.includes(field));

    if (hasInvalidFields) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid fields in request'
      });
    }

    const updateData = {
      ...(title && { title: title.trim() }),
      ...(content && { content: content.trim() }),
      ...(metaDescription && { metaDescription: metaDescription.trim() }),
      ...(keywords && { keywords })
    };

    const article = await articleService.update(req.params.id, req.user!.id, updateData);
    if (!article) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Article not found'
      });
    }

    log.info(`Updated article ${req.params.id}`);
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
    log.error('Error updating article:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update article'
    });
  }
});

// Update article SEO data
router.put('/articles/:id/seo', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { seoScore, keywords, metaDescription } = req.body;

    const article = await articleService.updateSEO(req.params.id, req.user!.id, {
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
router.put('/articles/:id/status', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !['draft', 'review', 'published'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid status value'
      });
    }

    const article = await articleService.updateStatus(req.params.id, req.user!.id, status);
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
router.delete('/articles/:id', authenticateWithToken, requireUser, async (req: Request, res: Response) => {
  try {
    const success = await articleService.delete(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Article not found'
      });
    }

    log.info(`Deleted article ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('Not authorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }
    log.error('Error deleting article:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete article'
    });
  }
});

export default router;