const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  folioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folio' },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
