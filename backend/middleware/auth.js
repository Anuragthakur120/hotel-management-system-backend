const { verifyToken, roleCheck, JWT_SECRET } = require('./authMiddleware');

module.exports = {
  authMiddleware: verifyToken,
  verifyToken,
  roleCheck,
  JWT_SECRET
};

