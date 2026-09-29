const FeeRecord = require('../models/FeeRecord');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'student') {
        query.student = req.user.id;
    }
    const fees = await FeeRecord.find(query).populate('student', 'name studentId').sort({ createdAt: -1 });
    res.json(fees);
});

const create = asyncHandler(async (req, res) => {
    const { studentId, title, totalAmount, dueDate } = req.body;
    const fee = new FeeRecord({
        student: studentId,
        title,
        totalAmount,
        dueDate
    });
    await fee.save();
    res.status(201).json(fee);
});

const recordPayment = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new AppError('Invalid payment amount.', 400);

    const fee = await FeeRecord.findById(req.params.id);
    if (!fee) throw new AppError('Fee record not found.', 404);

    fee.amountPaid += Number(amount);
    if (fee.amountPaid > fee.totalAmount) {
        fee.amountPaid = fee.totalAmount; // Cap at total amount
    }
    
    await fee.save();
    res.json(fee);
});

const update = asyncHandler(async (req, res) => {
    const { totalAmount, amountPaid } = req.body;
    const fee = await FeeRecord.findById(req.params.id);
    if (!fee) throw new AppError('Fee record not found.', 404);

    if (totalAmount !== undefined) fee.totalAmount = Number(totalAmount);
    if (amountPaid !== undefined) fee.amountPaid = Number(amountPaid);
    
    await fee.save();
    res.json(fee);
});

module.exports = { list, create, recordPayment, update };
