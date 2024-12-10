const mongoose = require('mongoose');

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
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

subpillarSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Subpillar = mongoose.model('Subpillar', subpillarSchema);

module.exports = Subpillar;
