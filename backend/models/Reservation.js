const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  guestProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'GuestProfile' },
  guestName: { type: String, required: true },
  mobile: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomNumber: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  // CRITICAL PRICE SNAPSHOT LOCK!
  pricePerNight: { type: Number, required: true },
  status: { type: String, default: 'Confirmed' },
  advancePaid: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
