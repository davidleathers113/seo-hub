const mongoose = require('mongoose');

const outlineSchema = new mongoose.Schema({
  subpillar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subpillar',
    required: true
  },
  sections: [{
    title: String,
    contentPoints: [{
      point: String,
      generated: {
        type: Boolean,
        default: false
      }
    }],
    order: Number
  }],
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
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

outlineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Outline = mongoose.model('Outline', outlineSchema);

module.exports = Outline;
