import Call from '../models/Call.js';

// @desc    Get all calls with filters
// @route   GET /api/calls
// @access  Private
const getCalls = async (req, res) => {
  try {
    const { q, status, callType, purpose, staff, dateFrom, dateTo } = req.query;

    let filter = {};

    if (q) {
      filter.$or = [
        { callerName: { $regex: q, $options: 'i' } },
        { callerContact: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ];
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (callType && callType !== 'ALL') {
      filter.callType = callType;
    }

    if (purpose && purpose !== 'ALL') {
      filter.purpose = purpose;
    }

    if (staff) {
      filter.staff = staff;
    }

    if (dateFrom || dateTo) {
      filter.callDate = {};
      if (dateFrom) filter.callDate.$gte = new Date(dateFrom);
      if (dateTo) filter.callDate.$lte = new Date(dateTo);
    }

    const calls = await Call.find(filter)
      .populate('staff', 'name department')
      .populate('createdBy', 'name')
      .sort({ callDate: -1 });

    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single call
// @route   GET /api/calls/:id
// @access  Private
const getCallById = async (req, res) => {
  try {
    const call = await Call.findById(req.params.id)
      .populate('staff', 'name department contact')
      .populate('createdBy', 'name');

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.json(call);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create call
// @route   POST /api/calls
// @access  Private
const createCall = async (req, res) => {
  try {
    const callData = { ...req.body, createdBy: req.user._id };
    const call = await Call.create(callData);
    const populatedCall = await Call.findById(call._id)
      .populate('staff', 'name department')
      .populate('createdBy', 'name');

    res.status(201).json(populatedCall);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate entry' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update call
// @route   PUT /api/calls/:id
// @access  Private
const updateCall = async (req, res) => {
  try {
    const call = await Call.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('staff', 'name department')
     .populate('createdBy', 'name');

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.json(call);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete call
// @route   DELETE /api/calls/:id
// @access  Private
const deleteCall = async (req, res) => {
  try {
    const call = await Call.findByIdAndDelete(req.params.id);

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.json({ message: 'Call deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get call statistics
// @route   GET /api/calls/stats
// @access  Private
const getCallStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    let dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.callDate = {};
      if (dateFrom) dateFilter.callDate.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.callDate.$lte = new Date(dateTo);
    }

    const stats = await Call.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          inboundCalls: {
            $sum: { $cond: [{ $eq: ['$callType', 'Inbound'] }, 1, 0] }
          },
          outboundCalls: {
            $sum: { $cond: [{ $eq: ['$callType', 'Outbound'] }, 1, 0] }
          },
          completedCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          missedCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'Missed'] }, 1, 0] }
          },
          totalDuration: { $sum: '$duration' },
          followUpRequired: {
            $sum: { $cond: ['$followUpRequired', 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalCalls: 0,
      inboundCalls: 0,
      outboundCalls: 0,
      completedCalls: 0,
      missedCalls: 0,
      totalDuration: 0,
      followUpRequired: 0
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getCalls,
  getCallById,
  createCall,
  updateCall,
  deleteCall,
  getCallStats
};