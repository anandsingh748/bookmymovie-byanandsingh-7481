const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config/db');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ name, email, password, phone });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favorites: user.favorites
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user (email or phone)
router.post('/login', async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        favorites: user.favorites
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to favorites
router.post('/favorites/:movieId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favorites.includes(req.params.movieId)) {
      user.favorites.push(req.params.movieId);
      await user.save();
    }
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/favorites/:movieId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.movieId);
    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

