const Inventory = require('../models/Inventory');

/**
 * GET /api/inventory
 * Returns only items belonging to the authenticated user.
 */
const getItems = async (req, res) => {
  try {
    const items = await Inventory
      .find({ createdBy: req.user._id })   // ← scoped to current user
      .sort({ createdAt: -1 });

    return res.status(200).json(items);
  } catch (err) {
    console.error('[getItems]', err.message);
    return res.status(500).json({ message: 'Server error — could not fetch inventory.' });
  }
};

/**
 * POST /api/inventory
 * Creates a new inventory item for the authenticated user.
 */
const createItem = async (req, res) => {
  try {
    const { name, quantity, costPrice, sellingPrice, imageUrl } = req.body;

    const item = await Inventory.create({
      name:         name.trim(),
      quantity:     Number(quantity),
      costPrice:    parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      imageUrl:     imageUrl?.trim() || '',
      createdBy:    req.user._id,
    });

    return res.status(201).json(item);
  } catch (err) {
    console.error('[createItem]', err.message);
    return res.status(500).json({ message: 'Server error — could not create item.' });
  }
};

/**
 * PUT /api/inventory/:id
 * Updates an item — only if it belongs to the authenticated user.
 */
const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // ── Ownership check ──
    if (item.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to update this item.' });
    }

    // Sanitise updateable fields
    const allowed = ['name', 'quantity', 'costPrice', 'sellingPrice', 'imageUrl'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = key === 'name' || key === 'imageUrl'
          ? String(req.body[key]).trim()
          : Number(req.body[key]);
      }
    }

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    return res.status(200).json(updated);
  } catch (err) {
    console.error('[updateItem]', err.message);
    return res.status(500).json({ message: 'Server error — could not update item.' });
  }
};

/**
 * DELETE /api/inventory/:id
 * Deletes an item — only if it belongs to the authenticated user.
 */
const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // ── Ownership check ──
    if (item.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to delete this item.' });
    }

    await item.deleteOne();

    return res.status(200).json({ id: req.params.id, message: 'Item deleted successfully.' });
  } catch (err) {
    console.error('[deleteItem]', err.message);
    return res.status(500).json({ message: 'Server error — could not delete item.' });
  }
};

module.exports = { getItems, createItem, updateItem, deleteItem };