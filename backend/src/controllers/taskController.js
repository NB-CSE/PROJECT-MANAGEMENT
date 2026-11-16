const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const store = require('../config/inMemoryStore');
const { getDbStatus } = require('../config/db');

// @desc    Get tasks with filters
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedTo, search } = req.query;

    if (getDbStatus()) {
      let query = {};

      if (projectId) {
        query.projectId = projectId;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      if (priority && priority !== 'All') {
        query.priority = priority;
      }

      if (assignedTo) {
        if (assignedTo === 'me') {
          query.assignedTo = req.user._id;
        } else if (assignedTo === 'unassigned') {
          query.assignedTo = null;
        } else {
          query.assignedTo = assignedTo;
        }
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const tasks = await Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: tasks.length,
        tasks
      });
    } else {
      const tasks = store.findTasks({
        projectId,
        status,
        priority,
        assignedTo,
        search,
        userId: req.user._id
      });
      return res.status(200).json({
        success: true,
        count: tasks.length,
        tasks
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      const task = await Task.findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('projectId', 'name');

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      return res.status(200).json({ success: true, task });
    } else {
      const task = store.findTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      return res.status(200).json({ success: true, task });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project ID are required'
      });
    }

    const taskData = {
      title,
      description: description || '',
      projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate: dueDate || null
    };

    if (getDbStatus()) {
      const task = await Task.create(taskData);
      await Activity.create({
        projectId: task.projectId,
        taskId: task._id,
        userId: req.user._id,
        action: `Created task "${task.title}"`
      });

      const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('projectId', 'name');

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task: populatedTask
      });
    } else {
      const task = store.createTask(taskData);
      const populated = store.findTaskById(task._id);
      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task: populated
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      let task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

      Object.assign(task, req.body);
      await task.save();

      const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('projectId', 'name');

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task: populatedTask
      });
    } else {
      const updated = store.updateTask(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
      const populated = store.findTaskById(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task: populated
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Quick status change (Kanban drag-and-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['To Do', 'In Progress', 'Review', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    if (getDbStatus()) {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

      task.status = status;
      await task.save();

      await Activity.create({
        projectId: task.projectId,
        taskId: task._id,
        userId: req.user._id,
        action: `Moved "${task.title}" to ${status}`
      });

      return res.status(200).json({
        success: true,
        message: `Task moved to ${status}`,
        task
      });
    } else {
      const updated = store.updateTask(req.params.id, { status });
      if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
      return res.status(200).json({
        success: true,
        message: `Task moved to ${status}`,
        task: updated
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

      await Activity.deleteMany({ taskId: task._id });
      await task.deleteOne();

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } else {
      store.deleteTask(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    }
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
