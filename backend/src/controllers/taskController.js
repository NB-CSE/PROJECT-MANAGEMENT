const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// Helper to check user project access
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isOwner = project.ownerId.toString() === userId.toString();
  const isMember = project.memberIds.some((id) => id.toString() === userId.toString());
  return { project, hasAccess: isOwner || isMember, isOwner };
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId, assignedTo, priority, status, search, overdue } = req.query;
    const userId = req.user._id;

    let query = {};

    if (projectId) {
      const access = await checkProjectAccess(projectId, userId);
      if (!access) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      if (!access.hasAccess) {
        return res.status(403).json({ success: false, message: 'Not authorized for this project' });
      }
      query.projectId = projectId;
    } else {
      // Find all projects user has access to
      const userProjects = await Project.find({
        $or: [{ ownerId: userId }, { memberIds: userId }]
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      query.projectId = { $in: projectIds };
    }

    if (assignedTo) {
      if (assignedTo === 'me') {
        query.assignedTo = userId;
      } else if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'Completed' };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name status')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name status ownerId memberIds');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const access = await checkProjectAccess(task.projectId._id, req.user._id);
    if (!access || !access.hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title and projectId are required'
      });
    }

    const access = await checkProjectAccess(projectId, req.user._id);
    if (!access) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (!access.hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate: dueDate || null
    });

    await Activity.create({
      projectId,
      taskId: task._id,
      userId: req.user._id,
      action: `Created task "${task.title}"`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name status');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const access = await checkProjectAccess(task.projectId, req.user._id);
    if (!access || !access.hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    const { title, description, assignedTo, priority, status, dueDate } = req.body;
    const oldStatus = task.status;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    let activityAction = `Updated task "${task.title}"`;
    if (status && status !== oldStatus) {
      activityAction = `Moved "${task.title}" from ${oldStatus} to ${status}`;
    }

    await Activity.create({
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user._id,
      action: activityAction
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name status');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status only (for Kanban board quick drag/drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['To Do', 'In Progress', 'Review', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be To Do, In Progress, Review, or Completed'
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const access = await checkProjectAccess(task.projectId, req.user._id);
    if (!access || !access.hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await Activity.create({
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user._id,
      action: `Moved "${task.title}" from ${oldStatus} to ${status}`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name status');

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const access = await checkProjectAccess(task.projectId, req.user._id);
    if (!access || !access.hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    await Activity.create({
      projectId: task.projectId,
      userId: req.user._id,
      action: `Deleted task "${task.title}"`
    });

    await Task.findByIdAndDelete(task._id);

    res.status(200).json({
      success: true,
      message: 'Task removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
