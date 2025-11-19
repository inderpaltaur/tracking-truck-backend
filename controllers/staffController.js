import Staff from '../models/Staff.js';

// @desc    Get all staff with filters
// @route   GET /api/staff
// @access  Private (admin only)
const getStaff = async (req, res) => {
  try {
    const { q, department, active } = req.query;
    
    let filter = {};
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { contact: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (department && department !== 'ALL') {
      filter.department = department;
    }
    
    if (active && active !== 'ALL') {
      filter.active = active;
    }
    
    const staff = await Staff.find(filter).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single staff
// @route   GET /api/staff/:id
// @access  Private
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create staff
// @route   POST /api/staff
// @access  Private (admin only)
const createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate entry' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private (admin only)
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private (admin only)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};