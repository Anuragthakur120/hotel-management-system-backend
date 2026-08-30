const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const GuestProfile = require('../models/GuestProfile');
const { login, getMe } = require('../controllers/authController');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

// Primary Auth Endpoints
router.post('/login', login);
router.get('/me', verifyToken, getMe);

// Guest Registration Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, password } = req.body;
    if (!mobile || !password || !name) return res.status(400).json({ error: 'Name, Mobile and PIN/Password are required' });

    let user = await User.findOne({ mobile: mobile.trim() });
    if (user) return res.status(400).json({ error: 'Mobile number already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    user = new User({
      role: 'guest',
      name: name.trim(),
      mobile: mobile.trim(),
      email: `${mobile.trim()}@guest.crownhotel.com`,
      passwordHash: hash
    });
    await user.save();

    // Create initial GuestProfile if missing
    let profile = await GuestProfile.findOne({ mobile: user.mobile });
    if (!profile) {
      profile = new GuestProfile({
        userId: user._id,
        name: user.name,
        mobile: user.mobile,
        verificationStatus: 'pending'
      });
      await profile.save();
    }

    res.json({ message: 'Registration successful', user: { id: user._id, name: user.name, mobile: user.mobile, role: 'guest' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SuperAdmin: Provision Admin Account
router.post('/create-admin', verifyToken, roleCheck(['superadmin']), async (req, res) => {
  try {
    const { username, fullName, password, mobile } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const cleanUsername = username.trim();
    const cleanMobile = mobile ? mobile.trim() : ('98' + Math.floor(10000000 + Math.random() * 90000000));

    const existing = await User.findOne({
      $or: [
        { username: cleanUsername },
        { mobile: cleanMobile }
      ]
    });
    if (existing) return res.status(400).json({ error: 'Username or Mobile already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const adminUser = new User({
      role: 'admin',
      name: fullName ? fullName.trim() : cleanUsername,
      username: cleanUsername,
      mobile: cleanMobile,
      email: `${cleanUsername}@crownhotel.com`,
      passwordHash: hash
    });
    await adminUser.save();

    res.json({
      message: 'Admin account created successfully',
      admin: {
        id: adminUser._id,
        username: adminUser.username,
        fullName: adminUser.name,
        role: 'admin',
        mobile: adminUser.mobile,
        createdAt: adminUser.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SuperAdmin: List Admin Accounts
router.get('/admins', verifyToken, roleCheck(['superadmin']), async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-passwordHash');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SuperAdmin: Edit Admin Account
router.put('/admin/:id', verifyToken, roleCheck(['superadmin']), async (req, res) => {
  try {
    const { name, username, mobile, password } = req.body;
    const adminUser = await User.findById(req.params.id);
    if (!adminUser) return res.status(404).json({ error: 'Admin account not found' });

    if (name) adminUser.name = name;
    if (username) adminUser.username = username;
    if (mobile) adminUser.mobile = mobile;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      adminUser.passwordHash = await bcrypt.hash(password, salt);
    }
    await adminUser.save();

    res.json({ message: 'Admin account updated successfully', admin: adminUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SuperAdmin: Delete Admin Account
router.delete('/admin/:id', verifyToken, roleCheck(['superadmin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

