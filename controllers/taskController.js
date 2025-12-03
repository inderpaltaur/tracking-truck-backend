import Task from '../models/Task.js';
import Staff from '../models/Staff.js';

// @desc    Get all tasks with filters
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { q, status, priority, assignedTo } = req.query;

    let filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (priority && priority !== 'ALL') {
      filter.priority = priority;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name department')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name department contact')
      .populate('assignedBy', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    // Check if assignment is allowed based on roles
    const canAssign = await checkAssignmentPermission(req.user, assignedTo);
    if (!canAssign.allowed) {
      return res.status(403).json({ message: canAssign.message });
    }

    const taskData = { ...req.body, assignedBy: req.user._id };
    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name department')
      .populate('assignedBy', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate entry' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name department')
     .populate('assignedBy', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    if (status === 'Completed') {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name department')
     .populate('assignedBy', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to check if assignment is allowed
const checkAssignmentPermission = async (user, assignedToId) => {
  // If user is admin, allow all assignments
  if (user.role === 'admin') {
    return { allowed: true };
  }

  // Find assigner's staff record
  const assignerStaff = await Staff.findOne({ user: user._id });
  if (!assignerStaff) {
    return { allowed: false, message: 'Staff record not found for user' };
  }

  // Find assignee's staff record
  const assigneeStaff = await Staff.findById(assignedToId);
  if (!assigneeStaff) {
    return { allowed: false, message: 'Assignee not found' };
  }

  // Define role hierarchy (lower number = higher rank)
  const roleHierarchy = {
    'Super Admin': 1,
    'Manager': 2,
    'Worker': 3,
    'Staff': 3 // Alias for Worker
  };

  const assignerLevel = roleHierarchy[assignerStaff.role];
  const assigneeLevel = roleHierarchy[assigneeStaff.role];

  if (!assignerLevel || !assigneeLevel) {
    return { allowed: false, message: 'Invalid role' };
  }

  // Super Admin can assign to anyone
  if (assignerStaff.role === 'Super Admin') {
    return { allowed: true };
  }

  // Manager can assign to Worker or lower (but since Worker is lowest, to Worker)
  if (assignerStaff.role === 'Manager' && assigneeStaff.role === 'Worker') {
    return { allowed: true };
  }

  // Worker cannot assign
  if (assignerStaff.role === 'Worker') {
    return { allowed: false, message: 'Workers cannot assign tasks' };
  }

  return { allowed: false, message: 'Cannot assign to higher or equal rank' };
};

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
};