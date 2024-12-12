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
  subpillar: {
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
    required: false
  },
  notes: {
    type: String,
    required: false
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
  transform: (doc: ResearchDocument, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

// Create and export the model
export const ResearchModel = (mongoose.models.Research || mongoose.model<ResearchDocument, ResearchModel>('Research', researchSchema)) as ResearchModel;

export default ResearchModel;