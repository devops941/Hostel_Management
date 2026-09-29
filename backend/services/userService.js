const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const FeeRecord = require('../models/FeeRecord');
const GatePass = require('../models/GatePass');
const Complaint = require('../models/Complaint');
const MessOptOut = require('../models/MessOptOut');
const Visitor = require('../models/Visitor');
const AppError = require('../utils/AppError');

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        studentId: user.studentId || '',
        department: user.department || '',
        room: user.room || null,
    };
}

async function listUsers(role) {
    const normalizedRole = String(role || '').toLowerCase();
    if (!['staff', 'student'].includes(normalizedRole)) {
        throw new AppError('Choose staff or student accounts.', 400);
    }
    const accounts = await User.find({ role: normalizedRole, status: { $ne: 'vacated' } })
        .populate('room', 'roomNumber building')
        .sort({ name: 1 })
        .lean();
    return accounts.map(publicUser);
}

async function createUser(data) {
    const { name, email, password, phone, studentId, department, roomId } = data;
    const role = String(data.role || '').toLowerCase();
    if (!name || !email || !password || !['staff', 'student'].includes(role)) {
        throw new AppError('Name, email, password, and a valid account type are required.', 400);
    }
    if (String(password).length < 8) throw new AppError('Passwords must be at least 8 characters.', 400);

    let room = null;
    if (role === 'student' && roomId) {
        if (!mongoose.isValidObjectId(roomId)) throw new AppError('Choose a valid room.', 400);
        room = await Room.findById(roomId);
        if (!room) throw new AppError('Room not found.', 404);
        const occupied = await User.countDocuments({ role: 'student', room: room._id });
        if (occupied >= room.capacity) throw new AppError('That room has no available beds.', 409);
    }

    const account = await User.create({
        name,
        email: String(email).trim().toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
        role,
        phone,
        studentId: role === 'student' ? studentId : '',
        department,
        room: role === 'student' ? room?._id || null : null,
    });

    if (role === 'student' && data.totalFee) {
        const totalFee = Number(data.totalFee);
        const amountPaid = Number(data.initialPayment) || 0;
        if (totalFee > 0) {
            await FeeRecord.create({
                student: account._id,
                title: 'Hostel Admission Fee',
                totalAmount: totalFee,
                amountPaid: Math.min(amountPaid, totalFee),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
        }
    }

    return publicUser(account);
}

async function deleteUser(id) {
    const account = await User.findById(id);
    if (!account) throw new AppError('Account not found.', 404);

    if (account.room) {
        const room = await Room.findById(account.room);
        if (room) {
            room.occupied = Math.max(0, room.occupied - 1);
            if (room.occupied < room.capacity) {
                room.available = true;
            }
            await room.save();
        }
    }

    account.status = 'vacated';
    account.room = null;
    await account.save();

    // Deliberately skipping cascading deletes for FeeRecord, GatePass, Complaint, etc.
    // This ensures historical reports retain this data even after the student account is removed.
}

module.exports = { listUsers, createUser, deleteUser };