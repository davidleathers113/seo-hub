import { DatabaseClient, Research, ResearchCreateInput, ResearchUpdateInput } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/log';
import { ValidationError } from '../database/mongodb/client';

const log = logger('services/ResearchService');

export class ResearchService {
  private db: DatabaseClient;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
  }

  async create(subpillarId: string, userId: string, data: Omit<ResearchCreateInput, 'subpillarId' | 'createdById'>): Promise<Research> {
    try {
      log.info(`Creating research for subpillar ${subpillarId} by user ${userId}`);
      const research = await this.db.createResearch({
        ...data,
        subpillarId,
        createdById: userId
      });
      log.info(`Created research ${research.id} for subpillar ${subpillarId}`);
      return research;
    } catch (error) {
      log.error('Error in ResearchService.create:', error);
      throw error;
    }
  }

  async getBySubpillarId(subpillarId: string): Promise<Research[]> {
    try {
      log.info(`Fetching research items for subpillar ${subpillarId}`);
      const researchItems = await this.db.findResearchBySubpillarId(subpillarId);
      log.info(`Found ${researchItems.length} research items for subpillar ${subpillarId}`);
      return researchItems;
    } catch (error) {
      log.error('Error in ResearchService.getBySubpillarId:', error);
      throw error;
    }
  }

  async getById(researchId: string): Promise<Research | null> {
    try {
      log.info(`Fetching research ${researchId}`);
      const research = await this.db.findResearchById(researchId);
      if (research) {
        log.info(`Found research ${researchId}`);
      } else {
        log.info(`Research ${researchId} not found`);
      }
      return research;
    } catch (error) {
      log.error('Error in ResearchService.getById:', error);
      throw error;
    }
  }

  async update(researchId: string, userId: string, data: ResearchUpdateInput): Promise<Research | null> {
    try {
      log.info(`Updating research ${researchId} by user ${userId}`);
      const research = await this.getById(researchId);

      if (!research) {
        log.info(`Research ${researchId} not found`);
        return null;
      }

      if (research.createdById !== userId) {
        log.warn(`User ${userId} not authorized to update research ${researchId}`);
        throw new ValidationError('Not authorized to modify this research');
      }

      const updatedResearch = await this.db.updateResearch(researchId, data);
      if (updatedResearch) {
        log.info(`Updated research ${researchId}`);
      }
      return updatedResearch;
    } catch (error) {
      log.error('Error in ResearchService.update:', error);
      throw error;
    }
  }

  async delete(researchId: string, userId: string): Promise<boolean> {
    try {
      log.info(`Deleting research ${researchId} by user ${userId}`);
      const research = await this.getById(researchId);

      if (!research) {
        log.info(`Research ${researchId} not found`);
        return false;
      }

      if (research.createdById !== userId) {
        log.warn(`User ${userId} not authorized to delete research ${researchId}`);
        throw new ValidationError('Not authorized to delete this research');
      }

      const success = await this.db.deleteResearch(researchId);
      if (success) {
        log.info(`Deleted research ${researchId}`);
      }
      return success;
    } catch (error) {
      log.error('Error in ResearchService.delete:', error);
      throw error;
    }
  }
}

// Factory function to create ResearchService instance
export function createResearchService(dbClient?: DatabaseClient): ResearchService {
  return new ResearchService(dbClient);
}