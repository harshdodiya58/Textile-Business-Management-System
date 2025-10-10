
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getProducts) // All authenticated users can view
  .post(authorize('admin', 'manager'), createProduct); // Only admin and manager can create

router.route('/:id')
  .get(getProductById) // All authenticated users can view
  .put(authorize('admin', 'manager'), updateProduct) // Only admin and manager can update
  .delete(authorize('admin'), deleteProduct); // Only admin can delete

module.exports = router;
