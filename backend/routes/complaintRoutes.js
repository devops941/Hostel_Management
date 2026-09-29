const express = require('express');
const complaintController = require('../controllers/complaintController');
const { requireAuth, requireStaffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', complaintController.list);
router.post('/', complaintController.create);
router.patch('/:id/status', requireStaffOrAdmin, complaintController.updateStatus);

module.exports = router;
