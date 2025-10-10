const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updatePaymentStatus,
  deleteInvoice,
} = require('../controllers/invoices');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(authorize('admin', 'manager', 'staff'), createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(authorize('admin', 'manager'), updateInvoice)
  .delete(authorize('admin'), deleteInvoice);

router.route('/:id/payment-status')
  .put(authorize('admin', 'manager'), updatePaymentStatus);

module.exports = router;