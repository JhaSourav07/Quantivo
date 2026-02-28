const express = require('express');
const router  = express.Router();

const { createOrder, getOrders } = require('../controllers/orderController');
const { protect }         = require('../middleware/authMiddleware');
const { validateOrder }   = require('../middleware/validate');

// Validation applied on POST (create)
router.route('/')
  .post(protect, validateOrder, createOrder)
  .get(protect, getOrders);

module.exports = router;