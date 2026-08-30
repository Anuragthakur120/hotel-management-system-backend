const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, default: 'Crown Hotel & Suites' },
  logo: { type: String, default: '' },
  address: { type: String, default: 'Plot 14, Main Grand Trunk Road' },
  contact: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'reception@crownhotel.com' },
  heroBanner: { type: String, default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80' },
  aboutText: { type: String, default: 'Crown Hotel offers unmatched hospitality, luxury rooms, and instant self check-in.' },
  galleryImages: [String],
  checkInTime: { type: String, default: '12:00' },
  checkOutTime: { type: String, default: '11:00' },
  gstNumber: { type: String, default: '07AAAAA0000A1Z5' },
  currencySymbol: { type: String, default: '₹' },
  guestFormFields: [{
    fieldName: String,
    label: String,
    required: Boolean,
    fieldType: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
