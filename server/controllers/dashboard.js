const Invoice = require('../models/Invoice');
const Party = require('../models/Party');
const Product = require('../models/Product');

exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const totalSales = await Invoice.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalInvoices = await Invoice.countDocuments();

    const lowStockItems = await Product.countDocuments({ $expr: { $lt: ['$stock', '$minStock'] } });

    const totalCustomers = await Party.countDocuments({ type: 'Customer' });

    const pendingPayments = await Invoice.countDocuments({ paymentStatus: 'Pending' });

    res.status(200).json({
      success: true,
      data: {
        totalSales: totalSales[0]?.total || 0,
        totalInvoices,
        lowStockItems,
        totalCustomers,
        pendingPayments,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getTopSellingProducts = async (req, res, next) => {
  try {
    const topSellingProducts = await Invoice.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalQuantity: { $sum: '$products.quantity' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    res.status(200).json({
      success: true,
      data: topSellingProducts,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getTopBuyers = async (req, res, next) => {
  try {
    const topBuyers = await Invoice.aggregate([
      { $group: { _id: '$customer', totalPurchased: { $sum: '$totalAmount' } } },
      { $sort: { totalPurchased: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'parties',
          localField: '_id',
          foreignField: '_id',
          as: 'party',
        },
      },
      { $unwind: '$party' },
      {
        $project: {
          _id: 0,
          partyId: '$party._id',
          name: '$party.name',
          totalPurchased: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: topBuyers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getPriceDistribution = async (req, res, next) => {
  try {
    // Define buckets in INR
    const buckets = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 500, 1000, 2000, 3000, 5000, 10000],
          default: '5000+',
          output: { count: { $sum: 1 }, products: { $push: '$name' } },
        },
      },
    ]);

    // Normalize bucket labels
    const formatted = buckets.map((b) => {
      const label = typeof b._id === 'string' ? b._id : `${b._id}`;
      return { label, count: b.count, products: b.products || [] };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
