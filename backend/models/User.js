const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'guest'],
    required: true,
    default: 'guest'
  },
  name: { type: String, required: true },
  username: { type: String, default: '', index: true },
  mobile: { type: String, required: true, index: true },
  email: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

