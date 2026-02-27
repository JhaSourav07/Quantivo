const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// @desc    Create new order & update stock
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // 1. Create the order
    const order = await Order.create({
      items,
      totalAmount,
      createdBy: req.user._id
    });

    // 2. Loop through each item in the order and decrease inventory stock
    for (const item of items) {
      // Find the inventory item and decrease its quantity
      await Inventory.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.qty } }, // $inc with a negative number subtracts
        { new: true }
      );
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (for reports/history)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    // Fetch orders, sort by newest, and 'populate' the product details so we get names, not just IDs
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name costPrice sellingPrice'); 
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders };