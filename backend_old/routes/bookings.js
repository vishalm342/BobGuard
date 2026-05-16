const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');

// GET /bookings
router.get('/', bookingsController.getBookings);

// POST /bookings
router.post('/', bookingsController.createBooking);

module.exports = router;
