const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name:         { type: String, required: true },
  sku:          { type: String, default: '' },
  category:     { type: String, default: '' },
  quantity:     { type: Number, required: true, default: 0 },
  costPrice:    { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  imageUrl:     { type: String, default: '' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);