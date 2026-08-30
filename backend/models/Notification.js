const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  forUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['new_guest_submission', 'guest_updated', 'reservation_created'],
    default: 'new_guest_submission'
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedGuestId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
