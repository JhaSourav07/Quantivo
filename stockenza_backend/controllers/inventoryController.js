const cloudinary = require('cloudinary').v2;
const Inventory  = require('../models/Inventory');

/* ── Cloudinary config ─────────────────────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ── Helper: upload a Base64 data-URI to Cloudinary ───────────── */
const uploadToCloudinary = async (base64String) => {
  const result = await cloudinary.uploader.upload(base64String, {
    folder:         'stockenza/inventory',
    resource_type:  'image',
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
  });
  return result.secure_url;
};

/**
 * GET /api/inventory
 * Returns only items belonging to the authenticated user.
 */
const getItems = async (req, res) => {
  try {
    const items = await Inventory
      .find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json(items);
  } catch (err) {
    console.error('[getItems]', err.message);
    return res.status(500).json({ message: 'Server error — could not fetch inventory.' });
  }
};

/**
 * POST /api/inventory
 * Creates a new inventory item. Optionally uploads an image to Cloudinary.
 */
const createItem = async (req, res) => {
  try {
    const { name, sku, category, quantity, costPrice, sellingPrice, image } = req.body;

    // Upload image to Cloudinary if a Base64 string was provided
    let imageUrl = '';
    if (image) {
      try {
        imageUrl = await uploadToCloudinary(image);
      } catch (uploadErr) {
        console.error('[createItem] Cloudinary upload failed:', uploadErr.message);
        return res.status(500).json({ message: 'Image upload failed. Please try again.' });
      }
    }

    const item = await Inventory.create({
      name:         name.trim(),
      sku:          sku?.trim()      || '',
      category:     category?.trim() || '',
      quantity:     Number(quantity),
      costPrice:    parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      imageUrl,
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
 * Optionally re-uploads a new image to Cloudinary.
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

    const { name, sku, category, quantity, costPrice, sellingPrice, image } = req.body;

    // Build the updates object — only include keys present in the request
    const updates = {};

    if (name         !== undefined) updates.name         = String(name).trim();
    if (sku          !== undefined) updates.sku          = String(sku).trim();
    if (category     !== undefined) updates.category     = String(category).trim();
    if (quantity     !== undefined) updates.quantity     = Number(quantity);
    if (costPrice    !== undefined) updates.costPrice    = parseFloat(costPrice);
    if (sellingPrice !== undefined) updates.sellingPrice = parseFloat(sellingPrice);

    // Re-upload image only when a new Base64 string is sent
    if (image) {
      try {
        updates.imageUrl = await uploadToCloudinary(image);
      } catch (uploadErr) {
        console.error('[updateItem] Cloudinary upload failed:', uploadErr.message);
        return res.status(500).json({ message: 'Image upload failed. Please try again.' });
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