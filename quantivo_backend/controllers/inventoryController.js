const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
const getItems = async (req, res) => {
  try {
    // Fetch all items, sorted by newest first
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new inventory item
// @route   POST /api/inventory
const createItem = async (req, res) => {
  try {
    const { name, quantity, costPrice, sellingPrice, imageUrl } = req.body;

    // req.user._id comes from our 'protect' middleware
    const item = await Inventory.create({
      name,
      quantity,
      costPrice,
      sellingPrice,
      imageUrl,
      createdBy: req.user._id 
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the item and return the new version
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getItems, createItem, updateItem, deleteItem };