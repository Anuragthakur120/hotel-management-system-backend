const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Stay = require('../models/Stay');
const Payment = require('../models/Payment');
const Folio = require('../models/Folio');
const AuditLog = require('../models/AuditLog');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

// 1. Get Financial & Operational Report Summary
router.get('/financial', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const rooms = await Room.find();
    const stays = await Stay.find().sort({ createdAt: -1 });
    const payments = await Payment.find().sort({ timestamp: -1 });
    const folios = await Folio.find().sort({ createdAt: -1 });

    const totalRooms = rooms.length || 12;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const vacantRooms = rooms.filter(r => r.status === 'vacant' || r.status === 'available').length;
    const dirtyRooms = rooms.filter(r => r.status === 'dirty' || r.status === 'cleaning').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    const totalPaymentCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalFolioRevenue = folios.reduce((sum, f) => sum + (f.grandTotal || 0), 0);
    const activeStaysCount = stays.filter(s => s.status === 'Checked-In').length;
    const completedStaysCount = stays.filter(s => s.status === 'Checked-Out').length;

    res.json({
      summary: {
        totalRooms,
        occupiedRooms,
        vacantRooms,
        dirtyRooms,
        maintenanceRooms,
        occupancyRate,
        totalRevenue: Math.max(totalPaymentCollected, totalFolioRevenue),
        totalPaymentsCollected: totalPaymentCollected,
        activeStaysCount,
        completedStaysCount
      },
      rooms,
      stays,
      payments,
      folios
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Audit Logs
router.get('/audit-logs', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create Audit Log Entry
router.post('/audit-logs', verifyToken, async (req, res) => {
  try {
    const { action, entityType, entityId, before, after } = req.body;
    const log = new AuditLog({
      userId: req.user.name || req.user.username || 'System User',
      action: action || 'Action executed',
      entityType: entityType || 'System',
      entityId: entityId || '',
      before: before || null,
      after: after || null
    });
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
