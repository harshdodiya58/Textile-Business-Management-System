const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getTopSellingProducts, getTopBuyers, getPriceDistribution } = require('../controllers/dashboard');
const { protect } = require('../middleware/auth');

// Apply authentication to all dashboard routes
router.use(protect);

router.route('/').get(getDashboardMetrics);
router.route('/topselling').get(getTopSellingProducts);
router.route('/topbuyers').get(getTopBuyers);
router.route('/pricedist').get(getPriceDistribution);

module.exports = router;