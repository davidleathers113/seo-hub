import { ValidationSchema } from '../shared/types';
import { OutlineSection } from '../../database/interfaces';

export interface CreateOutlineRequest {
  title: string;
  description?: string;
}

export interface UpdateSectionsRequest {
  sections: OutlineSection[];
}

export interface AddSectionRequest {
  title: string;
  content: string;
  keywords?: string[];
}

export interface UpdateStatusRequest {
  status: string;
}

export interface UpdateSectionRequest {
  title?: string;
  content?: string;
  keywords?: string[];
}

export const createOutlineSchema: ValidationSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 1000 }
  },
  required: ['title']
};

export const updateSectionsSchema: ValidationSchema = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          content: { type: 'string', minLength: 1 },
          keywords: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'content']
      }
    }
  },
  required: ['sections']
};

export const addSectionSchema: ValidationSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    content: { type: 'string', minLength: 1 },
    keywords: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'content']
};

export const updateSectionSchema: ValidationSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    content: { type: 'string', minLength: 1 },
    keywords: { type: 'array', items: { type: 'string' } }
  }
};

export const updateStatusSchema: ValidationSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['draft', 'approved', 'in_progress'] }
  },
  required: ['status']
};
