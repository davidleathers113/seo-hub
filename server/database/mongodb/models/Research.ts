import mongoose from 'mongoose';
import { Research } from '../../interfaces';

// Define the Mongoose document type
export interface ResearchDocument extends mongoose.Document, Omit<Research, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// Define the Mongoose model type
export interface ResearchModel extends mongoose.Model<ResearchDocument> {}

// Define the main schema
const researchSchema = new mongoose.Schema({
  subpillarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subpillar',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  relevance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    required: false
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
researchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform the document when converting to JSON
researchSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    return {
      id: ret._id.toString(),
      subpillarId: ret.subpillarId.toString(),
      content: ret.content,
      source: ret.source,
      relevance: ret.relevance,
      notes: ret.notes,
      createdById: ret.createdById.toString(),
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt
    };
  }
});

// Create and export the model
export const ResearchModel = (mongoose.models.Research || mongoose.model<ResearchDocument, ResearchModel>('Research', researchSchema)) as ResearchModel;

export default ResearchModel;