const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return next(new AppError('Please sign in to continue.', 401));

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        return next();
    } catch {
        return next(new AppError('Your session has expired. Please sign in again.', 401));
    }
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') return next(new AppError('Admin access is required.', 403));
    return next();
}

function requireStaffOrAdmin(req, res, next) {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') return next(new AppError('Staff or Admin access is required.', 403));
    return next();
}

module.exports = { requireAuth, requireAdmin, requireStaffOrAdmin };