const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['staff', 'student'], required: true },
    phone: { type: String, trim: true, default: '' },
    studentId: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    status: { type: String, enum: ['active', 'vacated'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);