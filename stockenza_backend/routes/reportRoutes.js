const express = require('express');
const router = express.Router();
const { getSummaryStats, getChartData } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummaryStats);
router.get('/chart', protect, getChartData);

module.exports = router;