const express = require('express');
const router = express.Router();
const {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
} = require('../controllers/parties');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

router.route('/')
  .get(getParties)
  .post(authorize('admin', 'manager'), createParty);

router.route('/:id')
  .get(getPartyById)
  .put(authorize('admin', 'manager'), updateParty)
  .delete(authorize('admin'), deleteParty);

module.exports = router;