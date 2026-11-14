const User = require('../models/User');

// @desc    Search/list registered users (to add to project or assign to task)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email role createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
