const Order     = require('../models/Order');
const Inventory = require('../models/Inventory');


const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    // ── Pre-flight: validate every line item ──
    const enriched = [];

    for (const item of items) {
      if (!item.productId || !item.qty || item.qty <= 0) {
        return res.status(400).json({
          message: 'Each order item needs a valid productId and qty.',
        });
      }

      const product = await Inventory.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      // Ownership — user can only sell their own products
      if (product.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: `Not authorised to sell product: ${product.name}`,
        });
      }

      // Stock check (optimistic — the atomic update below is the true guard)
      if (product.quantity < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${item.qty}.`,
        });
      }

      enriched.push({ product, qty: item.qty, productId: item.productId });
    }

    // ── Calculate totalAmount server-side ──
    // Never trust the client-supplied value — compute it from current selling prices
    const totalAmount = enriched.reduce(
      (sum, { product, qty }) => sum + product.sellingPrice * qty,
      0
    );

    // ── Atomically decrement stock for each product ──
    // Using a conditional update ($gte) means if two requests race, only one
    // will succeed in decrementing — the other will get null back and we abort.
    const decrements = await Promise.all(
      enriched.map(({ productId, qty }) =>
        Inventory.findOneAndUpdate(
          { _id: productId, quantity: { $gte: qty } }, // condition prevents oversell
          { $inc: { quantity: -qty } },
          { new: true }
        )
      )
    );

    // If any decrement returned null, another request consumed the stock
    const failedIndex = decrements.findIndex((result) => result === null);
    if (failedIndex !== -1) {
      // Roll back any decrements that already succeeded
      await Promise.all(
        decrements.map((result, i) => {
          if (result !== null) {
            return Inventory.findByIdAndUpdate(enriched[i].productId, {
              $inc: { quantity: enriched[i].qty },
            });
          }
        })
      );

      return res.status(400).json({
        message: `Insufficient stock for "${enriched[failedIndex].product.name}" — it was just purchased by someone else.`,
      });
    }

    // ── Create the order with the server-calculated total ──
    const order = await Order.create({
      items:       items.map(({ productId, qty }) => ({ productId, qty })),
      totalAmount: Math.round(totalAmount * 100) / 100,
      createdBy:   req.user._id,
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error('[createOrder]', err.message);
    return res.status(500).json({ message: 'Server error — could not create order.' });
  }
};

/**
 * GET /api/orders?startDate=&endDate=
 * Returns orders created by the authenticated user.
 * Optionally filters by a createdAt date range when startDate / endDate
 * ISO strings are provided as query parameters.
 */
const getOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build optional date-range filter (same pattern as reportController)
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate)   dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order
      .find({ createdBy: req.user._id, ...dateFilter })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name costPrice sellingPrice');

    return res.status(200).json(orders);
  } catch (err) {
    console.error('[getOrders]', err.message);
    return res.status(500).json({ message: 'Server error — could not fetch orders.' });
  }
};

module.exports = { createOrder, getOrders };