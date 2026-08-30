const mongoose = require('mongoose');

const folioSchema = new mongoose.Schema({
  stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay' },
  items: [{
    description: String,
    amount: Number,
    category: String,
    timestamp: { type: Date, default: Date.now }
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Folio', folioSchema);
