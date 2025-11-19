import RecurringCheck from '../models/RecurringCheck.js';

// @desc    Get all recurring checks
// @route   GET /api/recurring-checks
// @access  Private
const getRecurringChecks = async (req, res) => {
  try {
    const checks = await RecurringCheck.find().populate('trailer').populate('assignedTo').sort({ nextDue: 1 });
    res.json(checks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create recurring check
// @route   POST /api/recurring-checks
// @access  Private
const createRecurringCheck = async (req, res) => {
  try {
    const check = await RecurringCheck.create(req.body);
    res.status(201).json(check);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update recurring check
// @route   PUT /api/recurring-checks/:id
// @access  Private
const updateRecurringCheck = async (req, res) => {
  try {
    const check = await RecurringCheck.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!check) {
      return res.status(404).json({ message: 'Recurring check not found' });
    }
    
    res.json(check);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete recurring check
// @route   DELETE /api/recurring-checks/:id
// @access  Private
const deleteRecurringCheck = async (req, res) => {
  try {
    const check = await RecurringCheck.findByIdAndDelete(req.params.id);
    
    if (!check) {
      return res.status(404).json({ message: 'Recurring check not found' });
    }
    
    res.json({ message: 'Recurring check deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getRecurringChecks,
  createRecurringCheck,
  updateRecurringCheck,
  deleteRecurringCheck
};