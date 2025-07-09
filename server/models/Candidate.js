const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'interviewed', 'rejected', 'hired'],
    default: 'active'
  },
  skills: [String],
  experience: {
    type: Number,
    min: 0
  },
  resumeUrl: {
    type: String
  },
  notes: {
    type: String
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

candidateSchema.index({ email: 1 });
candidateSchema.index({ addedBy: 1 });
candidateSchema.index({ status: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);