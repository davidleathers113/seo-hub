import mongoose from 'mongoose';
import { DatabaseClient, User, Niche, Pillar, Subpillar, Research, Outline, Article, BaseEntity } from '../interfaces';
import UserModel from './models/User';
import NicheModel from './models/Niche';
import PillarModel from './models/Pillar';
import SubpillarModel from './models/Subpillar';
import ResearchModel from './models/Research';
import OutlineModel from './models/Outline';
import ArticleModel from './models/Article';

// Custom error classes for better error handling
export class DatabaseConnectionError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export class DatabaseOperationError extends Error {
  constructor(message: string, public operation: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseOperationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class MongoDBClient implements DatabaseClient {
  private uri: string;
  private connected: boolean = false;
  private logger: Console;

  constructor(uri: string, logger: Console = console) {
    this.uri = uri;
    this.logger = logger;
  }

  private logError(error: Error, context: string): void {
    this.logger.error(`[MongoDB Error] ${context}:`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      context
    });
  }

  private validateObjectId(id: string, context: string): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError(`Invalid ID format: ${id}`, context);
    }
  }

  private async handleDatabaseOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      this.logError(error, context);

      if (error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      }

      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new DatabaseOperationError('Duplicate key error', context, error);
      }

      throw new DatabaseOperationError(
        `Failed to perform operation: ${context}`,
        context,
        error
      );
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await mongoose.connect(this.uri);
      this.connected = true;
      this.logger.info('Connected to MongoDB');
    } catch (error: any) {
      this.logError(error, 'connect');
      throw new DatabaseConnectionError('Failed to connect to MongoDB', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await mongoose.disconnect();
      this.connected = false;
      this.logger.info('Disconnected from MongoDB');
    } catch (error: any) {
      this.logError(error, 'disconnect');
      throw new DatabaseConnectionError('Failed to disconnect from MongoDB', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const state = mongoose.connection.readyState;
      const isHealthy = state === 1;
      this.logger.debug(`MongoDB health check - Status: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      return isHealthy;
    } catch (error: any) {
      this.logError(error, 'healthCheck');
      return false;
    }
  }

  // User operations with error handling
  async createUser(data: Omit<User, keyof BaseEntity>): Promise<User> {
    return this.handleDatabaseOperation(async () => {
      const user = new UserModel(data);
      await user.save();
      return this.mapUser(user);
    }, 'createUser');
  }

  async findUserById(id: string): Promise<User | null> {
    this.validateObjectId(id, 'findUserById');
    return this.handleDatabaseOperation(async () => {
      const user = await UserModel.findById(id);
      return user ? this.mapUser(user) : null;
    }, 'findUserById');
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new ValidationError('Email is required', 'findUserByEmail');
    }
    return this.handleDatabaseOperation(async () => {
      const user = await UserModel.findOne({ email });
      return user ? this.mapUser(user) : null;
    }, 'findUserByEmail');
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    this.validateObjectId(id, 'updateUser');
    return this.handleDatabaseOperation(async () => {
      const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
      return user ? this.mapUser(user) : null;
    }, 'updateUser');
  }

  async findUsers(): Promise<User[]> {
    return this.handleDatabaseOperation(async () => {
      const users = await UserModel.find();
      return users.map(user => this.mapUser(user));
    }, 'findUsers');
  }

  async findUserByToken(token: string): Promise<User | null> {
    if (!token) {
      throw new ValidationError('Token is required', 'findUserByToken');
    }
    return this.handleDatabaseOperation(async () => {
      const user = await UserModel.findOne({ token });
      return user ? this.mapUser(user) : null;
    }, 'findUserByToken');
  }

  async deleteUser(id: string): Promise<boolean> {
    this.validateObjectId(id, 'deleteUser');
    return this.handleDatabaseOperation(async () => {
      const result = await UserModel.findByIdAndDelete(id);
      return !!result;
    }, 'deleteUser');
  }

  // Niche operations with error handling
  async createNiche(data: Omit<Niche, keyof BaseEntity>): Promise<Niche> {
    return this.handleDatabaseOperation(async () => {
      const niche = new NicheModel(data);
      await niche.save();
      return this.mapNiche(niche);
    }, 'createNiche');
  }

  async findNicheById(id: string): Promise<Niche | null> {
    this.validateObjectId(id, 'findNicheById');
    return this.handleDatabaseOperation(async () => {
      const niche = await NicheModel.findById(id);
      return niche ? this.mapNiche(niche) : null;
    }, 'findNicheById');
  }

  async findNichesByUserId(userId: string): Promise<Niche[]> {
    this.validateObjectId(userId, 'findNichesByUserId');
    return this.handleDatabaseOperation(async () => {
      const niches = await NicheModel.find({ userId });
      return niches.map(niche => this.mapNiche(niche));
    }, 'findNichesByUserId');
  }

  async updateNiche(id: string, data: Partial<Niche>): Promise<Niche | null> {
    this.validateObjectId(id, 'updateNiche');
    return this.handleDatabaseOperation(async () => {
      const niche = await NicheModel.findByIdAndUpdate(id, data, { new: true });
      return niche ? this.mapNiche(niche) : null;
    }, 'updateNiche');
  }

  async deleteNiche(id: string): Promise<boolean> {
    this.validateObjectId(id, 'deleteNiche');
    return this.handleDatabaseOperation(async () => {
      const result = await NicheModel.findByIdAndDelete(id);
      return !!result;
    }, 'deleteNiche');
  }

  // Pillar operations with error handling
  async createPillar(data: Omit<Pillar, keyof BaseEntity>): Promise<Pillar> {
    if (data.niche) this.validateObjectId(data.niche, 'createPillar.niche');
    if (data.createdBy) this.validateObjectId(data.createdBy, 'createPillar.createdBy');
    return this.handleDatabaseOperation(async () => {
      const pillar = new PillarModel(data);
      await pillar.save();
      return this.mapPillar(pillar);
    }, 'createPillar');
  }

  async findPillarById(id: string): Promise<Pillar | null> {
    this.validateObjectId(id, 'findPillarById');
    return this.handleDatabaseOperation(async () => {
      const pillar = await PillarModel.findById(id);
      return pillar ? this.mapPillar(pillar) : null;
    }, 'findPillarById');
  }

  async findPillarsByNicheId(nicheId: string): Promise<Pillar[]> {
    this.validateObjectId(nicheId, 'findPillarsByNicheId');
    return this.handleDatabaseOperation(async () => {
      const pillars = await PillarModel.find({ niche: nicheId });
      return pillars.map(pillar => this.mapPillar(pillar));
    }, 'findPillarsByNicheId');
  }

  async updatePillar(id: string, data: Partial<Pillar>): Promise<Pillar | null> {
    this.validateObjectId(id, 'updatePillar');
    if (data.niche) this.validateObjectId(data.niche, 'updatePillar.niche');
    return this.handleDatabaseOperation(async () => {
      const pillar = await PillarModel.findByIdAndUpdate(id, data, { new: true });
      return pillar ? this.mapPillar(pillar) : null;
    }, 'updatePillar');
  }

  async deletePillar(id: string): Promise<boolean> {
    this.validateObjectId(id, 'deletePillar');
    return this.handleDatabaseOperation(async () => {
      const result = await PillarModel.findByIdAndDelete(id);
      return !!result;
    }, 'deletePillar');
  }

  // Subpillar operations with error handling
  async createSubpillar(data: Omit<Subpillar, keyof BaseEntity>): Promise<Subpillar> {
    if (data.pillar) this.validateObjectId(data.pillar, 'createSubpillar.pillar');
    if (data.createdBy) this.validateObjectId(data.createdBy, 'createSubpillar.createdBy');
    return this.handleDatabaseOperation(async () => {
      const subpillar = new SubpillarModel(data);
      await subpillar.save();
      return this.mapSubpillar(subpillar);
    }, 'createSubpillar');
  }

  async findSubpillarById(id: string): Promise<Subpillar | null> {
    this.validateObjectId(id, 'findSubpillarById');
    return this.handleDatabaseOperation(async () => {
      const subpillar = await SubpillarModel.findById(id);
      return subpillar ? this.mapSubpillar(subpillar) : null;
    }, 'findSubpillarById');
  }

  async findSubpillarsByPillarId(pillarId: string): Promise<Subpillar[]> {
    this.validateObjectId(pillarId, 'findSubpillarsByPillarId');
    return this.handleDatabaseOperation(async () => {
      const subpillars = await SubpillarModel.find({ pillar: pillarId });
      return subpillars.map(subpillar => this.mapSubpillar(subpillar));
    }, 'findSubpillarsByPillarId');
  }

  async updateSubpillar(id: string, data: Partial<Subpillar>): Promise<Subpillar | null> {
    this.validateObjectId(id, 'updateSubpillar');
    if (data.pillar) this.validateObjectId(data.pillar, 'updateSubpillar.pillar');
    return this.handleDatabaseOperation(async () => {
      const subpillar = await SubpillarModel.findByIdAndUpdate(id, data, { new: true });
      return subpillar ? this.mapSubpillar(subpillar) : null;
    }, 'updateSubpillar');
  }

  async deleteSubpillar(id: string): Promise<boolean> {
    this.validateObjectId(id, 'deleteSubpillar');
    return this.handleDatabaseOperation(async () => {
      const result = await SubpillarModel.findByIdAndDelete(id);
      return !!result;
    }, 'deleteSubpillar');
  }

  // Research operations with error handling
  async createResearch(data: Omit<Research, keyof BaseEntity>): Promise<Research> {
    if (data.subpillar) this.validateObjectId(data.subpillar, 'createResearch.subpillar');
    return this.handleDatabaseOperation(async () => {
      const research = new ResearchModel(data);
      await research.save();
      return this.mapResearch(research);
    }, 'createResearch');
  }

  async findResearchById(id: string): Promise<Research | null> {
    this.validateObjectId(id, 'findResearchById');
    return this.handleDatabaseOperation(async () => {
      const research = await ResearchModel.findById(id);
      return research ? this.mapResearch(research) : null;
    }, 'findResearchById');
  }

  async findResearchBySubpillarId(subpillarId: string): Promise<Research[]> {
    this.validateObjectId(subpillarId, 'findResearchBySubpillarId');
    return this.handleDatabaseOperation(async () => {
      const researches = await ResearchModel.find({ subpillar: subpillarId });
      return researches.map(research => this.mapResearch(research));
    }, 'findResearchBySubpillarId');
  }

  async updateResearch(id: string, data: Partial<Research>): Promise<Research | null> {
    this.validateObjectId(id, 'updateResearch');
    if (data.subpillar) this.validateObjectId(data.subpillar, 'updateResearch.subpillar');
    return this.handleDatabaseOperation(async () => {
      const research = await ResearchModel.findByIdAndUpdate(id, data, { new: true });
      return research ? this.mapResearch(research) : null;
    }, 'updateResearch');
  }

  async deleteResearch(id: string): Promise<boolean> {
    this.validateObjectId(id, 'deleteResearch');
    return this.handleDatabaseOperation(async () => {
      const result = await ResearchModel.findByIdAndDelete(id);
      return !!result;
    }, 'deleteResearch');
  }

  // Outline operations with error handling
  async createOutline(data: Omit<Outline, keyof BaseEntity>): Promise<Outline> {
    if (data.subpillar) this.validateObjectId(data.subpillar, 'createOutline.subpillar');
    if (data.createdBy) this.validateObjectId(data.createdBy, 'createOutline.createdBy');
    return this.handleDatabaseOperation(async () => {
      const outline = new OutlineModel(data);
      await outline.save();
      return this.mapOutline(outline);
    }, 'createOutline');
  }

  async findOutlineById(id: string): Promise<Outline | null> {
    this.validateObjectId(id, 'findOutlineById');
    return this.handleDatabaseOperation(async () => {
      const outline = await OutlineModel.findById(id);
      return outline ? this.mapOutline(outline) : null;
    }, 'findOutlineById');
  }

  async findOutlineBySubpillarId(subpillarId: string): Promise<Outline | null> {
    this.validateObjectId(subpillarId, 'findOutlineBySubpillarId');
    return this.handleDatabaseOperation(async () => {
      const outline = await OutlineModel.findOne({ subpillar: subpillarId });
      return outline ? this.mapOutline(outline) : null;
    }, 'findOutlineBySubpillarId');
  }

  async updateOutline(id: string, data: Partial<Outline>): Promise<Outline | null> {
    this.validateObjectId(id, 'updateOutline');
    if (data.subpillar) this.validateObjectId(data.subpillar, 'updateOutline.subpillar');
    return this.handleDatabaseOperation(async () => {
      const outline = await OutlineModel.findByIdAndUpdate(id, data, { new: true });
      return outline ? this.mapOutline(outline) : null;
    }, 'updateOutline');
  }

  async deleteOutline(id: string): Promise<boolean> {
    this.validateObjectId(id, 'deleteOutline');
    return this.handleDatabaseOperation(async () => {
      const result = await OutlineModel.findByIdAndDelete(id);
      return !!result;
    }, 'deleteOutline');
  }

  // Article operations with error handling
  async createArticle(data: Omit<Article, keyof BaseEntity>): Promise<Article> {
    if (data.author) this.validateObjectId(data.author, 'createArticle.author');
    return this.handleDatabaseOperation(async () => {
      const article = new ArticleModel(data);
      await article.save();
      return this.mapArticle(article);
    }, 'createArticle');
  }

  async findArticleById(id: string): Promise<Article | null> {
    this.validateObjectId(id, 'findArticleById');
    return this.handleDatabaseOperation(async () => {
      const article = await ArticleModel.findById(id);
      return article ? this.mapArticle(article) : null;
    }, 'findArticleById');
  }

  async findArticlesByAuthor(authorId: string): Promise<Article[]> {
    this.validateObjectId(authorId, 'findArticlesByAuthor');
    return this.handleDatabaseOperation(async () => {
      const articles = await ArticleModel.find({ author: authorId });
      return articles.map(article => this.mapArticle(article));
    }, 'findArticlesByAuthor');
  }

  async updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
    this.validateObjectId(id, 'updateArticle');
    if (data.author) this.validateObjectId(data.author, 'updateArticle.author');
    return this.handleDatabaseOperation(async () => {
      const article = await ArticleModel.findByIdAndUpdate(id, data, { new: true });
      return article ? this.mapArticle(article) : null;
    }, 'updateArticle');
  }

  async deleteArticle(id: string): Promise<boolean> {
    this.validateObjectId(id, 'deleteArticle');
    return this.handleDatabaseOperation(async () => {
      const result = await ArticleModel.findByIdAndDelete(id);
      return !!result;
    }, 'deleteArticle');
  }

  // Session operations
  async createSession(userId: string, data: any): Promise<string> {
    // Implementation depends on your session management strategy
    throw new Error('Session management not implemented');
  }

  async getSession(sessionId: string): Promise<any> {
    // Implementation depends on your session management strategy
    throw new Error('Session management not implemented');
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    // Implementation depends on your session management strategy
    throw new Error('Session management not implemented');
  }

  // Private helper methods to map database models to interface types
  private mapUser(user: any): User {
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private mapNiche(niche: any): Niche {
    return {
      id: niche._id.toString(),
      name: niche.name,
      userId: niche.userId.toString(),
      pillars: niche.pillars,
      progress: niche.progress,
      status: niche.status,
      createdAt: niche.createdAt,
      updatedAt: niche.updatedAt
    };
  }

  private mapPillar(pillar: any): Pillar {
    return {
      id: pillar._id.toString(),
      title: pillar.title,
      niche: pillar.niche.toString(),
      status: pillar.status,
      createdBy: pillar.createdBy.toString(),
      createdAt: pillar.createdAt,
      updatedAt: pillar.updatedAt
    };
  }

  private mapSubpillar(subpillar: any): Subpillar {
    return {
      id: subpillar._id.toString(),
      title: subpillar.title,
      pillar: subpillar.pillar.toString(),
      status: subpillar.status,
      createdBy: subpillar.createdBy.toString(),
      createdAt: subpillar.createdAt,
      updatedAt: subpillar.updatedAt
    };
  }

  private mapResearch(research: any): Research {
    return {
      id: research._id.toString(),
      subpillar: research.subpillar.toString(),
      content: research.content,
      source: research.source,
      notes: research.notes,
      createdAt: research.createdAt,
      updatedAt: research.updatedAt
    };
  }

  private mapOutline(outline: any): Outline {
    return {
      id: outline._id.toString(),
      subpillar: outline.subpillar.toString(),
      sections: outline.sections,
      status: outline.status,
      createdBy: outline.createdBy.toString(),
      createdAt: outline.createdAt,
      updatedAt: outline.updatedAt
    };
  }

  private mapArticle(article: any): Article {
    return {
      id: article._id.toString(),
      title: article.title,
      content: article.content,
      metaDescription: article.metaDescription,
      keywords: article.keywords,
      author: article.author.toString(),
      seoScore: article.seoScore,
      lastSeoUpdate: article.lastSeoUpdate,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };
  }
}