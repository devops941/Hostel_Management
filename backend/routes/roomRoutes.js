const express = require('express');
const roomController = require('../controllers/roomController');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', roomController.list);
router.post('/', requireAdmin, roomController.create);
router.put('/:id', requireAdmin, roomController.update);
router.delete('/:id', requireAdmin, roomController.remove);

module.exports = router;