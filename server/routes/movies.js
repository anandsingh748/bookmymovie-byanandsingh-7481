const express = require('express');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all movies (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { language, sort, page = 1, limit = 40 } = req.query;
    
    let query = {};
    if (language) {
      query.language = language;
    }

    let sortOption = {};
    if (sort === 'popularity') {
      sortOption = { popularity: -1 };
    } else if (sort === 'rating') {
      sortOption = { voteAverage: -1 };
    } else if (sort === 'release') {
      sortOption = { releaseDate: -1 };
    }

    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ tmdbId: req.params.id });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search movies
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const movies = await Movie.find({
      title: { $regex: q, $options: 'i' }
    }).limit(20);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shows for a movie
router.get('/:id/shows', async (req, res) => {
  try {
    const movie = await Movie.findOne({ tmdbId: req.params.id });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const shows = await Show.find({ movie: movie._id })
      .populate('movie', 'title posterPath')
      .sort({ date: 1 });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create show (admin only - in production, add admin check)
router.post('/shows', auth, async (req, res) => {
  try {
    const { movieId, theater, showTime, date, price } = req.body;
    
    const movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const show = new Show({
      movie: movie._id,
      theater,
      showTime,
      date,
      price
    });

    await show.save();
    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Sync movies from TMDB (for admin)
router.post('/sync', auth, async (req, res) => {
  try {
    const { movies } = req.body;
    
    for (const m of movies) {
      await Movie.findOneAndUpdate(
        { tmdbId: m.id },
        {
          tmdbId: m.id,
          title: m.title,
          overview: m.overview,
          posterPath: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          backdropPath: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          releaseDate: m.release_date,
          voteAverage: m.vote_average,
          voteCount: m.vote_count,
          language: m.original_language,
          popularity: m.popularity
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Movies synced successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

