const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

// Grouping routes by path for cleaner code
router.route('/')
  .get(protect, getItems)
  .post(protect, createItem);

router.route('/:id')
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;