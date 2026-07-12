const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/assets', authenticate, assetController.getAssets);
router.post('/assets', authenticate, authorizeRoles('Asset Manager', 'Admin'), assetController.registerAsset);
router.get('/assets/:id/history', authenticate, assetController.getAssetHistory);
router.post('/assets/:id/allocate', authenticate, authorizeRoles('Asset Manager', 'Admin'), assetController.allocateAsset);
router.post('/assets/:id/return', authenticate, authorizeRoles('Asset Manager', 'Admin'), assetController.returnAsset);
router.get('/allocations', authenticate, assetController.getAllAllocations);

module.exports = router;
