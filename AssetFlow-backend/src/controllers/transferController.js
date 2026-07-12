const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Department = require('../models/Department');
const Log = require('../models/Log');
const Notification = require('../models/Notification');

exports.getTransfers = async (req, res) => {
  try {
    const list = await Transfer.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.requestTransfer = async (req, res) => {
  try {
    const { assetId, toEmployeeId, toDepartmentId } = req.body;
    if (!assetId) {
      return res.status(400).json({ error: 'Asset ID is required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (asset.lifecycleStatus !== 'Allocated') {
      return res.status(400).json({ error: 'Asset is not currently allocated.' });
    }

    const transferId = await Transfer.create({
      assetId,
      fromEmployeeId: asset.assignedToEmployeeId,
      fromDepartmentId: asset.assignedToDepartmentId,
      toEmployeeId,
      toDepartmentId,
      requestedById: req.user.id
    });

    await Notification.create({
      userId: 'Role:Asset Manager',
      title: 'New Transfer Request',
      message: `${req.user.name} requested transfer of asset ${asset.tag} - ${asset.name}`,
      type: 'transfer'
    });

    if (asset.assignedToDepartmentId) {
      const dept = await Department.findById(asset.assignedToDepartmentId);
      if (dept && dept.headId) {
        await Notification.create({
          userId: dept.headId,
          title: 'Department Transfer Requested',
          message: `Transfer requested for department asset ${asset.tag} - ${asset.name}`,
          type: 'transfer'
        });
      }
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Request Transfer',
      details: `Requested transfer for asset ${asset.tag}`
    });

    const newTransfer = await Transfer.findById(transferId);
    res.status(201).json(newTransfer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resolveTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'Approve' or 'Reject'

    if (!['Approve', 'Reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be Approve or Reject' });
    }

    const transfer = await Transfer.findById(id);
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer request not found' });
    }

    if (transfer.status !== 'Pending') {
      return res.status(400).json({ error: 'Transfer request is already resolved' });
    }

    const asset = await Asset.findById(transfer.assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Auth check: Admin, Asset Manager, or Department Head of source dept
    let authorized = false;
    if (req.user.role === 'Asset Manager' || req.user.role === 'Admin') {
      authorized = true;
    } else if (req.user.role === 'Department Head' && transfer.fromDepartmentId) {
      const dept = await Department.findById(transfer.fromDepartmentId);
      if (dept && dept.headId === req.user.id) {
        authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({ error: 'Forbidden: You cannot resolve this transfer request' });
    }

    const finalStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    await Transfer.resolve(id, finalStatus, req.user.id);

    if (action === 'Approve') {
      // Close active allocation
      const activeAlloc = await Allocation.findActiveByAssetId(asset.id);
      if (activeAlloc) {
        await Allocation.close(activeAlloc.id, { returnCondition: asset.condition, returnNotes: 'Returned via transfer' });
      }

      // Re-allocate
      await Asset.updateStatus(asset.id, 'Allocated', transfer.toEmployeeId, transfer.toDepartmentId);
      await Allocation.create({
        assetId: asset.id,
        allocatedToType: transfer.toEmployeeId ? 'Employee' : 'Department',
        allocatedToId: transfer.toEmployeeId || transfer.toDepartmentId,
        allocatedById: req.user.id
      });

      if (transfer.toEmployeeId) {
        await Notification.create({
          userId: transfer.toEmployeeId,
          title: 'Asset Transfer Approved',
          message: `Asset ${asset.tag} - ${asset.name} has been transferred to you.`,
          type: 'transfer'
        });
      }

      if (transfer.requestedById !== transfer.toEmployeeId) {
        await Notification.create({
          userId: transfer.requestedById,
          title: 'Transfer Request Approved',
          message: `Your transfer request for ${asset.tag} has been approved.`,
          type: 'transfer'
        });
      }
    } else {
      await Notification.create({
        userId: transfer.requestedById,
        title: 'Transfer Request Rejected',
        message: `Your transfer request for ${asset.tag} was rejected.`,
        type: 'transfer'
      });
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Resolve Transfer Request',
      details: `${action}d transfer request ID ${id}`
    });

    res.json({ message: `Transfer request ${action.toLowerCase()}d successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
