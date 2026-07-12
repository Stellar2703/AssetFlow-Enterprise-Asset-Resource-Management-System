const Asset = require('../models/Asset');
const Category = require('../models/Category');
const User = require('../models/User');
const Department = require('../models/Department');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const Log = require('../models/Log');
const Notification = require('../models/Notification');
const { query } = require('../config/db');

exports.getAssets = async (req, res) => {
  try {
    const list = await Asset.getAll(req.query);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.registerAsset = async (req, res) => {
  try {
    const { name, categoryId, serialNumber, acquisitionDate, acquisitionCost, condition, location, sharedBookable, customFieldValues } = req.body;
    if (!name || !categoryId || !serialNumber) {
      return res.status(400).json({ error: 'Name, category, and serial number are required' });
    }

    const existing = await Asset.findBySerial(serialNumber);
    if (existing) {
      return res.status(400).json({ error: 'Asset with this Serial Number already exists' });
    }

    const assetId = await Asset.create({
      name, categoryId, serialNumber, acquisitionDate, acquisitionCost, condition, location, sharedBookable, customFieldValues
    });

    const newAsset = await Asset.findById(assetId);
    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Register Asset',
      details: `Registered asset ${newAsset.tag} - ${name}`
    });

    res.status(201).json(newAsset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAssetHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const cat = await Category.findById(asset.categoryId);
    asset.categoryName = cat ? cat.name : 'Unknown';

    // Get allocations
    const allAllocations = await query('SELECT * FROM allocations WHERE assetId = ?', [id]);
    const users = await User.getAll();
    const depts = await Department.getAll();

    const allocHist = allAllocations.map(al => {
      let holder = 'Unknown';
      if (al.allocatedToType === 'Employee') {
        const u = users.find(usr => usr.id === al.allocatedToId);
        holder = u ? u.name : 'Unknown Employee';
      } else {
        const d = depts.find(dept => dept.id === al.allocatedToId);
        holder = d ? `${d.name} (Dept)` : 'Unknown Dept';
      }
      return {
        type: 'Allocation',
        holder,
        date: al.allocationDate,
        returnDate: al.actualReturnDate,
        expectedReturn: al.expectedReturnDate,
        notes: al.returnNotes,
        condition: al.returnCondition,
        status: al.status
      };
    });

    // Get maintenance
    const allMaintenance = await query('SELECT * FROM maintenance_requests WHERE assetId = ?', [id]);
    const maintHist = allMaintenance.map(m => ({
      type: 'Maintenance',
      description: m.description,
      priority: m.priority,
      status: m.status,
      technician: m.technicianName,
      date: m.createdAt,
      resolvedNotes: m.resolvedNotes
    }));

    const history = [...allocHist, ...maintHist].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ asset, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.allocateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { allocatedToType, allocatedToId, expectedReturnDate } = req.body;

    if (!allocatedToType || !allocatedToId) {
      return res.status(400).json({ error: 'allocatedToType and allocatedToId are required' });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Double allocation block check
    if (asset.lifecycleStatus !== 'Available') {
      let currentHolder = 'Unknown';
      if (asset.assignedToEmployeeId) {
        const u = await User.findById(asset.assignedToEmployeeId);
        currentHolder = u ? u.name : 'Employee';
      } else if (asset.assignedToDepartmentId) {
        const d = await Department.findById(asset.assignedToDepartmentId);
        currentHolder = d ? `${d.name} (Dept)` : 'Department';
      }
      return res.status(409).json({
        error: `Asset is double-allocated or unavailable. Currently held by ${currentHolder}.`,
        heldBy: currentHolder,
        canTransfer: true
      });
    }

    // Execute allocation
    const empId = allocatedToType === 'Employee' ? allocatedToId : null;
    const deptId = allocatedToType === 'Department' ? allocatedToId : null;

    await Asset.updateStatus(id, 'Allocated', empId, deptId);
    await Allocation.create({
      assetId: id,
      allocatedToType,
      allocatedToId,
      allocatedById: req.user.id,
      expectedReturnDate
    });

    if (allocatedToType === 'Employee') {
      await Notification.create({
        userId: allocatedToId,
        title: 'Asset Allocated',
        message: `Asset ${asset.tag} - ${asset.name} has been allocated to you.`,
        type: 'allocation'
      });
    } else {
      const dept = await Department.findById(allocatedToId);
      if (dept && dept.headId) {
        await Notification.create({
          userId: dept.headId,
          title: 'Asset Allocated to Department',
          message: `Asset ${asset.tag} - ${asset.name} has been allocated to your department (${dept.name}).`,
          type: 'allocation'
        });
      }
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Allocate Asset',
      details: `Allocated asset ${asset.tag} to ${allocatedToType} ID ${allocatedToId}`
    });

    const updatedAsset = await Asset.findById(id);
    res.json({ message: 'Asset allocated successfully', asset: updatedAsset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.returnAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, notes } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const activeAlloc = await Allocation.findActiveByAssetId(id);
    if (activeAlloc) {
      await Allocation.close(activeAlloc.id, { returnCondition: condition, returnNotes: notes });
    }

    const prevHolderId = asset.assignedToEmployeeId;

    await Asset.updateStatus(id, 'Available', null, null);
    if (condition) {
      await Asset.updateCondition(id, condition);
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Return Asset',
      details: `Asset ${asset.tag} returned in ${condition} condition.`
    });

    if (prevHolderId) {
      await Notification.create({
        userId: prevHolderId,
        title: 'Return Confirmed',
        message: `Your return of ${asset.tag} - ${asset.name} has been approved by the manager.`,
        type: 'return'
      });
    }

    const updatedAsset = await Asset.findById(id);
    res.json({ message: 'Asset return registered successfully', asset: updatedAsset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllAllocations = async (req, res) => {
  try {
    const list = await Allocation.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

