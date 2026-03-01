const express = require('express');
const router = express.Router();
const { getSummaryStats, getChartData, getPnlData } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummaryStats);
router.get('/chart',   protect, getChartData);
router.get('/pnl',     protect, getPnlData);

module.exports = router;
