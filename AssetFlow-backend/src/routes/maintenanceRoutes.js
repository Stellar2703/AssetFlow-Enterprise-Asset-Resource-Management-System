const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/maintenance', authenticate, maintenanceController.getMaintenanceRequests);
router.post('/maintenance', authenticate, maintenanceController.createRequest);
router.post('/maintenance/:id/approve', authenticate, authorizeRoles('Asset Manager', 'Admin'), maintenanceController.approveRequest);
router.post('/maintenance/:id/assign', authenticate, authorizeRoles('Asset Manager', 'Admin'), maintenanceController.assignTechnician);
router.post('/maintenance/:id/resolve', authenticate, maintenanceController.resolveRequest);

module.exports = router;
