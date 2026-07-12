const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const authController = require('../controllers/authController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/employees', authenticate, authController.employeesList);
router.post('/employees/promote', authenticate, authorizeRoles('Admin'), authController.promote);

router.get('/org/departments', authenticate, orgController.getDepartments);
router.post('/org/departments', authenticate, authorizeRoles('Admin'), orgController.createDepartment);
router.put('/org/departments/:id', authenticate, authorizeRoles('Admin'), orgController.updateDepartment);

router.get('/org/categories', authenticate, orgController.getCategories);
router.post('/org/categories', authenticate, authorizeRoles('Admin'), orgController.createCategory);
router.put('/org/categories/:id', authenticate, authorizeRoles('Admin'), orgController.updateCategory);

module.exports = router;
