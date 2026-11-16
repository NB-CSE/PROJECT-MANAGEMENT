const jwt = require('jsonwebtoken');
const User = require('../models/User');
const store = require('../config/inMemoryStore');
const { getDbStatus } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'taskflow-dev-secret-key-987654321'
      );

      let user;
      if (getDbStatus()) {
        user = await User.findById(decoded.id).select('-passwordHash');
      } else {
        const found = store.findUserById(decoded.id);
        if (found) {
          const { passwordHash, ...safeUser } = found;
          user = safeUser;
        }
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists or session is invalid.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };
