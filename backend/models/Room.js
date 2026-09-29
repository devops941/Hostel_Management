const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true, trim: true },
    building: { type: String, required: true, trim: true },
    floor: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
}, { timestamps: true });

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);