const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' // Links this item to the user who created it
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);