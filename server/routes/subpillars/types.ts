import { ValidationSchema } from '../shared/types';
import { PillarDocument } from '../../database/mongodb/models/Pillar';

export type SubpillarStatus = 'draft' | 'active' | 'archived';

// Extend the request type to include pillar
export interface SubpillarRequest {
  pillar?: PillarDocument;
}

export interface UpdateSubpillarRequest {
  title?: string;
  status?: SubpillarStatus;
}

export interface CreateSubpillarRequest {
  title: string;
  pillarId: string;
  createdById: string;
  status: SubpillarStatus;
}

export interface GenerateSubpillarsRequest {
  pillarId: string;
}

export const createSubpillarSchema: ValidationSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    pillarId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['draft', 'active', 'archived'] }
  },
  required: ['title', 'pillarId']
};

export const updateSubpillarSchema: ValidationSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    status: { type: 'string', enum: ['draft', 'active', 'archived'] }
  }
};

export const generateSubpillarsSchema: ValidationSchema = {
  type: 'object',
  properties: {
    pillarId: { type: 'string', format: 'uuid' }
  },
  required: ['pillarId']
};
