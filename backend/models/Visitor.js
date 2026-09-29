const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  visitorName: {
    type: String,
    required: true,
    trim: true,
  },
  relation: {
    type: String,
    required: true,
    trim: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
