import mongoose from 'mongoose';
import { Outline } from '../../interfaces';

// Define the Mongoose document type
export interface OutlineDocument extends mongoose.Document, Omit<Outline, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// Define the Mongoose model type
export interface OutlineModel extends mongoose.Model<OutlineDocument> {}

// Define the content point sub-schema
const contentPointSchema = new mongoose.Schema({
  point: {
    type: String,
    required: true
  },
  generated: {
    type: Boolean,
    default: false
  }
}, {
  _id: false // Disable _id for subdocuments
});

// Define the section sub-schema
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  contentPoints: [contentPointSchema],
  order: {
    type: Number,
    required: true
  }
}, {
  _id: false // Disable _id for subdocuments
});

// Define the main schema
const outlineSchema = new mongoose.Schema({
  subpillar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subpillar',
    required: true
  },
  sections: [sectionSchema],
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed'],
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
outlineSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform the document when converting to JSON
outlineSchema.set('toJSON', {
  transform: (doc: OutlineDocument, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

// Create and export the model
export const OutlineModel = (mongoose.models.Outline || mongoose.model<OutlineDocument, OutlineModel>('Outline', outlineSchema)) as OutlineModel;

export default OutlineModel;