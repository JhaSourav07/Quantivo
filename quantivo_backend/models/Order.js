const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Inventory' 
      },
      qty: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);