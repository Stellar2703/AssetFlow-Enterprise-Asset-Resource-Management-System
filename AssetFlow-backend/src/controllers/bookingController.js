const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const Log = require('../models/Log');
const User = require('../models/User');

exports.getBookings = async (req, res) => {
  try {
    const list = await Booking.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { resourceId, startTime, endTime, bookedForDepartmentId } = req.body;
    if (!resourceId || !startTime || !endTime) {
      return res.status(400).json({ error: 'resourceId, startTime, and endTime are required' });
    }

    const startVal = new Date(startTime).getTime();
    const endVal = new Date(endTime).getTime();

    if (startVal >= endVal) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    const asset = await Asset.findById(resourceId);
    if (!asset) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!asset.sharedBookable) {
      return res.status(400).json({ error: 'This asset is not marked as shared or bookable' });
    }

    if (asset.lifecycleStatus === 'Under Maintenance' || asset.lifecycleStatus === 'Retired' || asset.lifecycleStatus === 'Disposed') {
      return res.status(400).json({ error: `Resource is currently ${asset.lifecycleStatus} and cannot be booked.` });
    }

    const conflict = await Booking.checkOverlap(resourceId, startTime, endTime);
    if (conflict) {
      return res.status(409).json({
        error: `Booking conflict: Already booked by ${conflict.bookedByName} from ${new Date(conflict.startTime).toLocaleTimeString()} to ${new Date(conflict.endTime).toLocaleTimeString()}`
      });
    }

    const bookingId = await Booking.create({
      resourceId,
      bookedById: req.user.id,
      bookedForDepartmentId,
      startTime,
      endTime
    });

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Book Resource',
      details: `Booked ${asset.name} from ${startTime} to ${endTime}`
    });

    const newBooking = await Booking.findById(bookingId);
    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.user.role !== 'Admin' && req.user.role !== 'Asset Manager' && booking.bookedById !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot cancel this booking' });
    }

    await Booking.cancel(id);
    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Cancel Booking',
      details: `Cancelled booking ID ${id}`
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
