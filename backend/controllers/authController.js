const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');

const login = asyncHandler(async (req, res) => {
    res.json(await authService.login(req.body));
});

function me(req, res) {
    const { id, name, email, role } = req.user;
    res.json({ user: { id, name, email, role } });
}

module.exports = { login, me };