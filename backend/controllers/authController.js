const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const login = async (req, res) => {
  try {
    const { mobile, username, password, role } = req.body;
    const identifier = mobile || username;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Mobile/Username and password are required' });
    }

    const cleanId = String(identifier).trim();

    // Query user by mobile, username, email, or name
    let user = await User.findOne({
      $or: [
        { mobile: cleanId },
        { username: cleanId },
        { email: cleanId },
        { name: cleanId }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const normRole = user.role ? user.role.toLowerCase() : 'guest';
    const token = jwt.sign({ userId: user._id, role: normRole }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: normRole,
        username: user.username,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server authentication error' });
  }
};

const getMe = async (req, res) => {
  try {
    return res.json(req.user);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve current user session' });
  }
};

module.exports = { login, getMe };
