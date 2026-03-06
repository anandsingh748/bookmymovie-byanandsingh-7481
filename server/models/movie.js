const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  overview: String,
  posterPath: String,
  backdropPath: String,
  releaseDate: String,
  voteAverage: Number,
  voteCount: Number,
  genre: [String],
  language: String,
  popularity: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movie', movieSchema);

