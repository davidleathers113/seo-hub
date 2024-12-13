import mongoose from 'mongoose';
import { Article } from '../../interfaces';

// Define the Mongoose document type
export interface ArticleDocument extends mongoose.Document, Omit<Article, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// Define the Mongoose model type
export interface ArticleModel extends mongoose.Model<ArticleDocument> {}

// Define the main schema
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  metaDescription: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  author: {
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
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100
  },
  lastSeoUpdate: {
    type: Date
  }
});

// Update the updatedAt timestamp before saving
articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform the document when converting to JSON
articleSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

// Create and export the model
export const ArticleModel = (mongoose.models.Article || mongoose.model<ArticleDocument, ArticleModel>('Article', articleSchema)) as ArticleModel;

export default ArticleModel;