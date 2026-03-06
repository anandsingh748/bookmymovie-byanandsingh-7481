const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theater: {
    type: String,
    required: true
  },
  showTime: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalSeats: {
    type: Number,
    default: 48
  },
  availableSeats: {
    type: Number,
    default: 48
  },
  bookedSeats: [{
    seatNumber: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  price: {
    type: Number,
    default: 1080
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Show', showSchema);

