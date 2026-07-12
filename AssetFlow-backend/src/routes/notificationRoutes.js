const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/notifications', authenticate, notificationController.getNotifications);
router.post('/notifications/:id/read', authenticate, notificationController.markRead);
router.get('/logs', authenticate, authorizeRoles('Admin', 'Asset Manager'), notificationController.getLogs);

module.exports = router;
