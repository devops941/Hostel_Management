const roomService = require('../services/roomService');
const asyncHandler = require('../middleware/asyncHandler');

const list = asyncHandler(async (req, res) => {
    res.json(await roomService.listRooms());
});

const create = asyncHandler(async (req, res) => {
    res.status(201).json(await roomService.createRoom(req.body));
});

const update = asyncHandler(async (req, res) => {
    res.json(await roomService.updateRoom(req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
    await roomService.deleteRoom(req.params.id);
    res.status(204).end();
});

module.exports = { list, create, update, remove };