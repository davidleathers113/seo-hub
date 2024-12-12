import { DatabaseClient, Pillar, PillarCreateInput, PillarUpdateInput } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/log';
import { ValidationError } from '../database/mongodb/client';

const log = logger('services/PillarService');

export class PillarService {
  private db: DatabaseClient;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
  }

  async create(nicheId: string, userId: string, data: PillarCreateInput): Promise<Pillar> {
    try {
      log.info(`Creating pillar for niche ${nicheId} by user ${userId}`);
      const pillar = await this.db.createPillar({
        ...data,
        nicheId,
        createdById: userId
      });
      log.info(`Created pillar ${pillar.id} for niche ${nicheId}`);
      return pillar;
    } catch (error) {
      log.error('Error in PillarService.create:', error);
      throw error;
    }
  }

  async createMany(nicheId: string, userId: string, pillars: PillarCreateInput[]): Promise<Pillar[]> {
    try {
      log.info(`Creating ${pillars.length} pillars for niche ${nicheId} by user ${userId}`);
      const createdPillars = await Promise.all(
        pillars.map(pillar => this.create(nicheId, userId, pillar))
      );
      log.info(`Created ${createdPillars.length} pillars for niche ${nicheId}`);
      return createdPillars;
    } catch (error) {
      log.error('Error in PillarService.createMany:', error);
      throw error;
    }
  }

  async getByNicheId(nicheId: string): Promise<Pillar[]> {
    try {
      log.info(`Fetching pillars for niche ${nicheId}`);
      const pillars = await this.db.findPillarsByNicheId(nicheId);
      log.info(`Found ${pillars.length} pillars for niche ${nicheId}`);
      return pillars;
    } catch (error) {
      log.error('Error in PillarService.getByNicheId:', error);
      throw error;
    }
  }

  async getById(pillarId: string): Promise<Pillar | null> {
    try {
      log.info(`Fetching pillar ${pillarId}`);
      const pillar = await this.db.findPillarById(pillarId);
      if (pillar) {
        log.info(`Found pillar ${pillarId}`);
      } else {
        log.info(`Pillar ${pillarId} not found`);
      }
      return pillar;
    } catch (error) {
      log.error('Error in PillarService.getById:', error);
      throw error;
    }
  }

  async update(pillarId: string, userId: string, data: PillarUpdateInput): Promise<Pillar | null> {
    try {
      log.info(`Updating pillar ${pillarId} by user ${userId}`);
      const pillar = await this.getById(pillarId);

      if (!pillar) {
        log.info(`Pillar ${pillarId} not found`);
        return null;
      }

      if (pillar.createdById !== userId) {
        log.warn(`User ${userId} not authorized to update pillar ${pillarId}`);
        throw new ValidationError('Not authorized to modify this pillar');
      }

      const updatedPillar = await this.db.updatePillar(pillarId, data);
      if (updatedPillar) {
        log.info(`Updated pillar ${pillarId}`);
      }
      return updatedPillar;
    } catch (error) {
      log.error('Error in PillarService.update:', error);
      throw error;
    }
  }

  async approve(pillarId: string, userId: string): Promise<Pillar | null> {
    try {
      log.info(`Approving pillar ${pillarId} by user ${userId}`);
      const pillar = await this.getById(pillarId);

      if (!pillar) {
        log.info(`Pillar ${pillarId} not found`);
        return null;
      }

      if (pillar.createdById !== userId) {
        log.warn(`User ${userId} not authorized to approve pillar ${pillarId}`);
        throw new ValidationError('Not authorized to approve this pillar');
      }

      if (pillar.status === 'approved') {
        log.warn(`Pillar ${pillarId} is already approved`);
        throw new ValidationError('Pillar is already approved');
      }

      const updatedPillar = await this.db.updatePillar(pillarId, { status: 'approved' });
      if (updatedPillar) {
        log.info(`Approved pillar ${pillarId}`);
      }
      return updatedPillar;
    } catch (error) {
      log.error('Error in PillarService.approve:', error);
      throw error;
    }
  }

  async delete(pillarId: string, userId: string): Promise<boolean> {
    try {
      log.info(`Deleting pillar ${pillarId} by user ${userId}`);
      const pillar = await this.getById(pillarId);

      if (!pillar) {
        log.info(`Pillar ${pillarId} not found`);
        return false;
      }

      if (pillar.createdById !== userId) {
        log.warn(`User ${userId} not authorized to delete pillar ${pillarId}`);
        throw new ValidationError('Not authorized to delete this pillar');
      }

      const success = await this.db.deletePillar(pillarId);
      if (success) {
        log.info(`Deleted pillar ${pillarId}`);
      }
      return success;
    } catch (error) {
      log.error('Error in PillarService.delete:', error);
      throw error;
    }
  }
}

// Factory function to create PillarService instance
export function createPillarService(dbClient?: DatabaseClient): PillarService {
  return new PillarService(dbClient);
}