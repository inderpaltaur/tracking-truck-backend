import Agreement from '../models/Agreement.js';

// @desc    Get all agreements with filters
// @route   GET /api/agreements
// @access  Private
const getAgreements = async (req, res) => {
  try {
    const { q, status, agreementType, staff } = req.query;

    let filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { terms: { $regex: q, $options: 'i' } }
      ];
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (agreementType && agreementType !== 'ALL') {
      filter.agreementType = agreementType;
    }

    if (staff) {
      filter.staff = staff;
    }

    const agreements = await Agreement.find(filter)
      .populate('staff', 'name department contact')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(agreements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single agreement
// @route   GET /api/agreements/:id
// @access  Private
const getAgreementById = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id)
      .populate('staff', 'name department contact')
      .populate('createdBy', 'name');

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create agreement
// @route   POST /api/agreements
// @access  Private (admin only)
const createAgreement = async (req, res) => {
  try {
    const agreementData = { ...req.body, createdBy: req.user._id };
    const agreement = await Agreement.create(agreementData);
    const populatedAgreement = await Agreement.findById(agreement._id)
      .populate('staff', 'name department')
      .populate('createdBy', 'name');

    res.status(201).json(populatedAgreement);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate entry' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update agreement
// @route   PUT /api/agreements/:id
// @access  Private (admin only)
const updateAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('staff', 'name department')
     .populate('createdBy', 'name');

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete agreement
// @route   DELETE /api/agreements/:id
// @access  Private (admin only)
const deleteAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findByIdAndDelete(req.params.id);

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    res.json({ message: 'Agreement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update agreement status
// @route   PATCH /api/agreements/:id/status
// @access  Private (admin only)
const updateAgreementStatus = async (req, res) => {
  try {
    const { status, signedDate } = req.body;
    const updateData = { status };

    if (status === 'Active' && signedDate) {
      updateData.signedDate = signedDate;
    }

    const agreement = await Agreement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('staff', 'name department')
     .populate('createdBy', 'name');

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getAgreements,
  getAgreementById,
  createAgreement,
  updateAgreement,
  deleteAgreement,
  updateAgreementStatus
};