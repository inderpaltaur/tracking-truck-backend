import Trailer from '../models/Trailer.js';

// @desc    Get all trailers
// @route   GET /api/trailers
// @access  Private
const getTrailers = async (req, res) => {
  try {
    const trailers = await Trailer.find().sort({ createdAt: -1 });
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single trailer
// @route   GET /api/trailers/:id
// @access  Private
const getTrailerById = async (req, res) => {
  try {
    const trailer = await Trailer.findById(req.params.id);
    
    if (!trailer) {
      return res.status(404).json({ message: 'Trailer not found' });
    }
    
    res.json(trailer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create trailer
// @route   POST /api/trailers
// @access  Private
const createTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.create(req.body);
    res.status(201).json(trailer);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Trailer number already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update trailer
// @route   PUT /api/trailers/:id
// @access  Private
const updateTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!trailer) {
      return res.status(404).json({ message: 'Trailer not found' });
    }
    
    res.json(trailer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete trailer
// @route   DELETE /api/trailers/:id
// @access  Private
const deleteTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.findByIdAndDelete(req.params.id);
    
    if (!trailer) {
      return res.status(404).json({ message: 'Trailer not found' });
    }
    
    res.json({ message: 'Trailer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getTrailers,
  getTrailerById,
  createTrailer,
  updateTrailer,
  deleteTrailer
};