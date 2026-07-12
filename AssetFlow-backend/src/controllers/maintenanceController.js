const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const Log = require('../models/Log');
const Notification = require('../models/Notification');

exports.getMaintenanceRequests = async (req, res) => {
  try {
    const list = await Maintenance.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { assetId, description, priority } = req.body;
    if (!assetId || !description || !priority) {
      return res.status(400).json({ error: 'Asset ID, description, and priority are required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const mId = await Maintenance.create({ assetId, raisedById: req.user.id, description, priority });

    await Notification.create({
      userId: 'Role:Asset Manager',
      title: 'New Maintenance Request',
      message: `${req.user.name} raised a maintenance request for ${asset.tag} - ${asset.name}`,
      type: 'maintenance'
    });

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Raise Maintenance Request',
      details: `Filed maintenance request for ${asset.tag}`
    });

    const newM = await Maintenance.findById(mId);
    res.status(201).json(newM);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Maintenance.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Request is already approved or resolved' });
    }

    await Maintenance.updateStatus(id, 'Approved');
    await Asset.updateStatus(request.assetId, 'Under Maintenance', null, null);

    await Notification.create({
      userId: request.raisedById,
      title: 'Maintenance Approved',
      message: `Your maintenance request for asset ID ${request.assetId} has been approved.`,
      type: 'maintenance'
    });

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Approve Maintenance',
      details: `Approved maintenance ID ${id}. Asset status set to Under Maintenance.`
    });

    const updated = await Maintenance.findById(id);
    res.json({ message: 'Maintenance request approved', request: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianName } = req.body;
    if (!technicianName) {
      return res.status(400).json({ error: 'Technician name is required' });
    }

    const request = await Maintenance.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await Maintenance.assignTechnician(id, technicianName);

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Assign Technician',
      details: `Assigned technician ${technicianName} to maintenance ID ${id}`
    });

    const updated = await Maintenance.findById(id);
    res.json({ message: 'Technician assigned successfully', request: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resolveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const request = await Maintenance.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await Maintenance.resolve(id, notes || 'Fixed');
    await Asset.updateStatus(request.assetId, 'Available', null, null);

    await Notification.create({
      userId: request.raisedById,
      title: 'Maintenance Resolved',
      message: `Maintenance for your asset has been resolved: ${notes || 'Fixed'}`,
      type: 'maintenance'
    });

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Resolve Maintenance',
      details: `Maintenance request ID ${id} resolved. Asset status set to Available.`
    });

    const updated = await Maintenance.findById(id);
    res.json({ message: 'Maintenance resolved successfully', request: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
