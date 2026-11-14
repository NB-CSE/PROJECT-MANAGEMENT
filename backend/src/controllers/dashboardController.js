const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Get dashboard metrics and summaries
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find projects where user is owner or member
    const userProjects = await Project.find({
      $or: [{ ownerId: userId }, { memberIds: userId }]
    })
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email')
      .sort({ createdAt: -1 });

    const projectIds = userProjects.map((p) => p._id);

    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter((p) => p.status === 'Active').length;

    // Task counts across accessible projects
    const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      status: 'Completed'
    });
    const overdueTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() }
    });

    // Task status counts
    const statusCountsRaw = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const taskStatusSummary = {
      'To Do': 0,
      'In Progress': 0,
      'Review': 0,
      'Completed': 0
    };

    statusCountsRaw.forEach((item) => {
      if (taskStatusSummary[item._id] !== undefined) {
        taskStatusSummary[item._id] = item.count;
      }
    });

    // Recent projects with progress calculation (top 4)
    const recentProjectsWithStats = await Promise.all(
      userProjects.slice(0, 4).map(async (project) => {
        const pTotal = await Task.countDocuments({ projectId: project._id });
        const pCompleted = await Task.countDocuments({
          projectId: project._id,
          status: 'Completed'
        });
        const progress = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;

        return {
          _id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          deadline: project.deadline,
          membersCount: project.memberIds.length,
          totalTasks: pTotal,
          completedTasks: pCompleted,
          progress
        };
      })
    );

    // Upcoming deadlines (next 6 non-completed tasks sorted by due date)
    const upcomingDeadlines = await Task.find({
      projectId: { $in: projectIds },
      status: { $ne: 'Completed' },
      dueDate: { $ne: null }
    })
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .limit(6);

    // Recent activities (top 7)
    const recentActivities = await Activity.find({
      projectId: { $in: projectIds }
    })
      .populate('userId', 'name email')
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort({ timestamp: -1 })
      .limit(7);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        taskStatusSummary,
        recentProjects: recentProjectsWithStats,
        upcomingDeadlines,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardData };
