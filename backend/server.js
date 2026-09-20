const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const guestRoutes = require('./routes/guestRoutes');
const roomRoutes = require('./routes/roomRoutes');
const stayRoutes = require('./routes/stayRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const User = require('./models/User');
const Room = require('./models/Room');
const Hotel = require('./models/Hotel');
const GuestProfile = require('./models/GuestProfile');
const Stay = require('./models/Stay');
const Reservation = require('./models/Reservation');

const path = require('path');
const { error } = require('console');



const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Anuragthakur130:ram123@cluster0.lakvfrw.mongodb.net/hotel_crown_pms?appName=Cluster0';

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initial Database Seeder
async function seedMongoDB() {
  try {
    // 1. SuperAdmin User
    let superadmin = await User.findOne({
      $or: [{ role: 'superadmin' }, { mobile: '9807252700' }, { username: 'ravisingh01' }]
    });
    if (!superadmin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('superadmin123', salt);
      superadmin = new User({
        role: 'superadmin',
        name: 'Crown SuperAdmin',
        username: 'ravisingh01',
        mobile: '9807252700',
        email: 'ravisingh01@crownhotel.com',
        passwordHash: hash
      });
      await superadmin.save();
      console.log('👑 Auto-provisioned SuperAdmin (username: ravisingh01 / pass: superadmin123)');
    } else {
      const isMatch = superadmin.passwordHash ? await bcrypt.compare('superadmin123', superadmin.passwordHash) : false;
      if (!isMatch || superadmin.username !== 'ravisingh01' || superadmin.mobile !== '9807252700') {
        const salt = await bcrypt.genSalt(10);
        superadmin.passwordHash = await bcrypt.hash('superadmin123', salt);
        superadmin.username = 'ravisingh01';
        superadmin.mobile = '9807252700';
        await superadmin.save();
        console.log('👑 Verified & updated SuperAdmin credentials (username: ravisingh01 / pass: superadmin123)');
      }
    }

    // 2. Default Admin User
    let admin = await User.findOne({ role: 'admin', username: 'admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      admin = new User({
        role: 'admin',
        name: 'Frontdesk Manager',
        username: 'admin',
        mobile: '9888800000',
        email: 'admin@crownhotel.com',
        passwordHash: hash
      });
      await admin.save();
      console.log('🛡️ Auto-provisioned Admin (username: admin / pass: admin123)');
    } else {
      const isMatch = admin.passwordHash ? await bcrypt.compare('admin123', admin.passwordHash) : false;
      if (!isMatch || admin.mobile !== '9888800000') {
        const salt = await bcrypt.genSalt(10);
        admin.passwordHash = await bcrypt.hash('admin123', salt);
        admin.mobile = '9888800000';
        await admin.save();
        console.log('🛡️ Verified & updated Admin credentials (username: admin / pass: admin123)');
      }
    }

    // 3. Default Guest User
    let guestUser = await User.findOne({ mobile: '9876543210' });
    if (!guestUser) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('guest123', salt);
      guestUser = new User({
        role: 'guest',
        name: 'Rahul Sharma',
        mobile: '9876543210',
        email: 'rahul@example.com',
        passwordHash: hash
      });
      await guestUser.save();
      console.log('👤 Auto-provisioned Demo Guest (mobile: 9876543210 / pass: guest123)');
    }

    // 4. Default Hotel Config
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = new Hotel({
        name: 'Crown Hotel & Suites',
        hotelName: 'Crown Hotel & Suites',
        tagline: 'Luxury Stay & Comfort',
        address: 'Plot 14, Main Grand Trunk Road, Near City Center',
        contact: '+91 98765 43210',
        phone: '+91 98765 43210',
        email: 'reception@crownhotel.com',
        heroBanner: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
        aboutText: 'Crown Hotel offers unmatched hospitality, luxury rooms, and instant self check-in.',
        galleryImages: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        checkInTime: '12:00',
        checkOutTime: '11:00',
        gstNumber: '07AAAAA0000A1Z5',
        gstTaxRatePercent: 12,
        currencySymbol: '₹',
        upiId: 'crown.hotel@upi'
      });
      await hotel.save();
      console.log('🏨 Auto-provisioned Hotel Config');
    }

    // 5. Default Master Rooms (12 Rooms)
    const count = await Room.countDocuments();
    if (count === 0) {
      const defaultRooms = [
        { roomNumber: '101', floor: 1, category: 'Deluxe AC', price: 2499, pricePerNight: 2499, status: 'occupied', amenities: ['AC', 'TV', 'Geyser', 'WiFi', 'King Bed'] },
        { roomNumber: '102', floor: 1, category: 'Standard Non-AC', price: 1499, pricePerNight: 1499, status: 'vacant', amenities: ['TV', 'Geyser', 'WiFi', 'Queen Bed'] },
        { roomNumber: '103', floor: 1, category: 'Deluxe AC', price: 2499, pricePerNight: 2499, status: 'dirty', amenities: ['AC', 'TV', 'Geyser', 'WiFi', 'King Bed'] },

        { roomNumber: '201', floor: 2, category: 'Super Deluxe', price: 3499, pricePerNight: 3499, status: 'vacant', amenities: ['AC', 'Smart TV', 'Geyser', 'WiFi', 'Balcony'] },
        { roomNumber: '202', floor: 2, category: 'Super Deluxe', price: 3499, pricePerNight: 3499, status: 'occupied', amenities: ['AC', 'Smart TV', 'Geyser', 'WiFi', 'Balcony'] },
        { roomNumber: '203', floor: 2, category: 'Standard Non-AC', price: 1499, pricePerNight: 1499, status: 'vacant', amenities: ['TV', 'Geyser', 'WiFi'] },

        { roomNumber: '301', floor: 3, category: 'Crown Suite', price: 4999, pricePerNight: 4999, status: 'reserved', amenities: ['AC', 'Jacuzzi', 'Smart TV', 'WiFi', 'Balcony'] },
        { roomNumber: '302', floor: 3, category: 'Super Deluxe', price: 3499, pricePerNight: 3499, status: 'vacant', amenities: ['AC', 'Smart TV', 'Geyser', 'WiFi'] },
        { roomNumber: '303', floor: 3, category: 'Deluxe AC', price: 2499, pricePerNight: 2499, status: 'vacant', amenities: ['AC', 'TV', 'Geyser', 'WiFi'] },

        { roomNumber: '401', floor: 4, category: 'Crown Suite', price: 4999, pricePerNight: 4999, status: 'vacant', amenities: ['AC', 'Jacuzzi', 'Smart TV', 'Balcony'] },
        { roomNumber: '402', floor: 4, category: 'Crown Suite', price: 4999, pricePerNight: 4999, status: 'vacant', amenities: ['AC', 'Jacuzzi', 'Smart TV', 'Balcony'] },
        { roomNumber: '403', floor: 4, category: 'Super Deluxe', price: 3499, pricePerNight: 3499, status: 'maintenance', amenities: ['AC', 'Smart TV', 'Geyser'] }
      ];
      await Room.insertMany(defaultRooms);
      console.log('🛏️ Auto-provisioned 12 Master Rooms in MongoDB');
    }

    // 6. Default Guest Profile
    let guestProfile = await GuestProfile.findOne({ mobile: '9876543210' });
    if (!guestProfile) {
      guestProfile = new GuestProfile({
        userId: guestUser ? guestUser._id : null,
        name: 'Rahul Sharma',
        mobile: '9876543210',
        address: 'B-42, Sector 62, Noida, UP',
        idType: 'Aadhaar Card',
        idNumberMasked: 'XXXX-XXXX-9012',
        idNumberFull: '1234-5678-9012',
        verificationStatus: 'valid',
        idDocuments: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', type: 'Self ID Proof' }],
        totalVisits: 2,
        totalSpent: 4998
      });
      await guestProfile.save();
    }

    // 7. Default Stay for Room 101
    const stayCount = await Stay.countDocuments();
    if (stayCount === 0) {
      const room101 = await Room.findOne({ roomNumber: '101' });
      if (room101) {
        const stay = new Stay({
          guestProfileId: guestProfile._id,
          name: 'Rahul Sharma',
          mobile: '9876543210',
          aadhaarMasked: 'XXXX-XXXX-9012',
          address: 'B-42, Sector 62, Noida, UP',
          roomId: room101._id,
          roomNumber: '101',
          bookedRoomPricePerNight: 2499,
          checkInDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          expectedCheckOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          status: 'Checked-In',
          advancePaid: 1000,
          paymentMethod: 'UPI',
          services: [
            { id: 'srv_1', name: 'Special Breakfast Buffet', price: 350, date: new Date().toISOString(), category: 'Food' }
          ]
        });
        await stay.save();
        room101.currentStayId = stay._id.toString();
        await room101.save();
        console.log('📌 Auto-provisioned Default Active Stay for Room 101');
      }
    }

  } catch (err) {
    console.warn('Seeding note:', err.message);
  }
}

// Database Connection & Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('⚠️ Database connection error:', err.message);
    return res.status(500).json({ error: 'Database connection failed: ' + err.message });
  }
});

let isSeeded = false;
async function ensureSeeded() {
  if (isSeeded) return;
  try {
    await seedMongoDB();
    isSeeded = true;
    console.log('🍃 MongoDB connected & verified (Crown HMS Database)');
  } catch (err) {
    console.warn('⚠️ Seeding note:', err.message);
  }
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/stays', stayRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error: false,

  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Crown Hotel Management System REST API',
    version: '2.0.0 (Express + MongoDB)',
    timestamp: new Date().toISOString()
  });
});


if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`👑 Crown HMS Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;


