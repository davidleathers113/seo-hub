const mongoose = require('mongoose');

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
});

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
    default: Date.now
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

const Niche = mongoose.model('Niche', nicheSchema);

module.exports = Niche;