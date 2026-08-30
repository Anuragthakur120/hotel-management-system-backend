const express = require('express');
const router = express.Router();
const Stay = require('../models/Stay');
const Room = require('../models/Room');
const GuestProfile = require('../models/GuestProfile');
const Folio = require('../models/Folio');
const Payment = require('../models/Payment');
const Hotel = require('../models/Hotel');
const AuditLog = require('../models/AuditLog');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

// 1. Get All Stays
router.get('/', verifyToken, async (req, res) => {
  try {
    const stays = await Stay.find().sort({ createdAt: -1 });
    res.json(stays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Logged-in Guest Stay History
router.get('/my-stays', verifyToken, async (req, res) => {
  try {
    const stays = await Stay.find({ mobile: req.user.mobile }).sort({ createdAt: -1 });
    res.json(stays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Perform Check-In (New or Returning Guest) with PRICE SNAPSHOT LOCK
router.post('/check-in', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const { name, mobile, roomId, roomNumber, pricePerNight, address, idType, idNumberFull, idDocUrl, guestsCount, advancePaid, paymentMethod } = req.body;
    
    if (!name || !mobile) return res.status(400).json({ error: 'Guest name and mobile number are required' });

    const cleanMobile = mobile.trim();
    const room = await Room.findById(roomId) || await Room.findOne({ roomNumber: String(roomNumber) });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    if (room.status === 'occupied') {
      return res.status(409).json({ error: `Room ${room.roomNumber} is currently occupied! Double booking prevented.` });
    }

    // Lock price snapshot
    const bookedPrice = Number(pricePerNight || room.pricePerNight || room.price || 2500);

    // Upsert Guest Master Profile
    const maskedId = idNumberFull ? `XXXX-XXXX-${idNumberFull.slice(-4)}` : 'XXXX-XXXX-9012';
    let profile = await GuestProfile.findOne({ mobile: cleanMobile });
    if (!profile) {
      profile = new GuestProfile({
        name,
        mobile: cleanMobile,
        address: address || '',
        idType: idType || 'Aadhaar Card',
        idNumberFull: idNumberFull || '',
        idNumberMasked: maskedId,
        verificationStatus: 'valid',
        idDocuments: idDocUrl ? [{ url: idDocUrl, type: 'Self ID Proof', uploadedAt: new Date() }] : []
      });
    } else {
      profile.name = name;
      if (address) profile.address = address;
      if (idType) profile.idType = idType;
      if (idNumberFull) {
        profile.idNumberFull = idNumberFull;
        profile.idNumberMasked = maskedId;
      }
      profile.verificationStatus = 'valid';
      if (idDocUrl) {
        profile.idDocuments.unshift({ url: idDocUrl, type: 'Self ID Proof', uploadedAt: new Date() });
      }
    }
    await profile.save();

    const stay = new Stay({
      guestProfileId: profile._id,
      name,
      mobile: cleanMobile,
      aadhaarMasked: profile.idNumberMasked,
      address: address || profile.address,
      roomId: room._id,
      roomNumber: room.roomNumber,
      bookedRoomPricePerNight: bookedPrice, // SNAPSHOT LOCK
      checkInDate: new Date().toISOString().slice(0, 16),
      expectedCheckOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      guestsCount: Number(guestsCount || 1),
      advancePaid: Number(advancePaid || 0),
      paymentMethod: paymentMethod || 'UPI',
      status: 'Checked-In',
      services: []
    });
    await stay.save();

    // Update Room status to occupied
    room.status = 'occupied';
    room.currentStayId = stay._id.toString();
    await room.save();

    // Audit log entry
    await AuditLog.create({
      userId: req.user.name || req.user.username || 'Admin',
      action: `Checked-In guest ${name} into Room ${room.roomNumber}`,
      entityType: 'stay',
      entityId: stay._id.toString()
    });

    res.json({ message: 'Guest checked in successfully', stay, room, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Add Room Service Order to Stay
router.post('/:id/service', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: 'Service name and price are required' });

    const stay = await Stay.findById(req.params.id);
    if (!stay) return res.status(404).json({ error: 'Stay record not found' });

    const serviceItem = {
      id: 'srv_' + Date.now(),
      name,
      price: Number(price),
      date: new Date().toISOString(),
      category: category || 'Food'
    };

    stay.services.push(serviceItem);
    await stay.save();

    res.json({ message: 'Room service order added', stay });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Perform Complete Checkout & Billing Calculation
router.post('/:id/checkout', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const { paymentMethod, discountAmount, notes } = req.body;
    const stay = await Stay.findById(req.params.id);
    if (!stay) return res.status(404).json({ error: 'Stay record not found' });

    const room = await Room.findById(stay.roomId);

    // Calculate billing
    const hotel = await Hotel.findOne() || {};
    const taxRate = hotel.gstTaxRatePercent || 12;

    const checkInMs = new Date(stay.checkInDate || stay.actualCheckIn).getTime();
    const checkOutMs = Date.now();
    const diffHours = Math.max(1, (checkOutMs - checkInMs) / (1000 * 60 * 60));
    const nights = Math.max(1, Math.ceil(diffHours / 24));

    const roomCharges = nights * stay.bookedRoomPricePerNight;
    const servicesTotal = (stay.services || []).reduce((sum, s) => sum + (s.price || 0), 0);
    const subtotal = roomCharges + servicesTotal;

    const discount = Number(discountAmount || 0);
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round((taxable * taxRate) / 100);
    const grandTotal = taxable + tax;
    const advancePaid = Number(stay.advancePaid || 0);
    const finalAmountPaid = Math.max(0, grandTotal - advancePaid);

    // Create Folio in MongoDB
    const folio = new Folio({
      stayId: stay._id,
      items: [
        { description: `Room Tariff (${nights} Night/s @ ₹${stay.bookedRoomPricePerNight})`, amount: roomCharges, category: 'Room' },
        ...(stay.services || []).map(s => ({ description: s.name, amount: s.price, category: s.category || 'Service' }))
      ],
      subtotal,
      tax,
      discount,
      grandTotal,
      balance: 0
    });
    await folio.save();

    // Create Payment Record
    const payment = new Payment({
      folioId: folio._id,
      amount: finalAmountPaid > 0 ? finalAmountPaid : grandTotal,
      method: paymentMethod || stay.paymentMethod || 'UPI'
    });
    await payment.save();

    // Update Stay status
    stay.status = 'Checked-Out';
    stay.actualCheckOut = new Date();
    stay.folioId = folio._id;
    await stay.save();

    // Update Room status to dirty
    if (room) {
      room.status = 'dirty';
      room.currentStayId = null;
      await room.save();
    }

    // Update Guest Profile spent and visits
    if (stay.guestProfileId) {
      const profile = await GuestProfile.findById(stay.guestProfileId);
      if (profile) {
        profile.totalSpent = (profile.totalSpent || 0) + grandTotal;
        profile.totalVisits = (profile.totalVisits || 0) + 1;
        await profile.save();
      }
    }

    // Audit log
    await AuditLog.create({
      userId: req.user.name || req.user.username || 'Admin',
      action: `Completed Checkout for ${stay.name} (Room ${stay.roomNumber}). Total Bill: ₹${grandTotal}`,
      entityType: 'folio',
      entityId: folio._id.toString()
    });

    res.json({
      message: 'Checkout completed successfully',
      stay,
      folio,
      payment,
      billingDetails: {
        nights,
        roomCharges,
        servicesTotal,
        subtotal,
        discount,
        tax,
        grandTotal,
        advancePaid,
        finalAmountPaid,
        paymentMethod: payment.method
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

