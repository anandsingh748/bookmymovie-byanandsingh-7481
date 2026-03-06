const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { showId, seats } = req.body;

    // Find the show
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Check if seats are available
    for (const seat of seats) {
      const isBooked = show.bookedSeats.some(s => s.seatNumber === seat);
      if (isBooked) {
        return res.status(400).json({ message: `Seat ${seat} is already booked` });
      }
    }

    // Calculate total amount
    const totalAmount = seats.length * show.price;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      show: showId,
      movie: show.movie,
      seats,
      totalAmount,
      paymentStatus: 'paid' // In production, verify payment first
    });

    await booking.save();

    // Update show with booked seats
    for (const seat of seats) {
      show.bookedSeats.push({
        seatNumber: seat,
        user: req.user._id
      });
    }
    show.availableSeats -= seats.length;
    await show.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('show')
      .populate('movie', 'title posterPath')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('show')
      .populate('movie', 'title posterPath releaseDate');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    await booking.save();

    // Release seats
    const show = await Show.findById(booking.show);
    show.bookedSeats = show.bookedSeats.filter(
      s => s.user.toString() !== req.user._id.toString()
    );
    show.availableSeats += booking.seats.length;
    await show.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

