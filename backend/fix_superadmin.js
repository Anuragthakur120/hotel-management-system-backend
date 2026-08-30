const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crown_hotel_pms';

async function fix() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  await User.deleteMany({ role: 'superadmin' });
  await User.deleteMany({ mobile: '9807252700' });
  
  let superadmin = new User({ role: 'superadmin' });
  superadmin.name = 'Crown SuperAdmin';
  superadmin.mobile = '9807252700';
  superadmin.email = 'ravisingh01';
  superadmin.passwordHash = 'NOT_SET';
  
  await superadmin.save();
  console.log('Superadmin saved:', superadmin);

  process.exit(0);
}

fix().catch(console.error);
