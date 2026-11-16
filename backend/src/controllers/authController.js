const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const store = require('../config/inMemoryStore');
const { getDbStatus } = require('../config/db');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'taskflow-dev-secret-key-987654321',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailLower = email.toLowerCase().trim();

    if (getDbStatus()) {
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name.trim(),
        email: emailLower,
        passwordHash
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } else {
      const existing = store.findUserByEmail(emailLower);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = store.createUser({
        name: name.trim(),
        email: emailLower,
        passwordHash,
        role: 'Member'
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const emailLower = email.toLowerCase().trim();

    let user;
    if (getDbStatus()) {
      user = await User.findOne({ email: emailLower }).select('+passwordHash');
    } else {
      user = store.findUserByEmail(emailLower);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (getDbStatus()) {
      const user = await User.findById(req.user._id);
      return res.status(200).json({
        success: true,
        user
      });
    } else {
      const user = store.findUserById(req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { passwordHash, ...safeUser } = user;
      return res.status(200).json({
        success: true,
        user: safeUser
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (getDbStatus()) {
      const user = await User.findById(req.user._id);
      if (name) user.name = name;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } else {
      const user = store.findUserById(req.user._id);
      if (name) user.name = name;
      const { passwordHash, ...safeUser } = user;
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: safeUser
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
