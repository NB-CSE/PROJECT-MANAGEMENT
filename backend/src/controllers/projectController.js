const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const store = require('../config/inMemoryStore');
const { getDbStatus } = require('../config/db');

// @desc    Get all projects for current user (as owner or member)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const userId = req.user._id;

    if (getDbStatus()) {
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
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return {
            ...project.toObject(),
            totalTasks,
            completedTasks,
            inProgressTasks,
            progress
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: projectsWithStats.length,
        projects: projectsWithStats
      });
    } else {
      const projects = store.findProjectsForUser(userId, { search, status });
      return res.status(200).json({
        success: true,
        count: projects.length,
        projects
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with members & task stats
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      const project = await Project.findById(req.params.id)
        .populate('ownerId', 'name email')
        .populate('memberIds', 'name email');

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const totalTasks = await Task.countDocuments({ projectId: project._id });
      const completedTasks = await Task.countDocuments({ projectId: project._id, status: 'Completed' });
      const inProgressTasks = await Task.countDocuments({ projectId: project._id, status: 'In Progress' });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return res.status(200).json({
        success: true,
        project: {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          inProgressTasks,
          progress
        }
      });
    } else {
      const project = store.findProjectById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      return res.status(200).json({ success: true, project });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, deadline, status, category, githubUrl, liveUrl, techStack } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const projectData = {
      name,
      description: description || '',
      ownerId: req.user._id,
      memberIds: [req.user._id],
      startDate: startDate || new Date(),
      deadline: deadline || null,
      status: status || 'Active',
      category: category || 'Web Application',
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      techStack: Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()) : [])
    };

    if (getDbStatus()) {
      const project = await Project.create(projectData);
      await Activity.create({
        projectId: project._id,
        userId: req.user._id,
        action: `Created project "${project.name}"`
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project: {
          ...project.toObject(),
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          progress: 0
        }
      });
    } else {
      const project = store.createProject(projectData);
      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project: {
          ...project,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          progress: 0
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      let project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      Object.assign(project, req.body);
      await project.save();

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project
      });
    } else {
      const updated = store.updateProject(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: 'Project not found' });
      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project: updated
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project & associated tasks
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      await Task.deleteMany({ projectId: project._id });
      await Activity.deleteMany({ projectId: project._id });
      await project.deleteOne();

      return res.status(200).json({
        success: true,
        message: 'Project and all associated tasks removed successfully'
      });
    } else {
      const deleted = store.deleteProject(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' });
      return res.status(200).json({
        success: true,
        message: 'Project and all associated tasks removed successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide an email' });

    if (getDbStatus()) {
      const userToAdd = await User.findOne({ email: email.toLowerCase() });
      if (!userToAdd) return res.status(404).json({ success: false, message: 'No registered user found with that email' });

      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      if (project.memberIds.includes(userToAdd._id)) {
        return res.status(400).json({ success: false, message: 'User is already a member of this project' });
      }

      project.memberIds.push(userToAdd._id);
      await project.save();

      return res.status(200).json({
        success: true,
        message: `${userToAdd.name} added to project`,
        member: { _id: userToAdd._id, name: userToAdd.name, email: userToAdd.email }
      });
    } else {
      const userToAdd = store.findUserByEmail(email.toLowerCase());
      if (!userToAdd) return res.status(404).json({ success: false, message: 'No registered user found with that email' });

      const project = store.findProjectById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const memberIds = project.memberIds.map(m => m._id ? m._id.toString() : m.toString());
      if (memberIds.includes(userToAdd._id.toString())) {
        return res.status(400).json({ success: false, message: 'User is already a member of this project' });
      }

      project.memberIds.push({ _id: userToAdd._id, name: userToAdd.name, email: userToAdd.email });
      return res.status(200).json({
        success: true,
        message: `${userToAdd.name} added to project`,
        member: { _id: userToAdd._id, name: userToAdd.name, email: userToAdd.email }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    if (getDbStatus()) {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      if (project.ownerId.toString() === userId) {
        return res.status(400).json({ success: false, message: 'Cannot remove the project owner' });
      }

      project.memberIds = project.memberIds.filter(m => m.toString() !== userId);
      await project.save();

      return res.status(200).json({ success: true, message: 'Member removed from project' });
    } else {
      const project = store.findProjectById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      project.memberIds = (project.memberIds || []).filter(m => (m._id ? m._id.toString() : m.toString()) !== userId);
      return res.status(200).json({ success: true, message: 'Member removed from project' });
    }
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
