const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const GuestProfile = require('../models/GuestProfile');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

// 1. Get All Reservations
router.get('/', verifyToken, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ checkIn: 1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Reservation
router.post('/', async (req, res) => {
  try {
    const { guestName, mobile, roomId, roomNumber, checkIn, checkOut, pricePerNight, advancePaid } = req.body;
    
    if (!guestName || !mobile || !roomNumber) {
      return res.status(400).json({ error: 'Guest Name, Mobile, and Room Number are required' });
    }

    const room = await Room.findOne({ roomNumber: String(roomNumber) }) || await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const bookedPrice = Number(pricePerNight || room.pricePerNight || room.price || 2500);

    const reservation = new Reservation({
      guestName: guestName.trim(),
      mobile: mobile.trim(),
      roomId: room._id,
      roomNumber: room.roomNumber,
      checkIn: checkIn ? new Date(checkIn) : new Date(),
      checkOut: checkOut ? new Date(checkOut) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      pricePerNight: bookedPrice,
      status: 'Confirmed',
      advancePaid: Number(advancePaid || 0)
    });
    await reservation.save();

    // Mark room status as reserved if vacant
    if (room.status === 'vacant' || room.status === 'available') {
      room.status = 'reserved';
      await room.save();
    }

    res.json({ message: 'Reservation created successfully', reservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Cancel Reservation
router.delete('/:id', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (reservation) {
      const room = await Room.findById(reservation.roomId);
      if (room && room.status === 'reserved') {
        room.status = 'vacant';
        await room.save();
      }
      await Reservation.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
