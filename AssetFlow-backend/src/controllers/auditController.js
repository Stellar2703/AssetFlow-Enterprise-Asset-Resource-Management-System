const Audit = require('../models/Audit');
const Asset = require('../models/Asset');
const Maintenance = require('../models/Maintenance');
const Log = require('../models/Log');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Department = require('../models/Department');

exports.getAudits = async (req, res) => {
  try {
    const list = await Audit.getAll();
    const depts = await Department.getAll();
    const users = await User.getAll();

    const mapped = list.map(aud => {
      let scopeName = 'All';
      if (aud.scopeType === 'Department') {
        const d = depts.find(dept => dept.id === aud.scopeValue);
        scopeName = d ? `Department: ${d.name}` : 'Unknown Department';
      } else if (aud.scopeType === 'Location') {
        scopeName = `Location: ${aud.scopeValue}`;
      }

      const auditors = aud.auditorIds.map(audId => {
        const u = users.find(usr => usr.id === audId);
        return u ? u.name : 'Unknown';
      }).join(', ');

      return {
        ...aud,
        scopeName,
        auditorNames: auditors
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createAudit = async (req, res) => {
  try {
    const { name, scopeType, scopeValue, startDate, endDate, auditorIds } = req.body;
    if (!name || !scopeType || !startDate || !endDate || !auditorIds || auditorIds.length === 0) {
      return res.status(400).json({ error: 'Name, scopeType, dates, and auditors are required' });
    }

    const auditId = await Audit.create({ name, scopeType, scopeValue, startDate, endDate, auditorIds });

    for (const audId of auditorIds) {
      await Notification.create({
        userId: audId,
        title: 'Assigned to Audit Cycle',
        message: `You have been assigned as an auditor for cycle: ${name}.`,
        type: 'audit'
      });
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Create Audit Cycle',
      details: `Created audit cycle ${name}`
    });

    const newAudit = await Audit.getCycleDetails(auditId);
    res.status(201).json(newAudit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logAuditCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const { assetId, status, notes } = req.body;

    if (!assetId || !status) {
      return res.status(400).json({ error: 'Asset ID and status are required' });
    }

    const audit = await Audit.getCycleDetails(id);
    if (!audit) {
      return res.status(404).json({ error: 'Audit cycle not found' });
    }

    if (audit.status !== 'Active') {
      return res.status(400).json({ error: 'This audit cycle is already closed' });
    }

    if (!audit.auditorIds.includes(req.user.id) && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: You are not an assigned auditor for this cycle' });
    }

    await Audit.logItem(id, { assetId, auditorId: req.user.id, status, notes });

    if (status === 'Missing' || status === 'Damaged') {
      const asset = await Asset.findById(assetId);
      const assetTag = asset ? asset.tag : 'Unknown';
      await Notification.create({
        userId: 'Role:Asset Manager',
        title: 'Audit Discrepancy Flagged',
        message: `Asset ${assetTag} was marked as ${status} during audit cycle ${audit.name}`,
        type: 'audit'
      });
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Auditor Check Logged',
      details: `Logged asset ID ${assetId} check as ${status}`
    });

    res.json({ message: 'Auditor check logged successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.closeAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await Audit.getCycleDetails(id);
    if (!audit) {
      return res.status(404).json({ error: 'Audit cycle not found' });
    }

    if (audit.status !== 'Active') {
      return res.status(400).json({ error: 'Audit cycle is already closed' });
    }

    await Audit.closeCycle(id);

    // Update statuses of affected assets
    for (const item of audit.auditItems) {
      const asset = await Asset.findById(item.assetId);
      if (asset) {
        if (item.status === 'Missing') {
          await Asset.updateStatus(asset.id, 'Lost', null, null);
        } else if (item.status === 'Damaged') {
          await Asset.updateStatus(asset.id, 'Under Maintenance', null, null);
          // Auto-generate maintenance ticket
          await Maintenance.create({
            assetId: asset.id,
            raisedById: req.user.id,
            description: `Flagged as Damaged during audit cycle: ${audit.name}. Notes: ${item.notes}`,
            priority: 'Medium'
          });
        }
      }
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Close Audit Cycle',
      details: `Closed audit cycle ${audit.name}. Executed status updates for missing/damaged items.`
    });

    const updated = await Audit.getCycleDetails(id);
    res.json({ message: 'Audit cycle closed successfully. Asset statuses updated.', audit: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
