const prisma = require('../prismaClient');

const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const createBooking = async (req, res) => {
  try {
    const { name, email, date, time, guests } = req.body;
    
    // Basic validation
    if (!name || !email || !date || !time || !guests) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // Date validation
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided' });
    }

    const newBooking = await prisma.booking.create({
      data: {
        name,
        email,
        date: bookingDate,
        time,
        guests: parseInt(guests, 10),
        status: 'pending'
      }
    });
    
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking. Please try again later.' });
  }
};

module.exports = {
  getBookings,
  createBooking
};

