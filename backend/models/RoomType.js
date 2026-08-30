const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  basePrice: { type: Number, required: true },
  maxAdults: { type: Number, default: 2 },
  maxChildren: { type: Number, default: 1 },
  description: { type: String, default: '' },
  images: [String]
});

module.exports = mongoose.model('RoomType', roomTypeSchema);
