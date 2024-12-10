const mongoose = require('mongoose');

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
    default: Date.now
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

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
