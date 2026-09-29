const Visitor = require('../models/Visitor');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'student') {
        query.student = req.user.id;
    }
    const visitors = await Visitor.find(query).populate('student', 'name').sort({ createdAt: -1 });
    res.json(visitors);
});

const create = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new AppError('Only students can request visitor passes.', 403);
    }
    const { visitorName, relation, visitDate } = req.body;
    const visitor = new Visitor({
        student: req.user.id,
        visitorName,
        relation,
        visitDate
    });
    await visitor.save();
    res.status(201).json(visitor);
});

const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
        throw new AppError('Invalid status.', 400);
    }
    const visitor = await Visitor.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );
    if (!visitor) throw new AppError('Visitor request not found.', 404);
    res.json(visitor);
});

module.exports = { list, create, updateStatus };
