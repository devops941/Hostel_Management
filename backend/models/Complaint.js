const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Cleaning', 'Internet', 'Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
