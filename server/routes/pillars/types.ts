import { ValidationSchema } from '../shared/types';

export type PillarStatus = 'pending' | 'approved' | 'rejected' | 'in_progress';

export interface PillarCreateRequest {
  title: string;
  nicheId: string;
  status?: PillarStatus;
}

export interface PillarUpdateRequest {
  title?: string;
  status?: PillarStatus;
}

export interface PillarGenerateRequest {
  nicheId: string;
}

export const createPillarSchema: ValidationSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    nicheId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'in_progress'] }
  },
  required: ['title', 'nicheId']
};

export const updatePillarSchema: ValidationSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'in_progress'] }
  }
};

export const generatePillarSchema: ValidationSchema = {
  type: 'object',
  properties: {
    nicheId: { type: 'string', format: 'uuid' }
  },
  required: ['nicheId']
};
