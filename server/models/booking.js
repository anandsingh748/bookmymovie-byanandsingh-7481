const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  seats: [{
    type: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  bookingId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate booking ID before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BKM' + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

