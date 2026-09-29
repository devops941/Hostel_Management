const MessMenu = require('../models/MessMenu');
const MessOptOut = require('../models/MessOptOut');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getMenu = asyncHandler(async (req, res) => {
    const menu = await MessMenu.find();
    res.json(menu);
});

const updateMenu = asyncHandler(async (req, res) => {
    const { day, breakfast, lunch, dinner } = req.body;
    const menu = await MessMenu.findOneAndUpdate(
        { day },
        { breakfast, lunch, dinner },
        { new: true, upsert: true }
    );
    res.json(menu);
});

const getOptOuts = asyncHandler(async (req, res) => {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.json([]);
    
    if (req.user.role === 'student') {
        const optOut = await MessOptOut.findOne({ student: req.user.id, date });
        return res.json(optOut ? [optOut] : []);
    } else {
        const optOuts = await MessOptOut.find({ date }).populate('student', 'name status');
        const activeOptOuts = optOuts.filter(o => o.student && o.student.status !== 'vacated');
        const totalStudents = await User.countDocuments({ role: 'student', status: { $ne: 'vacated' } });
        res.json({
            optOuts: activeOptOuts,
            totalStudents,
            attendingCount: totalStudents - activeOptOuts.length
        });
    }
});

const toggleOptOut = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') throw new AppError('Only students can opt out.', 403);
    const { date } = req.body; // YYYY-MM-DD
    
    const existing = await MessOptOut.findOne({ student: req.user.id, date });
    if (existing) {
        await MessOptOut.deleteOne({ _id: existing._id });
        res.json({ status: 'opted_in' });
    } else {
        await MessOptOut.create({ student: req.user.id, date });
        res.json({ status: 'opted_out' });
    }
});

module.exports = { getMenu, updateMenu, getOptOuts, toggleOptOut };
