const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'crown_hotel_secret_key_2026';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token claims' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role ? user.role.toLowerCase() : 'guest',
      name: user.name,
      mobile: user.mobile,
      username: user.username,
      email: user.email
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    // SuperAdmin has full authority over all Admin actions (STEP 3)
    if (userRole === 'superadmin') {
      return next();
    }

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this action' });
    }

    next();
  };
};

module.exports = { verifyToken, roleCheck, JWT_SECRET };

