const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }
});

module.exports = mongoose.model('Floor', floorSchema);
