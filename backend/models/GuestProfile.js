const mongoose = require('mongoose');

const guestProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mobile: { type: String, required: true, index: true },
  name: { type: String, required: true },
  address: { type: String, default: '' },
  idType: { type: String, default: 'Aadhaar Card' },
  idNumberMasked: { type: String, default: '' },
  idNumberFull: { type: String, default: '' }, // Restricted Admin/SuperAdmin access
  idDocuments: [{
    url: { type: String, required: true },
    type: { type: String, default: 'Self ID Proof' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'valid', 'invalid'],
    default: 'pending'
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalVisits: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GuestProfile', guestProfileSchema);
