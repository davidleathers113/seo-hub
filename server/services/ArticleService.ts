import { DatabaseClient, Article, ArticleCreateInput, ArticleUpdateInput } from '../database/interfaces';
import { logger } from '../utils/log';
import { ValidationError } from '../database/mongodb/client';

const log = logger('services/ArticleService');

export class ArticleService {
  constructor(private readonly db: DatabaseClient) {}

  async create(subpillarId: string, userId: string, data: Omit<ArticleCreateInput, 'subpillarId' | 'authorId'>): Promise<Article> {
    try {
      log.info(`Creating article for subpillar ${subpillarId} by user ${userId}`);
      const article = await this.db.createArticle({
        ...data,
        subpillarId,
        authorId: userId,
        status: data.status || 'draft'
      });
      log.info(`Created article ${article.id} for subpillar ${subpillarId}`);
      return article;
    } catch (error) {
      log.error('Error in ArticleService.create:', error);
      throw error;
    }
  }

  async getBySubpillarId(subpillarId: string): Promise<Article[]> {
    try {
      log.info(`Fetching articles for subpillar ${subpillarId}`);
      const articles = await this.db.findArticlesBySubpillarId(subpillarId);
      log.info(`Found ${articles.length} articles for subpillar ${subpillarId}`);
      return articles;
    } catch (error) {
      log.error('Error in ArticleService.getBySubpillarId:', error);
      throw error;
    }
  }

  async getByAuthorId(authorId: string): Promise<Article[]> {
    try {
      log.info(`Fetching articles by author ${authorId}`);
      const articles = await this.db.findArticles({ authorId });
      log.info(`Found ${articles.length} articles by author ${authorId}`);
      return articles;
    } catch (error) {
      log.error('Error in ArticleService.getByAuthorId:', error);
      throw error;
    }
  }

  async getById(articleId: string): Promise<Article | null> {
    try {
      log.info(`Fetching article ${articleId}`);
      const article = await this.db.findArticleById(articleId);
      if (article) {
        log.info(`Found article ${articleId}`);
      } else {
        log.info(`Article ${articleId} not found`);
      }
      return article;
    } catch (error) {
      log.error('Error in ArticleService.getById:', error);
      throw error;
    }
  }

  async update(articleId: string, userId: string, data: ArticleUpdateInput): Promise<Article | null> {
    try {
      log.info(`Updating article ${articleId} by user ${userId}`);
      const article = await this.getById(articleId);

      if (!article) {
        log.info(`Article ${articleId} not found`);
        return null;
      }

      if (article.authorId !== userId) {
        log.warn(`User ${userId} not authorized to update article ${articleId}`);
        throw new ValidationError('Not authorized to modify this article');
      }

      const updatedArticle = await this.db.updateArticle(articleId, data);
      if (updatedArticle) {
        log.info(`Updated article ${articleId}`);
      }
      return updatedArticle;
    } catch (error) {
      log.error('Error in ArticleService.update:', error);
      throw error;
    }
  }

  async updateSEO(articleId: string, userId: string, seoData: Pick<ArticleUpdateInput, 'seoScore' | 'keywords' | 'metaDescription'>): Promise<Article | null> {
    try {
      log.info(`Updating SEO data for article ${articleId} by user ${userId}`);
      const article = await this.getById(articleId);

      if (!article) {
        log.info(`Article ${articleId} not found`);
        return null;
      }

      if (article.authorId !== userId) {
        log.warn(`User ${userId} not authorized to update SEO data for article ${articleId}`);
        throw new ValidationError('Not authorized to modify this article');
      }

      const updatedArticle = await this.db.updateArticle(articleId, {
        seoScore: seoData.seoScore,
        keywords: seoData.keywords,
        metaDescription: seoData.metaDescription
      });
      if (updatedArticle) {
        log.info(`Updated SEO data for article ${articleId}`);
      }
      return updatedArticle;
    } catch (error) {
      log.error('Error in ArticleService.updateSEO:', error);
      throw error;
    }
  }

  async updateStatus(articleId: string, userId: string, status: Article['status']): Promise<Article | null> {
    try {
      log.info(`Updating status to ${status} for article ${articleId} by user ${userId}`);
      const article = await this.getById(articleId);

      if (!article) {
        log.info(`Article ${articleId} not found`);
        return null;
      }

      if (article.authorId !== userId) {
        log.warn(`User ${userId} not authorized to update status for article ${articleId}`);
        throw new ValidationError('Not authorized to modify this article');
      }

      const updatedArticle = await this.db.updateArticle(articleId, { status });
      if (updatedArticle) {
        log.info(`Updated status to ${status} for article ${articleId}`);
      }
      return updatedArticle;
    } catch (error) {
      log.error('Error in ArticleService.updateStatus:', error);
      throw error;
    }
  }

  async delete(articleId: string, userId: string): Promise<boolean> {
    try {
      log.info(`Deleting article ${articleId} by user ${userId}`);
      const article = await this.getById(articleId);

      if (!article) {
        log.info(`Article ${articleId} not found`);
        return false;
      }

      if (article.authorId !== userId) {
        log.warn(`User ${userId} not authorized to delete article ${articleId}`);
        throw new ValidationError('Not authorized to delete this article');
      }

      const success = await this.db.deleteArticle(articleId);
      if (success) {
        log.info(`Deleted article ${articleId}`);
      }
      return success;
    } catch (error) {
      log.error('Error in ArticleService.delete:', error);
      throw error;
    }
  }
}

// Factory function to create ArticleService instance
export function createArticleService(db: DatabaseClient): ArticleService {
  if (!db) {
    throw new Error('Database client is required for ArticleService');
  }
  return new ArticleService(db);
}
