const mongoose = require('mongoose');

const messOptOutSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  }
}, { timestamps: true });

// A student can only opt out once per day
messOptOutSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MessOptOut', messOptOutSchema);
