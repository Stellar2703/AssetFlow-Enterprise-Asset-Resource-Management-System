const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/transfers', authenticate, transferController.getTransfers);
router.post('/transfers', authenticate, transferController.requestTransfer);
router.post('/transfers/:id/resolve', authenticate, transferController.resolveTransfer);

module.exports = router;
