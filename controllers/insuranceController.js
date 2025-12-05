import Insurance from '../models/Insurance.js';
import Trailer from '../models/Trailer.js';

// @desc    Get all insurance policies with filters
// @route   GET /api/insurance
// @access  Private
const getInsurancePolicies = async (req, res) => {
  try {
    const { status, verificationStatus, trailer, expiringSoon } = req.query;

    let filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      filter.verificationStatus = verificationStatus;
    }

    if (trailer) {
      filter.trailer = trailer;
    }

    // Filter for policies expiring within next 30 days
    if (expiringSoon === 'true') {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      filter.expiryDate = {
        $gte: now,
        $lte: thirtyDaysFromNow
      };
    }

    const policies = await Insurance.find(filter)
      .populate('trailer', 'trailerNo description vinNo licensePlate status')
      .populate('verifiedBy', 'name email')
      .populate('documents.documentId')
      .sort({ expiryDate: 1 });

    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get insurance statistics for dashboard
// @route   GET /api/insurance/stats
// @access  Private
const getInsuranceStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const [
      totalPolicies,
      activePolicies,
      expiredPolicies,
      expiringPolicies,
      pendingVerification,
      verified,
      rejected
    ] = await Promise.all([
      Insurance.countDocuments(),
      Insurance.countDocuments({ status: 'active' }),
      Insurance.countDocuments({ status: 'expired' }),
      Insurance.countDocuments({
        expiryDate: { $gte: now, $lte: thirtyDaysFromNow },
        status: { $ne: 'expired' }
      }),
      Insurance.countDocuments({ verificationStatus: 'pending' }),
      Insurance.countDocuments({ verificationStatus: 'verified' }),
      Insurance.countDocuments({ verificationStatus: 'rejected' })
    ]);

    // Get reminder stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const remindersSent = await Insurance.countDocuments({
      lastNotificationSent: { $gte: currentMonth }
    });

    res.json({
      totalPolicies,
      activePolicies,
      expiredPolicies,
      expiringPolicies,
      remindersSent,
      pendingVerification,
      verified,
      rejected,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single insurance policy
// @route   GET /api/insurance/:id
// @access  Private
const getInsurancePolicyById = async (req, res) => {
  try {
    const policy = await Insurance.findById(req.params.id)
      .populate('trailer', 'trailerNo description vinNo licensePlate status')
      .populate('verifiedBy', 'name email')
      .populate('documents.documentId');

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create insurance policy
// @route   POST /api/insurance
// @access  Private
const createInsurancePolicy = async (req, res) => {
  try {
    // Verify trailer exists
    if (req.body.trailer) {
      const trailerExists = await Trailer.findById(req.body.trailer);
      if (!trailerExists) {
        return res.status(404).json({ message: 'Trailer not found' });
      }
    }

    const policy = await Insurance.create(req.body);

    const populatedPolicy = await Insurance.findById(policy._id)
      .populate('trailer', 'trailerNo description vinNo licensePlate status')
      .populate('verifiedBy', 'name email')
      .populate('documents.documentId');

    res.status(201).json(populatedPolicy);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Policy number already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update insurance policy
// @route   PUT /api/insurance/:id
// @access  Private
const updateInsurancePolicy = async (req, res) => {
  try {
    const policy = await Insurance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('trailer', 'trailerNo description vinNo licensePlate status')
      .populate('verifiedBy', 'name email')
      .populate('documents.documentId');

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json(policy);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Policy number already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Delete insurance policy
// @route   DELETE /api/insurance/:id
// @access  Private
const deleteInsurancePolicy = async (req, res) => {
  try {
    const policy = await Insurance.findByIdAndDelete(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json({ message: 'Insurance policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Link DocuSign envelope to insurance policy
// @route   PATCH /api/insurance/:id/docusign
// @access  Private
const linkDocuSignEnvelope = async (req, res) => {
  try {
    const { docusignEnvelopeId, documentId } = req.body;

    const policy = await Insurance.findByIdAndUpdate(
      req.params.id,
      { docusignEnvelopeId, documentId },
      { new: true, runValidators: true }
    )
      .populate('customer', 'name contact type')
      .populate('documentId');

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark notification as sent
// @route   PATCH /api/insurance/:id/notify
// @access  Private
const markNotificationSent = async (req, res) => {
  try {
    const policy = await Insurance.findByIdAndUpdate(
      req.params.id,
      { lastNotificationSent: new Date() },
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify insurance policy (Manager/Admin only)
// @route   PATCH /api/insurance/:id/verify
// @access  Private (Manager/Admin)
const verifyInsurancePolicy = async (req, res) => {
  try {
    const { userId } = req.body; // Pass user ID from auth middleware

    const policy = await Insurance.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: 'verified',
        verifiedBy: userId,
        verifiedAt: new Date(),
        rejectionReason: '',
      },
      { new: true, runValidators: true }
    )
      .populate('trailer', 'trailerNo description vinNo licensePlate status')
      .populate('verifiedBy', 'name email');

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject insurance policy (Manager/Admin only)
// @route   PATCH /api/insurance/:id/reject
// @access  Private (Manager/Admin)
const rejectInsurancePolicy = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const policy = await Insurance.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: 'rejected',
        verifiedBy: userId,
        verifiedAt: new Date(),
        rejectionReason: reason,
      },
      { new: true, runValidators: true }
    )
      .populate('trailer', 'trailerNo description vinNo licensePlate status')
      .populate('verifiedBy', 'name email');

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add document to insurance policy
// @route   POST /api/insurance/:id/documents
// @access  Private
const addDocumentToPolicy = async (req, res) => {
  try {
    const { documentId, documentType } = req.body;

    const policy = await Insurance.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    policy.documents.push({
      documentId,
      documentType: documentType || 'Policy Document',
      uploadedAt: new Date(),
    });

    await policy.save();

    const populatedPolicy = await Insurance.findById(policy._id)
      .populate('trailer', 'trailerNo description vinNo licensePlate status')
      .populate('verifiedBy', 'name email')
      .populate('documents.documentId');

    res.json(populatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getInsurancePolicies,
  getInsuranceStats,
  getInsurancePolicyById,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  linkDocuSignEnvelope,
  markNotificationSent,
  verifyInsurancePolicy,
  rejectInsurancePolicy,
  addDocumentToPolicy,
};
