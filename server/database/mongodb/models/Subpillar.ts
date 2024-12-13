import mongoose from 'mongoose';
import { Subpillar } from '../../interfaces';

// Define the Mongoose document type
export interface SubpillarDocument extends mongoose.Document, Omit<Subpillar, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// Define the Mongoose model type
export interface SubpillarModel extends mongoose.Model<SubpillarDocument> {}

// Define the main schema
const subpillarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  pillarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pillar',
    required: true
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
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
subpillarSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform the document when converting to JSON
subpillarSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    return {
      id: ret._id.toString(),
      title: ret.title,
      pillarId: ret.pillarId.toString(),
      createdById: ret.createdById.toString(),
      status: ret.status,
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt
    };
  }
});

// Create and export the model
export const SubpillarModel = (mongoose.models.Subpillar || mongoose.model<SubpillarDocument, SubpillarModel>('Subpillar', subpillarSchema)) as SubpillarModel;

export default SubpillarModel;