import { DatabaseClient, Outline, OutlineCreateInput, OutlineUpdateInput, OutlineSection } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/log';
import { ValidationError } from '../database/mongodb/client';

const log = logger('services/OutlineService');

export class OutlineService {
  private db: DatabaseClient;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
  }

  async create(subpillarId: string, userId: string, sections: OutlineSection[]): Promise<Outline> {
    try {
      log.info(`Creating outline for subpillar ${subpillarId} by user ${userId}`);
      const outline = await this.db.createOutline({
        subpillarId,
        sections,
        status: 'draft',
        createdById: userId
      });
      log.info(`Created outline ${outline.id} for subpillar ${subpillarId}`);
      return outline;
    } catch (error) {
      log.error('Error in OutlineService.create:', error);
      throw error;
    }
  }

  async getById(outlineId: string): Promise<Outline | null> {
    try {
      log.info(`Fetching outline ${outlineId}`);
      const outline = await this.db.findOutlineById(outlineId);
      if (outline) {
        log.info(`Found outline ${outlineId}`);
      } else {
        log.info(`Outline ${outlineId} not found`);
      }
      return outline;
    } catch (error) {
      log.error('Error in OutlineService.getById:', error);
      throw error;
    }
  }

  async getBySubpillarId(subpillarId: string): Promise<Outline | null> {
    try {
      log.info(`Fetching outline for subpillar ${subpillarId}`);
      const outline = await this.db.findOutlineBySubpillarId(subpillarId);
      if (outline) {
        log.info(`Found outline for subpillar ${subpillarId}`);
      } else {
        log.info(`No outline found for subpillar ${subpillarId}`);
      }
      return outline;
    } catch (error) {
      log.error('Error in OutlineService.getBySubpillarId:', error);
      throw error;
    }
  }

  async update(outlineId: string, userId: string, data: OutlineUpdateInput): Promise<Outline | null> {
    try {
      log.info(`Updating outline ${outlineId} by user ${userId}`);
      const outline = await this.getById(outlineId);

      if (!outline) {
        log.info(`Outline ${outlineId} not found`);
        return null;
      }

      if (outline.createdById !== userId) {
        log.warn(`User ${userId} not authorized to update outline ${outlineId}`);
        throw new ValidationError('Not authorized to modify this outline');
      }

      const updatedOutline = await this.db.updateOutline(outlineId, data);
      if (updatedOutline) {
        log.info(`Updated outline ${outlineId}`);
      }
      return updatedOutline;
    } catch (error) {
      log.error('Error in OutlineService.update:', error);
      throw error;
    }
  }

  async updateStatus(outlineId: string, userId: string, status: Outline['status']): Promise<Outline | null> {
    try {
      log.info(`Updating status to ${status} for outline ${outlineId} by user ${userId}`);
      const outline = await this.getById(outlineId);

      if (!outline) {
        log.info(`Outline ${outlineId} not found`);
        return null;
      }

      if (outline.createdById !== userId) {
        log.warn(`User ${userId} not authorized to update status for outline ${outlineId}`);
        throw new ValidationError('Not authorized to modify this outline');
      }

      const updatedOutline = await this.db.updateOutline(outlineId, { status });
      if (updatedOutline) {
        log.info(`Updated status to ${status} for outline ${outlineId}`);
      }
      return updatedOutline;
    } catch (error) {
      log.error('Error in OutlineService.updateStatus:', error);
      throw error;
    }
  }

  async addSection(outlineId: string, userId: string, section: OutlineSection): Promise<Outline | null> {
    try {
      log.info(`Adding section to outline ${outlineId} by user ${userId}`);
      const outline = await this.getById(outlineId);

      if (!outline) {
        log.info(`Outline ${outlineId} not found`);
        return null;
      }

      if (outline.createdById !== userId) {
        log.warn(`User ${userId} not authorized to modify outline ${outlineId}`);
        throw new ValidationError('Not authorized to modify this outline');
      }

      const sections = [...outline.sections, section];
      const updatedOutline = await this.db.updateOutline(outlineId, { sections });
      if (updatedOutline) {
        log.info(`Added section to outline ${outlineId}`);
      }
      return updatedOutline;
    } catch (error) {
      log.error('Error in OutlineService.addSection:', error);
      throw error;
    }
  }

  async updateSection(outlineId: string, userId: string, sectionIndex: number, section: OutlineSection): Promise<Outline | null> {
    try {
      log.info(`Updating section ${sectionIndex} in outline ${outlineId} by user ${userId}`);
      const outline = await this.getById(outlineId);

      if (!outline) {
        log.info(`Outline ${outlineId} not found`);
        return null;
      }

      if (outline.createdById !== userId) {
        log.warn(`User ${userId} not authorized to modify outline ${outlineId}`);
        throw new ValidationError('Not authorized to modify this outline');
      }

      if (sectionIndex < 0 || sectionIndex >= outline.sections.length) {
        throw new ValidationError('Invalid section index');
      }

      const sections = [...outline.sections];
      sections[sectionIndex] = section;

      const updatedOutline = await this.db.updateOutline(outlineId, { sections });
      if (updatedOutline) {
        log.info(`Updated section ${sectionIndex} in outline ${outlineId}`);
      }
      return updatedOutline;
    } catch (error) {
      log.error('Error in OutlineService.updateSection:', error);
      throw error;
    }
  }

  async delete(outlineId: string, userId: string): Promise<boolean> {
    try {
      log.info(`Deleting outline ${outlineId} by user ${userId}`);
      const outline = await this.getById(outlineId);

      if (!outline) {
        log.info(`Outline ${outlineId} not found`);
        return false;
      }

      if (outline.createdById !== userId) {
        log.warn(`User ${userId} not authorized to delete outline ${outlineId}`);
        throw new ValidationError('Not authorized to delete this outline');
      }

      const success = await this.db.deleteOutline(outlineId);
      if (success) {
        log.info(`Deleted outline ${outlineId}`);
      }
      return success;
    } catch (error) {
      log.error('Error in OutlineService.delete:', error);
      throw error;
    }
  }
}

// Factory function to create OutlineService instance
export function createOutlineService(dbClient?: DatabaseClient): OutlineService {
  return new OutlineService(dbClient);
}