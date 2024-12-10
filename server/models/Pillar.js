const mongoose = require('mongoose');

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
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

pillarSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Pillar = mongoose.model('Pillar', pillarSchema);

module.exports = Pillar;
