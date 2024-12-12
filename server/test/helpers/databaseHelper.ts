import { DatabaseClient } from '../../database/interfaces';
import { getTestDatabase } from '../setup';
import { User, Niche, Pillar, Subpillar, Article, Research, Outline } from '../../database/interfaces';

export interface TestData {
  users?: User[];
  niches?: Niche[];
  pillars?: Pillar[];
  subpillars?: Subpillar[];
  articles?: Article[];
  research?: Research[];
  outlines?: Outline[];
}

export class DatabaseTestHelper {
  private db: DatabaseClient;

  constructor() {
    this.db = getTestDatabase();
  }

  async createTestUser(overrides: Partial<User> = {}): Promise<User> {
    const defaultUser: Partial<User> = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user',
      ...overrides
    };

    return this.db.createUser(defaultUser);
  }

  async createTestNiche(userId: string, overrides: Partial<Niche> = {}): Promise<Niche> {
    const defaultNiche: Partial<Niche> = {
      name: 'Test Niche',
      description: 'Test niche description',
      createdById: userId,
      status: 'active',
      ...overrides
    };

    return this.db.createNiche(defaultNiche);
  }

  async createTestPillar(nicheId: string, userId: string, overrides: Partial<Pillar> = {}): Promise<Pillar> {
    const defaultPillar: Partial<Pillar> = {
      name: 'Test Pillar',
      description: 'Test pillar description',
      nicheId,
      createdById: userId,
      status: 'active',
      ...overrides
    };

    return this.db.createPillar(defaultPillar);
  }

  async createTestSubpillar(pillarId: string, userId: string, overrides: Partial<Subpillar> = {}): Promise<Subpillar> {
    const defaultSubpillar: Partial<Subpillar> = {
      name: 'Test Subpillar',
      description: 'Test subpillar description',
      pillarId,
      createdById: userId,
      status: 'active',
      ...overrides
    };

    return this.db.createSubpillar(defaultSubpillar);
  }

  async createTestArticle(subpillarId: string, userId: string, overrides: Partial<Article> = {}): Promise<Article> {
    const defaultArticle: Partial<Article> = {
      title: 'Test Article',
      content: 'Test article content',
      subpillarId,
      createdById: userId,
      status: 'draft',
      seoTitle: 'Test SEO Title',
      seoDescription: 'Test SEO Description',
      ...overrides
    };

    return this.db.createArticle(defaultArticle);
  }

  async createTestResearch(articleId: string, userId: string, overrides: Partial<Research> = {}): Promise<Research> {
    const defaultResearch: Partial<Research> = {
      content: 'Test research content',
      articleId,
      createdById: userId,
      status: 'completed',
      ...overrides
    };

    return this.db.createResearch(defaultResearch);
  }

  async createTestOutline(articleId: string, userId: string, overrides: Partial<Outline> = {}): Promise<Outline> {
    const defaultOutline: Partial<Outline> = {
      sections: [
        { title: 'Introduction', content: 'Test introduction content' },
        { title: 'Main Section', content: 'Test main section content' },
        { title: 'Conclusion', content: 'Test conclusion content' }
      ],
      articleId,
      createdById: userId,
      status: 'completed',
      ...overrides
    };

    return this.db.createOutline(defaultOutline);
  }

  async setupTestData(data: TestData = {}): Promise<TestData> {
    const result: TestData = {};

    // Create users
    if (data.users) {
      result.users = await Promise.all(
        data.users.map(user => this.createTestUser(user))
      );
    }

    // Create niches
    if (data.niches && result.users) {
      result.niches = await Promise.all(
        data.niches.map(niche => this.createTestNiche(result.users![0].id, niche))
      );
    }

    // Create pillars
    if (data.pillars && result.niches && result.users) {
      result.pillars = await Promise.all(
        data.pillars.map(pillar => this.createTestPillar(result.niches![0].id, result.users![0].id, pillar))
      );
    }

    // Create subpillars
    if (data.subpillars && result.pillars && result.users) {
      result.subpillars = await Promise.all(
        data.subpillars.map(subpillar => this.createTestSubpillar(result.pillars![0].id, result.users![0].id, subpillar))
      );
    }

    // Create articles
    if (data.articles && result.subpillars && result.users) {
      result.articles = await Promise.all(
        data.articles.map(article => this.createTestArticle(result.subpillars![0].id, result.users![0].id, article))
      );
    }

    // Create research
    if (data.research && result.articles && result.users) {
      result.research = await Promise.all(
        data.research.map(research => this.createTestResearch(result.articles![0].id, result.users![0].id, research))
      );
    }

    // Create outlines
    if (data.outlines && result.articles && result.users) {
      result.outlines = await Promise.all(
        data.outlines.map(outline => this.createTestOutline(result.articles![0].id, result.users![0].id, outline))
      );
    }

    return result;
  }

  async cleanup(): Promise<void> {
    const testDb = this.db as any;
    if (typeof testDb.clearCollections === 'function') {
      await testDb.clearCollections();
    }
  }
}

// Export a singleton instance
export const dbHelper = new DatabaseTestHelper();