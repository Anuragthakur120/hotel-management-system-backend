const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' },
  floor: { type: Number, default: 1 },
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' },
  category: { type: String, default: 'Deluxe AC' },
  price: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'vacant', 'occupied', 'reserved', 'cleaning', 'dirty', 'maintenance'],
    default: 'available'
  },
  images: [String],
  amenities: [String],
  isActive: { type: Boolean, default: true },
  currentStayId: { type: String, default: null }
});

module.exports = mongoose.model('Room', roomSchema);
