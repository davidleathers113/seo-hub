import { DatabaseClient, Subpillar, SubpillarCreateInput, SubpillarUpdateInput } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/errors';

const log = logger('services/SubpillarService');

export class SubpillarService {
  private db: DatabaseClient;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
  }

  async create(data: SubpillarCreateInput): Promise<Subpillar> {
    try {
      log.info(`Creating subpillar for pillar ${data.pillarId}`);
      const subpillar = await this.db.createSubpillar(data);
      log.info(`Created subpillar ${subpillar.id}`);
      return subpillar;
    } catch (error) {
      log.error('Error in SubpillarService.create:', error);
      throw error;
    }
  }

  async getByPillarId(pillarId: string): Promise<Subpillar[]> {
    try {
      log.info(`Fetching subpillars for pillar ${pillarId}`);
      const subpillars = await this.db.findSubpillarsByPillarId(pillarId);
      log.info(`Found ${subpillars.length} subpillars for pillar ${pillarId}`);
      return subpillars;
    } catch (error) {
      log.error('Error in SubpillarService.getByPillarId:', error);
      throw error;
    }
  }

  async getById(subpillarId: string): Promise<Subpillar | null> {
    try {
      log.info(`Fetching subpillar ${subpillarId}`);
      const subpillar = await this.db.findSubpillarById(subpillarId);
      if (subpillar) {
        log.info(`Found subpillar ${subpillarId}`);
      } else {
        log.info(`Subpillar ${subpillarId} not found`);
      }
      return subpillar;
    } catch (error) {
      log.error('Error in SubpillarService.getById:', error);
      throw error;
    }
  }

  async update(subpillarId: string, userId: string, data: SubpillarUpdateInput): Promise<Subpillar | null> {
    try {
      log.info(`Updating subpillar ${subpillarId}`);
      const subpillar = await this.getById(subpillarId);

      if (!subpillar) {
        log.info(`Subpillar ${subpillarId} not found`);
        return null;
      }

      if (subpillar.createdById !== userId) {
        log.warn(`User ${userId} not authorized to update subpillar ${subpillarId}`);
        throw new ValidationError('Not authorized to modify this subpillar');
      }

      const updatedSubpillar = await this.db.updateSubpillar(subpillarId, data);
      if (updatedSubpillar) {
        log.info(`Updated subpillar ${subpillarId}`);
      }
      return updatedSubpillar;
    } catch (error) {
      log.error('Error in SubpillarService.update:', error);
      throw error;
    }
  }

  async delete(subpillarId: string, userId: string): Promise<boolean> {
    try {
      log.info(`Deleting subpillar ${subpillarId}`);
      const subpillar = await this.getById(subpillarId);

      if (!subpillar) {
        log.info(`Subpillar ${subpillarId} not found`);
        return false;
      }

      if (subpillar.createdById !== userId) {
        log.warn(`User ${userId} not authorized to delete subpillar ${subpillarId}`);
        throw new ValidationError('Not authorized to delete this subpillar');
      }

      const success = await this.db.deleteSubpillar(subpillarId);
      if (success) {
        log.info(`Deleted subpillar ${subpillarId}`);
      }
      return success;
    } catch (error) {
      log.error('Error in SubpillarService.delete:', error);
      throw error;
    }
  }
}

// Factory function to create SubpillarService instance
export function createSubpillarService(dbClient?: DatabaseClient): SubpillarService {
  return new SubpillarService(dbClient);
}