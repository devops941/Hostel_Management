const userService = require('../services/userService');
const asyncHandler = require('../middleware/asyncHandler');

const list = asyncHandler(async (req, res) => {
    res.json(await userService.listUsers(req.query.role));
});

const create = asyncHandler(async (req, res) => {
    res.status(201).json(await userService.createUser(req.body));
});

const remove = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(204).end();
});

module.exports = { list, create, remove };