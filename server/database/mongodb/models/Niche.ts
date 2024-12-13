import mongoose from 'mongoose';
import { Niche } from '../../interfaces';

// Define the Mongoose document type
export interface NicheDocument extends mongoose.Document, Omit<Niche, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// Define the Mongoose model type
export interface NicheModel extends mongoose.Model<NicheDocument> {}

// Define the pillar sub-schema
const pillarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  }
}, {
  _id: false // Disable _id for subdocuments
});

// Define the main schema
const nicheSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pillars: [pillarSchema],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'completed'],
    default: 'new'
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
nicheSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform the document when converting to JSON
nicheSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    return {
      id: ret._id.toString(),
      name: ret.name,
      userId: ret.userId.toString(),
      pillars: ret.pillars,
      progress: ret.progress,
      status: ret.status,
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt
    };
  }
});

// Create and export the model
export const NicheModel = (mongoose.models.Niche || mongoose.model<NicheDocument, NicheModel>('Niche', nicheSchema)) as NicheModel;

export default NicheModel;