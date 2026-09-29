const Complaint = require('../models/Complaint');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'student') {
        query.student = req.user.id;
    }
    const complaints = await Complaint.find(query).populate('student', 'name room').sort({ createdAt: -1 });
    res.json(complaints);
});

const create = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new AppError('Only students can submit complaints.', 403);
    }
    const { category, description } = req.body;
    const complaint = new Complaint({
        student: req.user.id,
        category,
        description
    });
    await complaint.save();
    res.status(201).json(complaint);
});

const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
        throw new AppError('Invalid status.', 400);
    }
    const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );
    if (!complaint) throw new AppError('Complaint not found.', 404);
    res.json(complaint);
});

module.exports = { list, create, updateStatus };
