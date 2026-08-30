const mongoose = require('mongoose');

const staySchema = new mongoose.Schema({
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  guestProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'GuestProfile' },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  aadhaarMasked: { type: String, default: '' },
  address: { type: String, default: '' },
  guestsCount: { type: Number, default: 1 },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomNumber: { type: String, required: true },
  bookedRoomPricePerNight: { type: Number, required: true },
  actualCheckIn: { type: Date, default: Date.now },
  checkInDate: { type: String },
  expectedCheckOutDate: { type: String },
  actualCheckOut: { type: Date },
  status: { type: String, enum: ['Checked-In', 'Checked-Out'], default: 'Checked-In' },
  advancePaid: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'UPI' },
  services: [{
    id: String,
    name: String,
    price: Number,
    date: String,
    category: String
  }],
  folioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folio' }
}, { timestamps: true });

module.exports = mongoose.model('Stay', staySchema);
