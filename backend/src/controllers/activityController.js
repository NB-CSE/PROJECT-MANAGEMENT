const Activity = require('../models/Activity');
const Project = require('../models/Project');
const store = require('../config/inMemoryStore');
const { getDbStatus } = require('../config/db');

// @desc    Get recent team activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDbStatus()) {
      const userProjects = await Project.find({
        $or: [{ ownerId: userId }, { memberIds: userId }]
      }).select('_id');

      const projectIds = userProjects.map(p => p._id);

      const activities = await Activity.find({ projectId: { $in: projectIds } })
        .populate('userId', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .limit(15);

      return res.status(200).json({
        success: true,
        count: activities.length,
        activities
      });
    } else {
      const activities = store.getActivities(userId);
      return res.status(200).json({
        success: true,
        count: activities.length,
        activities
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };
