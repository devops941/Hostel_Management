const express = require('express');
const gatePassController = require('../controllers/gatePassController');
const { requireAuth, requireStaffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', gatePassController.list);
router.post('/', gatePassController.create);
router.patch('/:id/status', requireStaffOrAdmin, gatePassController.updateStatus);

module.exports = router;
