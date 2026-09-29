const GatePass = require('../models/GatePass');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
    let query = {};
    // Students only see their own passes
    if (req.user.role === 'student') {
        query.student = req.user.id;
    }
    const passes = await GatePass.find(query).populate('student', 'name studentId department').sort({ createdAt: -1 });
    res.json(passes);
});

const create = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new AppError('Only students can request gate passes.', 403);
    }
    const { reason, departureDate, returnDate } = req.body;
    const pass = new GatePass({
        student: req.user.id,
        reason,
        departureDate,
        returnDate
    });
    await pass.save();
    res.status(201).json(pass);
});

const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
        throw new AppError('Invalid status.', 400);
    }
    const pass = await GatePass.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );
    if (!pass) throw new AppError('Gate pass not found.', 404);
    res.json(pass);
});

module.exports = { list, create, updateStatus };
