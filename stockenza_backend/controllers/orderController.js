const Order     = require('../models/Order');
const Inventory = require('../models/Inventory');

/**
 * POST /api/orders
 * Creates an order after validating:
 *  - each productId exists and belongs to the user
 *  - sufficient stock is available
 * Then atomically decrements stock.
 */
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    // ── Pre-flight: validate every line item ──
    const enriched = [];

    for (const item of items) {
      if (!item.productId || !item.qty || item.qty <= 0) {
        return res.status(400).json({ message: 'Each order item needs a valid productId and qty.' });
      }

      const product = await Inventory.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      // Ownership — user can only sell their own products
      if (product.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: `Not authorised to sell product: ${product.name}` });
      }

      // Stock check
      if (product.quantity < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${item.qty}.`,
        });
      }

      enriched.push({ product, qty: item.qty, productId: item.productId });
    }

    // ── Create the order ──
    const order = await Order.create({
      items:       items.map(({ productId, qty }) => ({ productId, qty })),
      totalAmount: parseFloat(totalAmount),
      createdBy:   req.user._id,
    });

    // ── Atomically decrement stock for each product ──
    await Promise.all(
      enriched.map(({ productId, qty }) =>
        Inventory.findByIdAndUpdate(
          productId,
          { $inc: { quantity: -qty } },
          { new: true }
        )
      )
    );

    return res.status(201).json(order);
  } catch (err) {
    console.error('[createOrder]', err.message);
    return res.status(500).json({ message: 'Server error — could not create order.' });
  }
};

/**
 * GET /api/orders
 * Returns all orders created by the authenticated user.
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order
      .find({ createdBy: req.user._id })   // ← scoped to current user
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name costPrice sellingPrice');

    return res.status(200).json(orders);
  } catch (err) {
    console.error('[getOrders]', err.message);
    return res.status(500).json({ message: 'Server error — could not fetch orders.' });
  }
};

module.exports = { createOrder, getOrders };