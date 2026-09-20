const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for room photo uploads
const uploadDir = path.join(__dirname, '../uploads/rooms');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `room-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 1. Get All Rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Multi-Photo Upload Endpoint
router.post('/upload-photos', verifyToken, roleCheck(['admin', 'superadmin']), upload.array('photos', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photo files uploaded' });
    }
    const urls = req.files.map(file => `/uploads/rooms/${file.filename}`);
    res.json({ urls, message: 'Photos uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create New Master Room
router.post('/', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const { roomNumber, floor, category, pricePerNight, price, amenities, images, description } = req.body;
    if (!roomNumber) return res.status(400).json({ error: 'Room number is required' });

    const existing = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existing) return res.status(400).json({ error: `Room ${roomNumber} already exists` });

    const roomPrice = Number(pricePerNight || price || 2500);
    const room = new Room({
      roomNumber: roomNumber.trim(),
      floor: Number(floor || 1),
      category: category || 'Deluxe AC',
      price: roomPrice,
      pricePerNight: roomPrice,
      status: 'vacant',
      amenities: Array.isArray(amenities) ? amenities : (amenities ? String(amenities).split(',').map(s => s.trim()) : []),
      images: Array.isArray(images) ? images : [],
      description: description || '',
      isActive: true
    });
    await room.save();

    res.json({ message: 'Room created successfully', room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Room (Price, Status, Category, Amenities, Images, Description)
router.put('/:id', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const { roomNumber, floor, price, pricePerNight, status, category, amenities, images, description, currentStayId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Double-booking protection
    if (status === 'occupied' && room.status === 'occupied' && currentStayId && currentStayId !== room.currentStayId) {
      return res.status(409).json({ error: 'Room is already occupied! Double booking prevented.' });
    }

    if (roomNumber) room.roomNumber = roomNumber.trim();
    if (floor !== undefined) room.floor = Number(floor);

    const newPrice = pricePerNight !== undefined ? Number(pricePerNight) : (price !== undefined ? Number(price) : room.price);
    room.price = newPrice;
    room.pricePerNight = newPrice;

    if (status) room.status = status;
    if (category) room.category = category;
    if (amenities !== undefined) {
      room.amenities = Array.isArray(amenities) ? amenities : String(amenities).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (images !== undefined) {
      room.images = Array.isArray(images) ? images : [];
    }
    if (description !== undefined) {
      room.description = description;
    }
    if (currentStayId !== undefined) room.currentStayId = currentStayId;

    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete Room
router.delete('/:id', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted from master inventory' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Dynamic Hotel Website & Property Config
router.get('/config', async (req, res) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = new Hotel({
        name: 'Crown Hotel & Suites',
        hotelName: 'Crown Hotel & Suites',
        tagline: 'Luxury Stay & Comfort',
        address: 'Plot 14, Main Grand Trunk Road, Near City Center',
        contact: '+91 98765 00000',
        phone: '+91 98765 00000',
        email: 'reception@crownhotel.com',
        gstNumber: '07AAAAA0000A1Z5',
        gstTaxRatePercent: 12,
        currencySymbol: '₹',
        upiId: 'crown.hotel@upi',
        heroBanner: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
        aboutText: 'Crown Hotel offers unmatched hospitality, luxury rooms, and instant self check-in.',
        galleryImages: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ]
      });
      await hotel.save();
    }
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Dynamic Hotel Config (Hero banner, website content, GST, Taxes, Payment Methods)
router.put('/config', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) hotel = new Hotel({});

    Object.assign(hotel, req.body);
    if (req.body.hotelName) hotel.name = req.body.hotelName;
    if (req.body.phone) hotel.contact = req.body.phone;

    await hotel.save();
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

