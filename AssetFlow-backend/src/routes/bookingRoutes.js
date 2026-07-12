const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/bookings', authenticate, bookingController.getBookings);
router.post('/bookings', authenticate, bookingController.createBooking);
router.post('/bookings/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
