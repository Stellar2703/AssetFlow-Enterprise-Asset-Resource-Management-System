const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/audits', authenticate, auditController.getAudits);
router.post('/audits', authenticate, authorizeRoles('Admin'), auditController.createAudit);
router.post('/audits/:id/check', authenticate, auditController.logAuditCheck);
router.post('/audits/:id/close', authenticate, authorizeRoles('Admin'), auditController.closeAudit);

module.exports = router;
