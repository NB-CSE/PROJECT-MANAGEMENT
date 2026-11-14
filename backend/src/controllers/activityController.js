const Activity = require('../models/Activity');
const Project = require('../models/Project');

// @desc    Get activity logs (for a project or across all user's projects)
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { projectId, limit = 20 } = req.query;
    const userId = req.user._id;

    let query = {};

    if (projectId) {
      // Check project access
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      const isOwner = project.ownerId.toString() === userId.toString();
      const isMember = project.memberIds.some((id) => id.toString() === userId.toString());
      if (!isOwner && !isMember) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      query.projectId = projectId;
    } else {
      // Find all projects where user is owner or member
      const userProjects = await Project.find({
        $or: [{ ownerId: userId }, { memberIds: userId }]
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      query.projectId = { $in: projectIds };
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };
