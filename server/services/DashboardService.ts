import { DatabaseClient } from '../database/interfaces';
import { getDatabase } from '../database';

export class DashboardService {
  private db: DatabaseClient;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
  }

  async getDashboardStats(userId: string) {
    try {
      // Get niches with status counts
      const niches = await this.db.findNichesByUserId(userId);
      const nicheStats = {
        total: niches.length,
        new: niches.filter(n => n.status === 'pending').length,
        inProgress: niches.filter(n => n.status === 'in_progress').length,
        completed: niches.filter(n => n.status === 'approved').length
      };

      // Get pillars with status counts
      const pillars = await this.db.findPillars({ createdById: userId });
      const pillarStats = {
        total: pillars.length,
        approved: pillars.filter(p => p.status === 'approved').length,
        pending: pillars.filter(p => p.status === 'pending').length
      };

      // Get subpillars with status counts
      const subpillars = await this.db.findSubpillars({ createdById: userId });
      const subpillarStats = {
        total: subpillars.length,
        completed: subpillars.filter(s => s.status === 'active').length
      };

      // Get articles for SEO and quality metrics
      const articles = await this.db.findArticles({ authorId: userId });
      const seoScores = articles.map(a => a.seoScore || 0);
      const averageScore = seoScores.length 
        ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length)
        : 0;

      // Calculate SEO trend (last 3 months)
      const now = new Date();
      const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
      const recentArticles = articles.filter(a => a.createdAt >= threeMonthsAgo);
      const trend = Array.from({ length: 3 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthArticles = recentArticles.filter(a => 
          a.createdAt.getMonth() === month.getMonth() &&
          a.createdAt.getFullYear() === month.getFullYear()
        );
        const monthScore = monthArticles.length
          ? Math.round(monthArticles.reduce((sum, a) => sum + (a.seoScore || 0), 0) / monthArticles.length)
          : 0;
        return {
          date: month.toISOString().slice(0, 7), // YYYY-MM format
          score: monthScore
        };
      }).reverse();

      // Calculate quality metrics from articles
      const qualityMetrics = {
        readabilityScore: Math.round(articles.reduce((sum, a) => sum + (a.readabilityScore || 0), 0) / (articles.length || 1)),
        plagiarismScore: 98, // This would need to be implemented with a plagiarism detection service
        keywordDensity: Math.round(articles.reduce((sum, a) => sum + (a.keywordDensity || 0), 0) / (articles.length || 1))
      };

      // Get API usage (this would need to be implemented with actual API tracking)
      const apiStats = {
        apiUsage: 7500,
        apiLimit: 10000
      };

      return {
        niches: nicheStats,
        pillars: pillarStats,
        subpillars: subpillarStats,
        seo: {
          averageScore,
          above80Percent: Math.round((seoScores.filter(score => score >= 80).length / (seoScores.length || 1)) * 100),
          trend
        },
        quality: qualityMetrics,
        resources: apiStats
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

// Factory function to create DashboardService instance
export function createDashboardService(dbClient?: DatabaseClient): DashboardService {
  return new DashboardService(dbClient);
}

export default createDashboardService;
