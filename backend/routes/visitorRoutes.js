const express = require('express');
const visitorController = require('../controllers/visitorController');
const { requireAuth, requireStaffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', visitorController.list);
router.post('/', visitorController.create);
router.patch('/:id/status', requireStaffOrAdmin, visitorController.updateStatus);

module.exports = router;
