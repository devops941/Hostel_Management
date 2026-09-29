const express = require('express');
const userController = require('../controllers/userController');
const { requireAdmin, requireAuth, requireStaffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireStaffOrAdmin);
router.get('/', userController.list);
router.post('/', userController.create);
router.delete('/:id', userController.remove);

module.exports = router;