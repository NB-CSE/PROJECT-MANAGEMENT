const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const store = require('../config/inMemoryStore');
const { getDbStatus } = require('../config/db');

// @desc    Get executive dashboard metrics & upcoming deadlines
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDbStatus()) {
      const userProjects = await Project.find({
        $or: [{ ownerId: userId }, { memberIds: userId }]
      })
        .populate('ownerId', 'name email')
        .populate('memberIds', 'name email')
        .sort({ updatedAt: -1 });

      const userProjectIds = userProjects.map((p) => p._id);
      const totalProjects = userProjects.length;
      const activeProjects = userProjects.filter((p) => p.status === 'Active').length;

      const userTasks = await Task.find({ projectId: { $in: userProjectIds } })
        .populate('projectId', 'name')
        .populate('assignedTo', 'name email');

      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;

      const overdueTasks = userTasks.filter((t) => {
        if (t.status === 'Completed' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      }).length;

      const taskStatusSummary = {
        'To Do': userTasks.filter((t) => t.status === 'To Do').length,
        'In Progress': userTasks.filter((t) => t.status === 'In Progress').length,
        'Review': userTasks.filter((t) => t.status === 'Review').length,
        'Completed': completedTasks
      };

      const upcomingDeadlines = userTasks
        .filter((t) => t.status !== 'Completed' && t.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      const recentActivities = await Activity.find({
        projectId: { $in: userProjectIds }
      })
        .populate('userId', 'name email')
        .populate('projectId', 'name')
        .populate('taskId', 'title')
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        data: {
          totalProjects,
          activeProjects,
          totalTasks,
          completedTasks,
          overdueTasks,
          taskStatusSummary,
          recentProjects: userProjects.slice(0, 4),
          upcomingDeadlines,
          recentActivities
        }
      });
    } else {
      const stats = store.getDashboardStats(userId);
      const userProjects = store.findProjectsByUser(userId);
      const recentActivities = store.getActivities(userId, 10);

      const totalTasks = (stats.taskStatusCounts['To Do'] || 0) +
        (stats.taskStatusCounts['In Progress'] || 0) +
        (stats.taskStatusCounts['Review'] || 0) +
        (stats.taskStatusCounts['Completed'] || 0);

      return res.status(200).json({
        success: true,
        data: {
          totalProjects: stats.totalProjects,
          activeProjects: stats.activeProjects,
          totalTasks,
          completedTasks: stats.completedTasks,
          overdueTasks: stats.overdueTasks,
          taskStatusSummary: stats.taskStatusCounts,
          recentProjects: userProjects.slice(0, 4),
          upcomingDeadlines: stats.upcomingTasks,
          recentActivities
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = getDashboardData;

module.exports = {
  getDashboardData,
  getDashboardStats
};
