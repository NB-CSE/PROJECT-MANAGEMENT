const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Helper to calculate progress
const calculateProgress = async (projectId) => {
  const totalTasks = await Task.countDocuments({ projectId });
  if (totalTasks === 0) return 0;
  const completedTasks = await Task.countDocuments({ projectId, status: 'Completed' });
  return Math.round((completedTasks / totalTasks) * 100);
};

// @desc    Get all projects for current user (as owner or member)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const userId = req.user._id;

    let query = {
      $or: [{ ownerId: userId }, { memberIds: userId }]
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email')
      .sort({ createdAt: -1 });

    // Calculate dynamic stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ projectId: project._id });
        const completedTasks = await Task.countDocuments({
          projectId: project._id,
          status: 'Completed'
        });
        const inProgressTasks = await Task.countDocuments({
          projectId: project._id,
          status: 'In Progress'
        });
        const overdueTasks = await Task.countDocuments({
          projectId: project._id,
          status: { $ne: 'Completed' },
          dueDate: { $lt: new Date() }
        });
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          progress
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithStats.length,
      projects: projectsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization: must be owner or member
    const isOwner = project.ownerId._id.toString() === req.user._id.toString();
    const isMember = project.memberIds.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this project'
      });
    }

    const totalTasks = await Task.countDocuments({ projectId: project._id });
    const completedTasks = await Task.countDocuments({
      projectId: project._id,
      status: 'Completed'
    });
    const inProgressTasks = await Task.countDocuments({
      projectId: project._id,
      status: 'In Progress'
    });
    const overdueTasks = await Task.countDocuments({
      projectId: project._id,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() }
    });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        progress,
        isOwner
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, deadline, status, memberIds } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const members = Array.isArray(memberIds) ? memberIds : [];
    if (!members.includes(req.user._id.toString())) {
      members.push(req.user._id);
    }

    const project = await Project.create({
      name,
      description,
      ownerId: req.user._id,
      memberIds: members,
      startDate: startDate || new Date(),
      deadline: deadline || null,
      status: status || 'Active'
    });

    await Activity.create({
      projectId: project._id,
      userId: req.user._id,
      action: `Created project "${project.name}"`
    });

    const populatedProject = await Project.findById(project._id)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: {
        ...populatedProject.toObject(),
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
        isOwner: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Must be owner or member to update
    const isOwner = project.ownerId.toString() === req.user._id.toString();
    const isMember = project.memberIds.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const { name, description, startDate, deadline, status } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate) project.startDate = startDate;
    if (deadline !== undefined) project.deadline = deadline;
    if (status) project.status = status;

    await project.save();

    await Activity.create({
      projectId: project._id,
      userId: req.user._id,
      action: `Updated project details for "${project.name}"`
    });

    const updated = await Project.findById(project._id)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner can delete project
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project'
      });
    }

    // Delete tasks and activities associated with this project
    await Task.deleteMany({ projectId: project._id });
    await Activity.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Owner only)
const addMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can manage members'
      });
    }

    const { email, userId } = req.body;
    let userToAdd;

    if (userId) {
      userToAdd = await User.findById(userId);
    } else if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase() });
    }

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided email or ID'
      });
    }

    if (project.memberIds.some((id) => id.toString() === userToAdd._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    project.memberIds.push(userToAdd._id);
    await project.save();

    await Activity.create({
      projectId: project._id,
      userId: req.user._id,
      action: `Added ${userToAdd.name} (${userToAdd.email}) to project`
    });

    const populated = await Project.findById(project._id)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email');

    res.status(200).json({
      success: true,
      message: `${userToAdd.name} added to the project`,
      project: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Owner only)
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can remove members'
      });
    }

    const memberIdToRemove = req.params.userId;

    if (project.ownerId.toString() === memberIdToRemove) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner'
      });
    }

    project.memberIds = project.memberIds.filter(
      (id) => id.toString() !== memberIdToRemove
    );
    await project.save();

    // Unassign tasks assigned to this user in this project
    await Task.updateMany(
      { projectId: project._id, assignedTo: memberIdToRemove },
      { $set: { assignedTo: null } }
    );

    const removedUser = await User.findById(memberIdToRemove);
    const memberName = removedUser ? removedUser.name : 'A member';

    await Activity.create({
      projectId: project._id,
      userId: req.user._id,
      action: `Removed ${memberName} from project`
    });

    const populated = await Project.findById(project._id)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member removed from project',
      project: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
