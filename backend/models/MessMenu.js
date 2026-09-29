const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
    unique: true
  },
  breakfast: { type: String, default: 'Not set' },
  lunch: { type: String, default: 'Not set' },
  dinner: { type: String, default: 'Not set' }
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', messMenuSchema);
