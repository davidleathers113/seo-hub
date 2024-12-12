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
  pillar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pillar',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  createdBy: {
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
subpillarSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform the document when converting to JSON
subpillarSchema.set('toJSON', {
  transform: (doc: SubpillarDocument, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

// Create and export the model
export const SubpillarModel = (mongoose.models.Subpillar || mongoose.model<SubpillarDocument, SubpillarModel>('Subpillar', subpillarSchema)) as SubpillarModel;

export default SubpillarModel;