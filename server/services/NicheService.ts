import { DatabaseClient, Niche, NicheCreateInput, NicheUpdateInput, BaseEntity } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/log';
import { ValidationError } from '../database/mongodb/client';
import { isValidId } from '../utils/validation';
import { createLLMService } from './LLMService';

const log = logger('services/NicheService');

export class NicheService {
  private db: DatabaseClient;
  private llmService;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
    this.llmService = createLLMService(dbClient);
  }

  async list(userId: string): Promise<Niche[]> {
    try {
      log.info(`Fetching niches for user: ${userId}`);
      const niches = await this.db.findNichesByUserId(userId);
      log.info(`Found ${niches.length} niches for user ${userId}`);
      return niches;
    } catch (error) {
      log.error('Error in NicheService.list:', error);
      throw error;
    }
  }

  async create(userId: string, name: string): Promise<Niche> {
    try {
      log.info(`Creating niche "${name}" for user ${userId}`);
      const nicheData: NicheCreateInput = {
        name,
        userId,
        pillars: [],
        progress: 0,
        status: 'pending'
      };
      const niche = await this.db.createNiche(nicheData);
      log.info(`Created niche ${niche.id}`);
      return niche;
    } catch (error) {
      log.error('Error in NicheService.create:', error);
      throw error;
    }
  }

  async getById(nicheId: string, userId: string): Promise<Niche | null> {
    try {
      log.info(`Fetching niche ${nicheId} for user ${userId}`);
      const niche = await this.db.findNicheById(nicheId);

      if (!niche || niche.userId !== userId) {
        log.info(`Niche not found or not owned by user: ${nicheId}`);
        return null;
      }

      log.info(`Found niche ${nicheId}`);
      return niche;
    } catch (error) {
      log.error('Error in NicheService.getById:', error);
      throw error;
    }
  }

  async update(nicheId: string, userId: string, data: NicheUpdateInput): Promise<Niche | null> {
    try {
      log.info(`Updating niche ${nicheId} for user ${userId}`);
      const niche = await this.getById(nicheId, userId);

      if (!niche) {
        log.info(`Niche not found or not owned by user: ${nicheId}`);
        return null;
      }

      const updatedNiche = await this.db.updateNiche(nicheId, data);
      if (updatedNiche) {
        log.info(`Updated niche ${nicheId}`);
      }
      return updatedNiche;
    } catch (error) {
      log.error('Error in NicheService.update:', error);
      throw error;
    }
  }

  async delete(nicheId: string, userId: string): Promise<boolean> {
    try {
      log.info(`Deleting niche ${nicheId} for user ${userId}`);
      const niche = await this.getById(nicheId, userId);

      if (!niche) {
        log.info(`Niche not found or not owned by user: ${nicheId}`);
        return false;
      }

      const success = await this.db.deleteNiche(nicheId);
      if (success) {
        log.info(`Deleted niche ${nicheId}`);
      }
      return success;
    } catch (error) {
      log.error('Error in NicheService.delete:', error);
      throw error;
    }
  }

  async generatePillars(nicheId: string, userId: string): Promise<Niche['pillars']> {
    try {
      log.info(`Generating pillars for niche ${nicheId}`);

      if (!isValidId(nicheId)) {
        throw new ValidationError('Invalid niche ID format');
      }

      const niche = await this.getById(nicheId, userId);
      if (!niche) {
        throw new ValidationError('Niche not found or not owned by the user');
      }

      const pillarTitles = await this.llmService.generatePillars(nicheId);

      const pillars = pillarTitles.map(title => ({
        title,
        status: 'pending' as const,
        approved: false
      }));

      const updatedNiche = await this.db.updateNiche(nicheId, { pillars });
      if (!updatedNiche) {
        throw new Error('Failed to save generated pillars');
      }

      log.info(`Generated and saved pillars for niche ${nicheId}`);
      return updatedNiche.pillars;
    } catch (error) {
      log.error('Error in NicheService.generatePillars:', error);
      throw error;
    }
  }
}

// Factory function to create NicheService instance
export function createNicheService(dbClient?: DatabaseClient): NicheService {
  return new NicheService(dbClient);
}
