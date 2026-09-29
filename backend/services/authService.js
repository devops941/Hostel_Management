const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = require('../config/env');

function createSession(user) {
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    return { token: jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }), user: payload };
}

async function login({ email: inputEmail, password = '', role: inputRole }) {
    const email = String(inputEmail || '').trim().toLowerCase();
    const role = String(inputRole || '').toLowerCase();

    if (role === 'admin') {
        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            throw new AppError('Email or password is incorrect.', 401);
        }
        return createSession({ id: 'admin', name: 'Hostel Administrator', email: ADMIN_EMAIL, role: 'admin' });
    }

    if (!['staff', 'student'].includes(role)) throw new AppError('Choose a valid account type.', 400);

    const account = await User.findOne({ email, role, status: { $ne: 'vacated' } });
    if (!account || !(await bcrypt.compare(String(password), account.passwordHash))) {
        throw new AppError('Email or password is incorrect.', 401);
    }
    return createSession({ id: account.id, name: account.name, email: account.email, role: account.role });
}

module.exports = { login };