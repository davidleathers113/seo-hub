const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
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
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ResearchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Research', ResearchSchema);
