const express = require('express');
const messController = require('../controllers/messController');
const { requireAuth, requireStaffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/menu', messController.getMenu);
router.post('/menu', requireStaffOrAdmin, messController.updateMenu);
router.get('/optout', messController.getOptOuts);
router.post('/optout', messController.toggleOptOut);

module.exports = router;
