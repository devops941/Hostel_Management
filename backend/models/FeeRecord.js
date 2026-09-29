const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

feeRecordSchema.virtual('status').get(function() {
  if (this.amountPaid === 0) return 'Pending';
  if (this.amountPaid < this.totalAmount) return 'Partial';
  return 'Paid';
});

// Ensure virtuals are included when converting to JSON
feeRecordSchema.set('toJSON', { virtuals: true });
feeRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);
