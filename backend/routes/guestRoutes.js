const express = require('express');
const router = express.Router();
const GuestProfile = require('../models/GuestProfile');
const Notification = require('../models/Notification');
const Stay = require('../models/Stay');
const User = require('../models/User');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `id_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

function processImageUrl(inputUrl) {
  if (!inputUrl) return null;
  let rawUrl = inputUrl;
  if (typeof inputUrl === 'object' && inputUrl !== null) {
    rawUrl = inputUrl.url || inputUrl.src || '';
  }
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;

  // Convert raw base64 to file on disk to keep MongoDB clean and lightweight
  if (rawUrl.startsWith('data:image/')) {
    try {
      const matches = rawUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `id_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        return `/uploads/${filename}`;
      }
    } catch (e) {
      console.error("Base64 save error:", e);
    }
  }

  return rawUrl;
}

// File Upload Endpoint
router.post('/upload-id', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Guest Self Registration / Check-in Submission
router.post('/submit-self', async (req, res) => {
  try {
    const { name, mobile, address, idType, idNumberFull, idDocUrl, idDocuments } = req.body;
    if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile number are required' });

    const cleanMobile = mobile.trim();
    const maskedId = idNumberFull ? `XXXX-XXXX-${idNumberFull.slice(-4)}` : 'XXXX-XXXX-9012';

    // Process single or array document URLs safely
    let cleanDocUrl = processImageUrl(idDocUrl);
    
    let profile = await GuestProfile.findOne({ mobile: cleanMobile });
    if (!profile) {
      profile = new GuestProfile({
        name: name.trim(),
        mobile: cleanMobile,
        address: address || '',
        idType: idType || 'Aadhaar Card',
        idNumberFull: idNumberFull || '',
        idNumberMasked: maskedId,
        idDocuments: cleanDocUrl ? [{ url: cleanDocUrl, type: 'Self ID Proof', uploadedAt: new Date() }] : [],
        verificationStatus: 'pending'
      });
    } else {
      profile.name = name.trim();
      if (address) profile.address = address;
      if (idType) profile.idType = idType;
      if (idNumberFull) profile.idNumberFull = idNumberFull;
      profile.idNumberMasked = maskedId;
      profile.verificationStatus = 'pending';
      if (cleanDocUrl) {
        profile.idDocuments.unshift({ url: cleanDocUrl, type: 'Self ID Proof', uploadedAt: new Date() });
      }
    }
    await profile.save();

    // Create Notification for Admin/SuperAdmin
    const adminUsers = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    const notifs = adminUsers.map(admin => ({
      forUserId: admin._id.toString(),
      type: 'new_guest_submission',
      message: `🔔 Guest ${name} (${cleanMobile}) submitted check-in details for verification`,
      relatedGuestId: profile._id.toString()
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.json({ message: 'Submission received successfully', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Logged-in Guest Profile & Verification Status & History
router.get('/my-profile', verifyToken, async (req, res) => {
  try {
    let profile = await GuestProfile.findOne({
      $or: [
        { userId: req.user.id },
        { mobile: req.user.mobile }
      ]
    });

    if (!profile) {
      profile = new GuestProfile({
        userId: req.user.id,
        name: req.user.name || 'Guest User',
        mobile: req.user.mobile || '9999999999',
        verificationStatus: 'pending'
      });
      await profile.save();
    }

    // Fetch stays history for this guest
    const stays = await Stay.find({ mobile: profile.mobile }).sort({ createdAt: -1 });

    res.json({ profile, stays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Logged-in Guest Profile & Documents
router.put('/my-profile', verifyToken, async (req, res) => {
  try {
    const { name, address, idType, idNumberFull, idDocUrl } = req.body;
    let profile = await GuestProfile.findOne({
      $or: [
        { userId: req.user.id },
        { mobile: req.user.mobile }
      ]
    });

    if (!profile) {
      profile = new GuestProfile({
        userId: req.user.id,
        name: req.user.name || name,
        mobile: req.user.mobile,
        verificationStatus: 'pending'
      });
    }

    if (name) profile.name = name;
    if (address) profile.address = address;
    if (idType) profile.idType = idType;
    if (idNumberFull) {
      profile.idNumberFull = idNumberFull;
      profile.idNumberMasked = `XXXX-XXXX-${idNumberFull.slice(-4)}`;
    }
    let cleanDocUrl = processImageUrl(idDocUrl);
    if (cleanDocUrl) {
      profile.idDocuments.unshift({ url: cleanDocUrl, type: 'Self ID Proof', uploadedAt: new Date() });
    }
    profile.verificationStatus = 'pending';
    profile.updatedAt = new Date();
    await profile.save();

    // Create Notification for Admin/SuperAdmin on profile update
    const adminUsers = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    const notifs = adminUsers.map(admin => ({
      forUserId: admin._id.toString(),
      type: 'guest_updated',
      message: `🔔 Guest ${profile.name} (${profile.mobile}) updated profile & ID proof for verification`,
      relatedGuestId: profile._id.toString()
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.json({ message: 'Profile updated and submitted for verification', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Admin/SuperAdmin: Get Pending Verification Queue (Supports /pending & /pending-verification)
router.get(['/pending', '/pending-verification'], verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const pending = await GuestProfile.find({ verificationStatus: 'pending' }).sort({ updatedAt: -1 });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin/SuperAdmin: Search Guest Master Repository
router.get('/search', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      const all = await GuestProfile.find().sort({ updatedAt: -1 }).limit(50);
      return res.json(all);
    }

    const regex = new RegExp(q, 'i');
    const matches = await GuestProfile.find({
      $or: [{ name: regex }, { mobile: regex }, { idNumberFull: regex }]
    }).sort({ updatedAt: -1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin/SuperAdmin: Full Guest Database Repository (Supports /master & /master-database)
router.get(['/master', '/master-database'], verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const profiles = await GuestProfile.find().sort({ updatedAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Admin/SuperAdmin: Approve / Reject / Update Guest Status (Supports POST/PUT /verify & /verify/:id)
const handleVerify = async (req, res) => {
  try {
    const guestId = req.params.id || req.body.guestId;
    const { status, updatedFields } = req.body;
    const profile = await GuestProfile.findById(guestId);
    if (!profile) return res.status(404).json({ error: 'Guest profile not found' });

    if (updatedFields) {
      Object.assign(profile, updatedFields);
    }

    profile.verificationStatus = status || 'valid';
    profile.verifiedBy = req.user ? req.user.id : null;
    profile.updatedAt = new Date();
    await profile.save();

    res.json({ message: `Guest verification status set to ${profile.verificationStatus}`, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post(['/verify', '/verify/:id'], verifyToken, roleCheck(['admin', 'superadmin']), handleVerify);
router.put(['/verify', '/verify/:id'], verifyToken, roleCheck(['admin', 'superadmin']), handleVerify);

// 8. Admin/SuperAdmin: Upsert Guest Profile
router.post('/profile', verifyToken, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const { mobile, name, address, idType, idNumberFull, idDocUrl } = req.body;
    if (!mobile || !name) return res.status(400).json({ error: 'Mobile and Name are required' });

    const cleanMobile = mobile.trim();
    let profile = await GuestProfile.findOne({ mobile: cleanMobile });
    const maskedId = idNumberFull ? `XXXX-XXXX-${idNumberFull.slice(-4)}` : 'XXXX-XXXX-9012';

    let cleanDocUrl = processImageUrl(idDocUrl);
    if (!profile) {
      profile = new GuestProfile({
        name,
        mobile: cleanMobile,
        address: address || '',
        idType: idType || 'Aadhaar Card',
        idNumberFull: idNumberFull || '',
        idNumberMasked: maskedId,
        verificationStatus: 'valid',
        idDocuments: cleanDocUrl ? [{ url: cleanDocUrl, type: 'ID Proof', uploadedAt: new Date() }] : []
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
      if (cleanDocUrl) {
        profile.idDocuments.unshift({ url: cleanDocUrl, type: 'ID Proof', uploadedAt: new Date() });
      }
    }
    await profile.save();

    res.json({ message: 'Guest profile saved', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

