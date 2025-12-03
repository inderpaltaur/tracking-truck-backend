import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Staff from '../models/Staff.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, name, role, phone, address } = req.body;

    // Validate role
    const validRoles = ['super_admin', 'admin', 'manager', 'staff'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Valid role is required. Choose from: super_admin, admin, manager, staff' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with pending approval status
    const user = await User.create({
      email,
      password,
      name,
      role,
      phone,
      address,
      approvalStatus: 'pending'
    });

    // Create staff record for tracking
    await Staff.create({
      name: user.name,
      role: role.replace('_', ' '),
      department: getDepartmentByRole(role),
      contact: user.email,
      user: user._id,
      active: 'No' // Will be activated upon approval
    });

    res.status(201).json({
      message: 'Registration successful. Your account is pending approval by an administrator.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to determine department by role
const getDepartmentByRole = (role) => {
  const departmentMap = {
    'super_admin': 'Operations',
    'admin': 'Operations',
    'manager': 'Operations',
    'staff': 'Operations'
  };
  return departmentMap[role] || 'Operations';
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is approved
    if (user.approvalStatus === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending approval. Please wait for an administrator to approve your account.',
        approvalStatus: 'pending'
      });
    }

    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({
        message: 'Your account has been rejected. Reason: ' + (user.rejectionReason || 'Not specified'),
        approvalStatus: 'rejected'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// @desc    Get all pending users (for super admin approval)
// @route   GET /api/auth/pending-users
// @access  Private (Super Admin only)
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      count: pendingUsers.length,
      users: pendingUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Super Admin, Manager)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve user
// @route   PUT /api/auth/approve/:userId
// @access  Private (Super Admin only)
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.approvalStatus === 'approved') {
      return res.status(400).json({ message: 'User is already approved' });
    }

    user.approvalStatus = 'approved';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    // Activate staff record
    await Staff.findOneAndUpdate(
      { user: userId },
      { active: 'Yes' }
    );

    res.json({
      message: 'User approved successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject user
// @route   PUT /api/auth/reject/:userId
// @access  Private (Super Admin only)
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.approvalStatus = 'rejected';
    user.rejectionReason = reason || 'Not specified';
    user.isActive = false;
    await user.save();

    // Deactivate staff record
    await Staff.findOneAndUpdate(
      { user: userId },
      { active: 'No' }
    );

    res.json({
      message: 'User rejected successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  register,
  login,
  getMe,
  logout,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser
};