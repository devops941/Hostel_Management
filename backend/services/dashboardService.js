const Room = require('../models/Room');
const User = require('../models/User');

async function getSummary() {
    const [students, staff, rooms, occupiedBeds] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'staff' }),
        Room.countDocuments(),
        User.countDocuments({ role: 'student', room: { $ne: null } }),
    ]);
    return { students, staff, rooms, occupiedBeds };
}

module.exports = { getSummary };