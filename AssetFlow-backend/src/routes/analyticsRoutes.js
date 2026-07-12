const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/analytics', authenticate, analyticsController.getAnalytics);

module.exports = router;
