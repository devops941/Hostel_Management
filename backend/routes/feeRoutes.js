const express = require('express');
const feeController = require('../controllers/feeController');
const { requireAuth, requireStaffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', feeController.list);
router.post('/', requireStaffOrAdmin, feeController.create);
router.patch('/:id/pay', requireStaffOrAdmin, feeController.recordPayment);
router.put('/:id', requireStaffOrAdmin, feeController.update);

module.exports = router;
