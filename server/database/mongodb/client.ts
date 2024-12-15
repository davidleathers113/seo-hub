import mongoose, { FilterQuery } from 'mongoose';
import {
  DatabaseClient,
  User,
  Niche,
  Pillar,
  Subpillar,
  Research,
  Outline,
  Article,
  BaseEntity,
  Session,
  SessionCreateInput,
  SessionUpdateInput,
  PaginationOptions,
  NicheFilters,
  PillarFilters,
  SubpillarFilters,
  ArticleFilters,
  NicheCreateInput,
  NicheUpdateInput,
  PillarCreateInput,
  PillarUpdateInput,
  SubpillarCreateInput,
  SubpillarUpdateInput,
  ResearchCreateInput,
  ResearchUpdateInput,
  OutlineCreateInput,
  OutlineUpdateInput,
  ArticleCreateInput,
  ArticleUpdateInput,
  UserCreateInput,
  UserUpdateInput
} from '../interfaces';
import { UserModel, NicheModel, PillarModel, SubpillarModel, ResearchModel, OutlineModel, ArticleModel, SessionModel } from './models';
import { logger } from '../../utils/log';

const log = logger('database/mongodb/client');

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

interface MongooseError extends Error {
  code?: number;
  name: string;
}

// Helper function to convert Mongoose documents to interface types
function convertDocument<T extends { id: string }>(
  doc: any
): T | null {
  if (!doc) return null;
  const json = doc.toJSON();
  if (json._id) {
    json.id = json._id.toString();
    delete json._id;
  }
  return json as T;
}

function convertDocuments<T extends { id: string }>(
  docs: any[]
): T[] {
  return docs.map(doc => {
    const json = doc.toJSON();
    if (json._id) {
      json.id = json._id.toString();
      delete json._id;
    }
    return json as T;
  });
}

export class MongoDBClient implements DatabaseClient {
  private uri: string;
  private connected: boolean = false;

  constructor(uri: string) {
    this.uri = uri;
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
    } catch (error) {
      const mongoError = error as MongooseError;
      log.error(`[MongoDB Error] ${context}:`, {
        error: mongoError.message,
        stack: mongoError.stack,
        name: mongoError.name,
        context
      });

      if (mongoError.name === 'ValidationError') {
        throw new ValidationError(mongoError.message);
      }

      if (mongoError.name === 'MongoServerError' && mongoError.code === 11000) {
        throw new DatabaseOperationError('Duplicate key error', context, mongoError);
      }

      throw new DatabaseOperationError(
        `Failed to perform operation: ${context}`,
        context,
        mongoError
      );
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await mongoose.connect(this.uri);
      this.connected = true;
      log.info('Connected to MongoDB');
    } catch (error) {
      const mongoError = error as MongooseError;
      throw new DatabaseConnectionError('Failed to connect to MongoDB', mongoError);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await mongoose.disconnect();
      this.connected = false;
      log.info('Disconnected from MongoDB');
    } catch (error) {
      const mongoError = error as MongooseError;
      throw new DatabaseConnectionError('Failed to disconnect from MongoDB', mongoError);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const state = mongoose.connection.readyState;
      const isHealthy = state === 1;
      log.debug(`MongoDB health check - Status: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      return isHealthy;
    } catch (error) {
      const mongoError = error as MongooseError;
      log.error('Health check failed:', mongoError);
      return false;
    }
  }

  // User operations
  async createUser(input: UserCreateInput): Promise<User> {
    const user = await UserModel.create(input);
    const converted = convertDocument<User>(user);
    if (!converted) throw new Error('Failed to create user');
    return converted;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).exec();
    return convertDocument<User>(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    // Include password field for authentication
    const user = await UserModel.findOne({ email })
      .select('+password')
      .exec();
    return convertDocument<User>(user);
  }

  async findAllUsers(): Promise<User[]> {
    const users = await UserModel.find().exec();
    return convertDocuments<User>(users);
  }

  async updateUser(id: string, input: UserUpdateInput): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<User>(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await UserModel.findByIdAndDelete(id).exec();
    return user !== null;
  }

  async findUserByToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({ token }).exec();
    return convertDocument<User>(user);
  }

  async findUsers(): Promise<User[]> {
    const users = await UserModel.find().exec();
    return convertDocuments<User>(users);
  }

  // Niche operations
  async createNiche(input: NicheCreateInput): Promise<Niche> {
    const niche = await NicheModel.create(input);
    const converted = convertDocument<Niche>(niche);
    if (!converted) throw new Error('Failed to create niche');
    return converted;
  }

  async findNicheById(id: string): Promise<Niche | null> {
    const niche = await NicheModel.findById(id).exec();
    return convertDocument<Niche>(niche);
  }

  async findAllNiches(): Promise<Niche[]> {
    const niches = await NicheModel.find().exec();
    return convertDocuments<Niche>(niches);
  }

  async findNichesByUserId(userId: string): Promise<Niche[]> {
    const niches = await NicheModel.find({ userId }).exec();
    return convertDocuments<Niche>(niches);
  }

  async updateNiche(id: string, input: NicheUpdateInput): Promise<Niche | null> {
    const niche = await NicheModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<Niche>(niche);
  }

  async deleteNiche(id: string): Promise<boolean> {
    const niche = await NicheModel.findByIdAndDelete(id).exec();
    return niche !== null;
  }

  async findNiches(filters: NicheFilters, options?: PaginationOptions): Promise<Niche[]> {
    return this.handleDatabaseOperation(async () => {
      let query = NicheModel.find(filters as FilterQuery<typeof NicheModel>);

      if (options) {
        const { page = 1, limit = 10, sortBy, sortOrder } = options;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (sortBy) {
          const sort = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
          query = query.sort(sort);
        }
      }

      const niches = await query.exec();
      return convertDocuments<Niche>(niches);
    }, 'findNiches');
  }

  // Pillar operations
  async createPillar(input: PillarCreateInput): Promise<Pillar> {
    const pillar = await PillarModel.create(input);
    const converted = convertDocument<Pillar>(pillar);
    if (!converted) throw new Error('Failed to create pillar');
    return converted;
  }

  async findPillarById(id: string): Promise<Pillar | null> {
    const pillar = await PillarModel.findById(id).exec();
    return convertDocument<Pillar>(pillar);
  }

  async findAllPillars(): Promise<Pillar[]> {
    const pillars = await PillarModel.find().exec();
    return convertDocuments<Pillar>(pillars);
  }

  async findPillarsByNicheId(nicheId: string): Promise<Pillar[]> {
    const pillars = await PillarModel.find({ nicheId }).exec();
    return convertDocuments<Pillar>(pillars);
  }

  async updatePillar(id: string, input: PillarUpdateInput): Promise<Pillar | null> {
    const pillar = await PillarModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<Pillar>(pillar);
  }

  async deletePillar(id: string): Promise<boolean> {
    const pillar = await PillarModel.findByIdAndDelete(id).exec();
    return pillar !== null;
  }

  async findPillars(filters: PillarFilters, options?: PaginationOptions): Promise<Pillar[]> {
    return this.handleDatabaseOperation(async () => {
      let query = PillarModel.find(filters as FilterQuery<typeof PillarModel>);

      if (options) {
        const { page = 1, limit = 10, sortBy, sortOrder } = options;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (sortBy) {
          const sort = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
          query = query.sort(sort);
        }
      }

      const pillars = await query.exec();
      return convertDocuments<Pillar>(pillars);
    }, 'findPillars');
  }

  // Subpillar operations
  async createSubpillar(input: SubpillarCreateInput): Promise<Subpillar> {
    const subpillar = await SubpillarModel.create(input);
    const converted = convertDocument<Subpillar>(subpillar);
    if (!converted) throw new Error('Failed to create subpillar');
    return converted;
  }

  async findSubpillarById(id: string): Promise<Subpillar | null> {
    const subpillar = await SubpillarModel.findById(id).exec();
    return convertDocument<Subpillar>(subpillar);
  }

  async findAllSubpillars(): Promise<Subpillar[]> {
    const subpillars = await SubpillarModel.find().exec();
    return convertDocuments<Subpillar>(subpillars);
  }

  async findSubpillarsByPillarId(pillarId: string): Promise<Subpillar[]> {
    const subpillars = await SubpillarModel.find({ pillarId }).exec();
    return convertDocuments<Subpillar>(subpillars);
  }

  async updateSubpillar(id: string, input: SubpillarUpdateInput): Promise<Subpillar | null> {
    const subpillar = await SubpillarModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<Subpillar>(subpillar);
  }

  async deleteSubpillar(id: string): Promise<boolean> {
    const subpillar = await SubpillarModel.findByIdAndDelete(id).exec();
    return subpillar !== null;
  }

  async findSubpillars(filters: SubpillarFilters, options?: PaginationOptions): Promise<Subpillar[]> {
    return this.handleDatabaseOperation(async () => {
      let query = SubpillarModel.find(filters as FilterQuery<typeof SubpillarModel>);

      if (options) {
        const { page = 1, limit = 10, sortBy, sortOrder } = options;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (sortBy) {
          const sort = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
          query = query.sort(sort);
        }
      }

      const subpillars = await query.exec();
      return convertDocuments<Subpillar>(subpillars);
    }, 'findSubpillars');
  }

  // Research operations
  async createResearch(input: ResearchCreateInput): Promise<Research> {
    const research = await ResearchModel.create(input);
    const converted = convertDocument<Research>(research);
    if (!converted) throw new Error('Failed to create research');
    return converted;
  }

  async findResearchById(id: string): Promise<Research | null> {
    const research = await ResearchModel.findById(id).exec();
    return convertDocument<Research>(research);
  }

  async findAllResearch(): Promise<Research[]> {
    const research = await ResearchModel.find().exec();
    return convertDocuments<Research>(research);
  }

  async updateResearch(id: string, input: ResearchUpdateInput): Promise<Research | null> {
    const research = await ResearchModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<Research>(research);
  }

  async deleteResearch(id: string): Promise<boolean> {
    const research = await ResearchModel.findByIdAndDelete(id).exec();
    return research !== null;
  }

  async findResearchBySubpillarId(subpillarId: string): Promise<Research[]> {
    const research = await ResearchModel.find({ subpillarId }).exec();
    return convertDocuments<Research>(research);
  }

  // Outline operations
  async createOutline(input: OutlineCreateInput): Promise<Outline> {
    const outline = await OutlineModel.create(input);
    const converted = convertDocument<Outline>(outline);
    if (!converted) throw new Error('Failed to create outline');
    return converted;
  }

  async findOutlineById(id: string): Promise<Outline | null> {
    const outline = await OutlineModel.findById(id).exec();
    return convertDocument<Outline>(outline);
  }

  async findOutlineByArticleId(articleId: string): Promise<Outline | null> {
    const outline = await OutlineModel.findOne({ articleId }).exec();
    return convertDocument<Outline>(outline);
  }

  async updateOutline(id: string, input: OutlineUpdateInput): Promise<Outline | null> {
    const outline = await OutlineModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<Outline>(outline);
  }

  async findOutlineBySubpillarId(subpillarId: string): Promise<Outline | null> {
    const outline = await OutlineModel.findOne({ subpillar: subpillarId }).exec();
    return convertDocument<Outline>(outline);
  }

  async deleteOutline(id: string): Promise<boolean> {
    const result = await OutlineModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  // Article operations
  async createArticle(input: ArticleCreateInput): Promise<Article> {
    const article = await ArticleModel.create(input);
    const converted = convertDocument<Article>(article);
    if (!converted) throw new Error('Failed to create article');
    return converted;
  }

  async findArticleById(id: string): Promise<Article | null> {
    const article = await ArticleModel.findById(id).exec();
    return convertDocument<Article>(article);
  }

  async findAllArticles(): Promise<Article[]> {
    const articles = await ArticleModel.find().exec();
    return convertDocuments<Article>(articles);
  }

  async updateArticle(id: string, input: ArticleUpdateInput): Promise<Article | null> {
    const article = await ArticleModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<Article>(article);
  }

  async deleteArticle(id: string): Promise<boolean> {
    const article = await ArticleModel.findByIdAndDelete(id).exec();
    return article !== null;
  }

  async findArticlesBySubpillarId(subpillarId: string): Promise<Article[]> {
    const articles = await ArticleModel.find({ subpillarId }).exec();
    return convertDocuments<Article>(articles);
  }

  async findArticles(filters: ArticleFilters, options?: PaginationOptions): Promise<Article[]> {
    return this.handleDatabaseOperation(async () => {
      let query = ArticleModel.find(filters as FilterQuery<typeof ArticleModel>);

      if (options) {
        const { page = 1, limit = 10, sortBy, sortOrder } = options;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (sortBy) {
          const sort = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
          query = query.sort(sort);
        }
      }

      const articles = await query.exec();
      return convertDocuments<Article>(articles);
    }, 'findArticles');
  }

  // Session operations
  async createSession(input: SessionCreateInput): Promise<Session> {
    const session = await SessionModel.create(input);
    const converted = convertDocument<Session>(session);
    if (!converted) throw new Error('Failed to create session');
    return converted;
  }

  async findSessionById(id: string): Promise<Session | null> {
    const session = await SessionModel.findById(id).exec();
    return convertDocument<Session>(session);
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    const session = await SessionModel.findOne({ token }).exec();
    return convertDocument<Session>(session);
  }

  async findAllSessions(): Promise<Session[]> {
    const sessions = await SessionModel.find().exec();
    return convertDocuments<Session>(sessions);
  }

  async updateSession(id: string, input: SessionUpdateInput): Promise<Session | null> {
    const session = await SessionModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return convertDocument<Session>(session);
  }

  async deleteSession(id: string): Promise<boolean> {
    const session = await SessionModel.findByIdAndDelete(id).exec();
    return session !== null;
  }

  async deleteExpiredSessions(): Promise<number> {
    return this.handleDatabaseOperation(async () => {
      const result = await SessionModel.deleteMany({
        expiresAt: { $lt: new Date() }
      }).exec();
      return result.deletedCount || 0;
    }, 'deleteExpiredSessions');
  }

  async deleteUserSessions(userId: string): Promise<number> {
    this.validateObjectId(userId, 'deleteUserSessions');
    return this.handleDatabaseOperation(async () => {
      const result = await SessionModel.deleteMany({ userId }).exec();
      return result.deletedCount || 0;
    }, 'deleteUserSessions');
  }

  async cleanupSessions(): Promise<void> {
    await this.handleDatabaseOperation(async () => {
      await this.deleteExpiredSessions();
    }, 'cleanupSessions');
  }

  async findSessionsByUserId(userId: string): Promise<Session[]> {
    const sessions = await SessionModel.find({ userId }).exec();
    return convertDocuments<Session>(sessions);
  }
}
