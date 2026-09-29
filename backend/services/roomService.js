const Room = require('../models/Room');
const User = require('../models/User');
const AppError = require('../utils/AppError');

async function listRooms() {
    const [rooms, occupancy] = await Promise.all([
        Room.find().sort({ roomNumber: 1 }).lean(),
        User.aggregate([
            { $match: { role: 'student', room: { $ne: null } } },
            { $group: { _id: '$room', count: { $sum: 1 } } },
        ]),
    ]);
    const occupiedByRoom = new Map(occupancy.map((item) => [item._id.toString(), item.count]));
    return rooms.map((room) => {
        const occupied = occupiedByRoom.get(room._id.toString()) || 0;
        return { ...room, occupied, available: Math.max(0, room.capacity - occupied) };
    });
}

async function createRoom(data) {
    return Room.create({
        roomNumber: data.roomNumber,
        building: data.building,
        floor: Number(data.floor),
        capacity: Number(data.capacity),
    });
}

async function updateRoom(id, data) {
    const room = await Room.findById(id);
    if (!room) throw new AppError('Room not found.', 404);

    const capacity = Number(data.capacity);
    const occupied = await User.countDocuments({ role: 'student', room: room._id });
    if (capacity < occupied) throw new AppError('Capacity cannot be lower than current occupancy.', 409);

    room.roomNumber = data.roomNumber;
    room.building = data.building;
    room.floor = Number(data.floor);
    room.capacity = capacity;
    await room.save();
    return room;
}

async function deleteRoom(id) {
    const room = await Room.findById(id);
    if (!room) throw new AppError('Room not found.', 404);
    const occupied = await User.countDocuments({ role: 'student', room: room._id });
    if (occupied) throw new AppError('Move assigned students before deleting this room.', 409);
    await room.deleteOne();
}

module.exports = { listRooms, createRoom, updateRoom, deleteRoom };