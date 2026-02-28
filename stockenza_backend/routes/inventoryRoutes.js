const express = require('express');
const router  = express.Router();

const { getItems, createItem, updateItem, deleteItem } = require('../controllers/inventoryController');
const { protect }               = require('../middleware/authMiddleware');
const { validateInventoryItem } = require('../middleware/validate');

// Validation is now applied on POST (create) and PUT (update)
router.route('/')
  .get(protect, getItems)
  .post(protect, validateInventoryItem, createItem);

router.route('/:id')
  .put(protect, validateInventoryItem, updateItem)
  .delete(protect, deleteItem);

module.exports = router;