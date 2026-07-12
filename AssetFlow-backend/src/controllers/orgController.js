const Department = require('../models/Department');
const Category = require('../models/Category');
const User = require('../models/User');
const Log = require('../models/Log');

exports.getDepartments = async (req, res) => {
  try {
    const list = await Department.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, parentDepartmentId, headId, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const deptId = await Department.create({ name, parentDepartmentId, headId, status });
    
    if (headId) {
      await User.updateRoleAndDept(headId, 'Department Head', deptId, 'Active');
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Create Department',
      details: `Created department ${name}`
    });

    const newDept = await Department.findById(deptId);
    res.status(201).json(newDept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentDepartmentId, headId, status } = req.body;

    const dept = await Department.findById(id);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    await Department.update(id, {
      name: name || dept.name,
      parentDepartmentId: parentDepartmentId !== undefined ? parentDepartmentId : dept.parentDepartmentId,
      headId: headId !== undefined ? headId : dept.headId,
      status: status || dept.status
    });

    if (headId) {
      await User.updateRoleAndDept(headId, 'Department Head', id, 'Active');
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Modify Department',
      details: `Updated department ID ${id}`
    });

    const updated = await Department.findById(id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const list = await Category.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, customFields } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const catId = await Category.create({ name, customFields });
    
    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Create Asset Category',
      details: `Created category ${name}`
    });

    const newCat = await Category.findById(catId);
    res.status(201).json(newCat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customFields } = req.body;

    const cat = await Category.findById(id);
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await Category.update(id, {
      name: name || cat.name,
      customFields: customFields !== undefined ? customFields : cat.customFields
    });

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Modify Asset Category',
      details: `Updated category ID ${id}`
    });

    const updated = await Category.findById(id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
