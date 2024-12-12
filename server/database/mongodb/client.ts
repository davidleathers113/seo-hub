import mongoose from 'mongoose';
import { DatabaseClient, User, Niche, Pillar, Subpillar, Research, Outline, Article, BaseEntity } from '../interfaces';
import UserModel from './models/User';
import NicheModel from './models/Niche';
import PillarModel from './models/Pillar';
import SubpillarModel from './models/Subpillar';
import ResearchModel from './models/Research';
import OutlineModel from './models/Outline';
import ArticleModel from './models/Article';
import SessionModel, { SessionDocument } from './models/Session';
import { Session, SessionCreateInput, SessionUpdateInput } from '../interfaces';

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
  async createSubpillar(data: SubpillarCreateInput): Promise<Subpillar> {
    try {
      const subpillar = await SubpillarModel.create({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return this.mapSubpillar(subpillar);
    } catch (error) {
      if (error.code === 11000) {
        throw new ValidationError('Subpillar with this title already exists');
      }
      throw error;
    }
  }

  async findSubpillarById(id: string): Promise<Subpillar | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid subpillar ID format');
    }
    const subpillar = await SubpillarModel.findById(id);
    return subpillar ? this.mapSubpillar(subpillar) : null;
  }

  async findSubpillarsByPillarId(pillarId: string): Promise<Subpillar[]> {
    if (!mongoose.Types.ObjectId.isValid(pillarId)) {
      throw new ValidationError('Invalid pillar ID format');
    }
    const subpillars = await SubpillarModel.find({ pillarId }).sort({ createdAt: 1 });
    return subpillars.map(this.mapSubpillar);
  }

  async updateSubpillar(id: string, data: SubpillarUpdateInput): Promise<Subpillar | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid subpillar ID format');
    }
    const subpillar = await SubpillarModel.findByIdAndUpdate(
      id,
      {
        ...data,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    return subpillar ? this.mapSubpillar(subpillar) : null;
  }

  async deleteSubpillar(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid subpillar ID format');
    }
    const result = await SubpillarModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  private mapSubpillar(doc: any): Subpillar {
    const subpillar = doc.toJSON();
    return {
      id: subpillar._id.toString(),
      title: subpillar.title,
      pillarId: subpillar.pillarId.toString(),
      createdById: subpillar.createdById.toString(),
      status: subpillar.status,
      createdAt: subpillar.createdAt,
      updatedAt: subpillar.updatedAt
    };
  }

  // Research operations with error handling
  async createResearch(data: ResearchCreateInput): Promise<Research> {
    try {
      const research = new ResearchModel({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await research.save();
      return this.mapResearchDocument(research);
    } catch (error) {
      this.handleError('createResearch', error);
      throw error;
    }
  }

  async findResearchById(researchId: string): Promise<Research | null> {
    try {
      const research = await ResearchModel.findById(researchId);
      return research ? this.mapResearchDocument(research) : null;
    } catch (error) {
      this.handleError('findResearchById', error);
      throw error;
    }
  }

  async findResearchBySubpillarId(subpillarId: string): Promise<Research[]> {
    try {
      const researchItems = await ResearchModel.find({ subpillarId }).sort({ createdAt: -1 });
      return researchItems.map(research => this.mapResearchDocument(research));
    } catch (error) {
      this.handleError('findResearchBySubpillarId', error);
      throw error;
    }
  }

  async updateResearch(researchId: string, data: ResearchUpdateInput): Promise<Research | null> {
    try {
      const research = await ResearchModel.findByIdAndUpdate(
        researchId,
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );
      return research ? this.mapResearchDocument(research) : null;
    } catch (error) {
      this.handleError('updateResearch', error);
      throw error;
    }
  }

  async deleteResearch(researchId: string): Promise<boolean> {
    try {
      const result = await ResearchModel.findByIdAndDelete(researchId);
      return result !== null;
    } catch (error) {
      this.handleError('deleteResearch', error);
      throw error;
    }
  }

  // Outline operations with error handling
  async createOutline(data: OutlineCreateInput): Promise<Outline> {
    try {
      const outline = new OutlineModel({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await outline.save();
      return this.mapOutlineDocument(outline);
    } catch (error) {
      this.handleError('createOutline', error);
      throw error;
    }
  }

  async findOutlineById(outlineId: string): Promise<Outline | null> {
    try {
      const outline = await OutlineModel.findById(outlineId);
      return outline ? this.mapOutlineDocument(outline) : null;
    } catch (error) {
      this.handleError('findOutlineById', error);
      throw error;
    }
  }

  async findOutlineBySubpillarId(subpillarId: string): Promise<Outline | null> {
    try {
      const outline = await OutlineModel.findOne({ subpillarId });
      return outline ? this.mapOutlineDocument(outline) : null;
    } catch (error) {
      this.handleError('findOutlineBySubpillarId', error);
      throw error;
    }
  }

  async updateOutline(outlineId: string, data: OutlineUpdateInput): Promise<Outline | null> {
    try {
      const outline = await OutlineModel.findByIdAndUpdate(
        outlineId,
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );
      return outline ? this.mapOutlineDocument(outline) : null;
    } catch (error) {
      this.handleError('updateOutline', error);
      throw error;
    }
  }

  async deleteOutline(outlineId: string): Promise<boolean> {
    try {
      const result = await OutlineModel.findByIdAndDelete(outlineId);
      return result !== null;
    } catch (error) {
      this.handleError('deleteOutline', error);
      throw error;
    }
  }

  // Article operations with error handling
  async createArticle(data: ArticleCreateInput): Promise<Article> {
    try {
      const article = new ArticleModel({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await article.save();
      return this.mapArticleDocument(article);
    } catch (error) {
      this.handleError('createArticle', error);
      throw error;
    }
  }

  async findArticleById(articleId: string): Promise<Article | null> {
    try {
      const article = await ArticleModel.findById(articleId);
      return article ? this.mapArticleDocument(article) : null;
    } catch (error) {
      this.handleError('findArticleById', error);
      throw error;
    }
  }

  async findArticlesBySubpillarId(subpillarId: string): Promise<Article[]> {
    try {
      const articles = await ArticleModel.find({ subpillarId }).sort({ createdAt: -1 });
      return articles.map(article => this.mapArticleDocument(article));
    } catch (error) {
      this.handleError('findArticlesBySubpillarId', error);
      throw error;
    }
  }

  async findArticlesByAuthorId(authorId: string): Promise<Article[]> {
    try {
      const articles = await ArticleModel.find({ authorId }).sort({ createdAt: -1 });
      return articles.map(article => this.mapArticleDocument(article));
    } catch (error) {
      this.handleError('findArticlesByAuthorId', error);
      throw error;
    }
  }

  async updateArticle(articleId: string, data: ArticleUpdateInput): Promise<Article | null> {
    try {
      const article = await ArticleModel.findByIdAndUpdate(
        articleId,
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );
      return article ? this.mapArticleDocument(article) : null;
    } catch (error) {
      this.handleError('updateArticle', error);
      throw error;
    }
  }

  async deleteArticle(articleId: string): Promise<boolean> {
    try {
      const result = await ArticleModel.findByIdAndDelete(articleId);
      return result !== null;
    } catch (error) {
      this.handleError('deleteArticle', error);
      throw error;
    }
  }

  private mapArticleDocument(doc: any): Article {
    return {
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content,
      subpillarId: doc.subpillarId.toString(),
      authorId: doc.authorId.toString(),
      status: doc.status || 'draft',
      seoScore: doc.seoScore,
      keywords: doc.keywords || [],
      metaDescription: doc.metaDescription,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  // Session Management Methods
  async createSession(data: SessionCreateInput): Promise<Session> {
    try {
      const session = new SessionModel({
        ...data,
        lastActivityAt: new Date()
      });
      await session.save();
      return session.toJSON();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findSessionById(id: string): Promise<Session | null> {
    try {
      const session = await SessionModel.findById(id).exec();
      return session ? session.toJSON() : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    try {
      const session = await SessionModel.findByToken(token);
      return session ? session.toJSON() : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findSessionsByUserId(userId: string): Promise<Session[]> {
    try {
      const sessions = await SessionModel.find({ userId, isActive: true }).exec();
      return sessions.map(session => session.toJSON());
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSession(id: string, data: SessionUpdateInput): Promise<Session | null> {
    try {
      const session = await SessionModel.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      ).exec();
      return session ? session.toJSON() : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      const result = await SessionModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteExpiredSessions(): Promise<number> {
    try {
      return await SessionModel.cleanupExpired();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUserSessions(userId: string): Promise<number> {
    try {
      const result = await SessionModel.deleteMany({ userId }).exec();
      return result.deletedCount;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cleanupSessions(): Promise<void> {
    try {
      await this.deleteExpiredSessions();
    } catch (error) {
      throw this.handleError(error);
    }
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

  async listNiches(userId: string): Promise<Niche[]> {
    try {
      const niches = await NicheModel.find({ userId }).sort({ createdAt: -1 });
      return niches.map(niche => this.mapNicheDocument(niche));
    } catch (error) {
      this.handleError('listNiches', error);
      throw error;
    }
  }

  async createNiche(data: NicheCreateInput): Promise<Niche> {
    try {
      const niche = new NicheModel({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await niche.save();
      return this.mapNicheDocument(niche);
    } catch (error) {
      this.handleError('createNiche', error);
      throw error;
    }
  }

  async getNicheById(nicheId: string, userId: string): Promise<Niche | null> {
    try {
      const niche = await NicheModel.findOne({ _id: nicheId, userId });
      return niche ? this.mapNicheDocument(niche) : null;
    } catch (error) {
      this.handleError('getNicheById', error);
      throw error;
    }
  }

  async updateNiche(nicheId: string, userId: string, data: NicheUpdateInput): Promise<Niche | null> {
    try {
      const niche = await NicheModel.findOneAndUpdate(
        { _id: nicheId, userId },
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );
      return niche ? this.mapNicheDocument(niche) : null;
    } catch (error) {
      this.handleError('updateNiche', error);
      throw error;
    }
  }

  async deleteNiche(nicheId: string, userId: string): Promise<boolean> {
    try {
      const result = await NicheModel.findOneAndDelete({ _id: nicheId, userId });
      return result !== null;
    } catch (error) {
      this.handleError('deleteNiche', error);
      throw error;
    }
  }

  private mapNicheDocument(doc: any): Niche {
    return {
      id: doc._id.toString(),
      name: doc.name,
      userId: doc.userId.toString(),
      pillars: doc.pillars || [],
      progress: doc.progress || 0,
      status: doc.status || 'new',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async createPillar(data: PillarCreateInput): Promise<Pillar> {
    try {
      const pillar = new PillarModel({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await pillar.save();
      return this.mapPillarDocument(pillar);
    } catch (error) {
      this.handleError('createPillar', error);
      throw error;
    }
  }

  async findPillarById(pillarId: string): Promise<Pillar | null> {
    try {
      const pillar = await PillarModel.findById(pillarId);
      return pillar ? this.mapPillarDocument(pillar) : null;
    } catch (error) {
      this.handleError('findPillarById', error);
      throw error;
    }
  }

  async findPillarsByNicheId(nicheId: string): Promise<Pillar[]> {
    try {
      const pillars = await PillarModel.find({ nicheId }).sort({ createdAt: -1 });
      return pillars.map(pillar => this.mapPillarDocument(pillar));
    } catch (error) {
      this.handleError('findPillarsByNicheId', error);
      throw error;
    }
  }

  async updatePillar(pillarId: string, data: PillarUpdateInput): Promise<Pillar | null> {
    try {
      const pillar = await PillarModel.findByIdAndUpdate(
        pillarId,
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );
      return pillar ? this.mapPillarDocument(pillar) : null;
    } catch (error) {
      this.handleError('updatePillar', error);
      throw error;
    }
  }

  async deletePillar(pillarId: string): Promise<boolean> {
    try {
      const result = await PillarModel.findByIdAndDelete(pillarId);
      return result !== null;
    } catch (error) {
      this.handleError('deletePillar', error);
      throw error;
    }
  }

  private mapPillarDocument(doc: any): Pillar {
    return {
      id: doc._id.toString(),
      title: doc.title,
      nicheId: doc.nicheId.toString(),
      status: doc.status,
      createdById: doc.createdById.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  private mapResearchDocument(doc: any): Research {
    return {
      id: doc._id.toString(),
      subpillarId: doc.subpillarId.toString(),
      content: doc.content,
      source: doc.source,
      notes: doc.notes,
      relevance: doc.relevance || 0,
      createdById: doc.createdById.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  private mapOutlineDocument(doc: any): Outline {
    return {
      id: doc._id.toString(),
      subpillarId: doc.subpillarId.toString(),
      sections: doc.sections.map((section: any) => ({
        title: section.title,
        contentPoints: section.contentPoints.map((point: any) => ({
          point: point.point,
          generated: point.generated
        })),
        order: section.order
      })),
      status: doc.status || 'draft',
      createdById: doc.createdById.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}