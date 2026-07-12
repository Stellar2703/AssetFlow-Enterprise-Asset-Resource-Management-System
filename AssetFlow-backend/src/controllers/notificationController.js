const Notification = require('../models/Notification');
const Log = require('../models/Log');

exports.getNotifications = async (req, res) => {
  try {
    const list = await Notification.getByUserId(req.user.id, req.user.role);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markRead(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const list = await Log.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
