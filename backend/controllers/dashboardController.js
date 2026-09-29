const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../middleware/asyncHandler');

module.exports = asyncHandler(async (req, res) => {
    res.json(await dashboardService.getSummary());
});