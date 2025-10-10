
const Party = require('../models/Party');

// @desc    Get all parties
// @route   GET /api/parties
// @access  Public
exports.getParties = async (req, res, next) => {
  try {
    const parties = await Party.find();
    res.status(200).json({ success: true, data: parties });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single party
// @route   GET /api/parties/:id
// @access  Public
exports.getPartyById = async (req, res, next) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: party });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new party
// @route   POST /api/parties
// @access  Private
exports.createParty = async (req, res, next) => {
  try {
    const party = await Party.create(req.body);
    res.status(201).json({ success: true, data: party });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ success: false, message: errors.join('. ') });
    } else {
      res.status(400).json({ success: false, message: 'Failed to create party' });
    }
  }
};

// @desc    Update party
// @route   PUT /api/parties/:id
// @access  Private
exports.updateParty = async (req, res, next) => {
  try {
    const party = await Party.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!party) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }
    res.status(200).json({ success: true, data: party });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ success: false, message: errors.join('. ') });
    } else {
      res.status(400).json({ success: false, message: 'Failed to update party' });
    }
  }
};

// @desc    Delete party
// @route   DELETE /api/parties/:id
// @access  Private
exports.deleteParty = async (req, res, next) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
