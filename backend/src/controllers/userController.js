const User = require('../models/User');
const store = require('../config/inMemoryStore');
const { getDbStatus } = require('../config/db');

// @desc    Get all users for project assignment dropdown
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      const users = await User.find().select('name email role createdAt');
      return res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } else {
      const users = store.users.map((u) => {
        const { passwordHash, ...safe } = u;
        return safe;
      });
      return res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
