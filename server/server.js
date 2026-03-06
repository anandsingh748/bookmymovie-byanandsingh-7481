require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'BookMyMovie API is running!' });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb+srv://anandsingh7481_db_user:0Vc00qsvu7R3UH0S@cluster0.5c9ziri.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = app;

