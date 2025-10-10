
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public
exports.getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find().populate('customer');
    res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Public
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      'customer products.product'
    );
    if (!invoice) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create(req.body);

    // Update stock
    for (const item of invoice.products) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!invoice) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Update invoice payment status
// @route   PUT /api/invoices/:id/payment-status
// @access  Private
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate('customer');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update payment status' });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false });
    }

    // Add stock back
    for (const item of invoice.products) {
      const product = await Product.findById(item.product);
      product.stock += item.quantity;
      await product.save();
    }

    await invoice.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
