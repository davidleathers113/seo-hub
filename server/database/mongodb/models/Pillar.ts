import mongoose from 'mongoose';
import { Pillar } from '../../interfaces';

// Define the Mongoose document type
export interface PillarDocument extends mongoose.Document, Omit<Pillar, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// Define the Mongoose model type
export interface PillarModel extends mongoose.Model<PillarDocument> {}

// Define the main schema
const pillarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  niche: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Niche',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_progress'],
    default: 'pending'
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
pillarSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform the document when converting to JSON
pillarSchema.set('toJSON', {
  transform: (doc: PillarDocument, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

// Create and export the model
export const PillarModel = (mongoose.models.Pillar || mongoose.model<PillarDocument, PillarModel>('Pillar', pillarSchema)) as PillarModel;

export default PillarModel;