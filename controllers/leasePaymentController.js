import LeasePayment from '../models/LeasePayment.js';
import Trailer from '../models/Trailer.js';

// @desc    Get all lease payments with filters
// @route   GET /api/lease-payments
// @access  Private
const getLeasePayments = async (req, res) => {
  try {
    const { status, trailer, customer, dateFrom, dateTo } = req.query;

    let filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (trailer) {
      filter.trailer = trailer;
    }

    if (customer) {
      filter.customer = customer;
    }

    if (dateFrom || dateTo) {
      filter.dueDate = {};
      if (dateFrom) filter.dueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.dueDate.$lte = new Date(dateTo);
    }

    const payments = await LeasePayment.find(filter)
      .populate('trailer', 'trailerNo description rent licensePlate')
      .populate('customer', 'name contact email')
      .populate('markedBy', 'name')
      .sort({ dueDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single lease payment
// @route   GET /api/lease-payments/:id
// @access  Private
const getLeasePaymentById = async (req, res) => {
  try {
    const payment = await LeasePayment.findById(req.params.id)
      .populate('trailer', 'trailerNo description rent licensePlate vinNo')
      .populate('customer', 'name contact email address')
      .populate('markedBy', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Lease payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create lease payment
// @route   POST /api/lease-payments
// @access  Private
const createLeasePayment = async (req, res) => {
  try {
    const payment = await LeasePayment.create(req.body);
    const populatedPayment = await LeasePayment.findById(payment._id)
      .populate('trailer', 'trailerNo description rent')
      .populate('customer', 'name contact');

    res.status(201).json(populatedPayment);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate entry' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Generate lease payments for a trailer
// @route   POST /api/lease-payments/generate
// @access  Private
const generateLeasePayments = async (req, res) => {
  try {
    const { trailerId, months } = req.body;

    if (!trailerId || !months) {
      return res.status(400).json({ message: 'Trailer ID and number of months are required' });
    }

    const trailer = await Trailer.findById(trailerId);
    if (!trailer) {
      return res.status(404).json({ message: 'Trailer not found' });
    }

    if (!trailer.leasedTo) {
      return res.status(400).json({ message: 'Trailer is not leased to anyone' });
    }

    const payments = [];
    const startDate = trailer.leaseStart || new Date();

    for (let i = 0; i < months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);

      // Check if payment already exists for this month
      const existingPayment = await LeasePayment.findOne({
        trailer: trailerId,
        dueDate: {
          $gte: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
          $lte: new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0)
        }
      });

      if (!existingPayment) {
        const payment = await LeasePayment.create({
          trailer: trailerId,
          customer: trailer.leasedTo,
          amount: trailer.rent,
          dueDate: dueDate,
        });
        payments.push(payment);
      }
    }

    res.status(201).json({
      message: `Generated ${payments.length} lease payment entries`,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark payment as received
// @route   PATCH /api/lease-payments/:id/mark-paid
// @access  Private
const markPaymentReceived = async (req, res) => {
  try {
    const { paidAmount, paymentMethod, notes, receiptNumber, transactionId } = req.body;

    const payment = await LeasePayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Lease payment not found' });
    }

    payment.paidAmount = paidAmount || payment.amount;
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod;
    payment.notes = notes;
    payment.receiptNumber = receiptNumber;
    payment.transactionId = transactionId;
    payment.markedBy = req.user._id;
    payment.status = payment.paidAmount >= payment.amount ? 'paid' : 'partial';

    await payment.save();

    const updatedPayment = await LeasePayment.findById(payment._id)
      .populate('trailer', 'trailerNo description rent')
      .populate('customer', 'name contact')
      .populate('markedBy', 'name');

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update lease payment
// @route   PUT /api/lease-payments/:id
// @access  Private
const updateLeasePayment = async (req, res) => {
  try {
    const payment = await LeasePayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('trailer', 'trailerNo description rent')
     .populate('customer', 'name contact')
     .populate('markedBy', 'name');

    if (!payment) {
      return res.status(404).json({ message: 'Lease payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete lease payment
// @route   DELETE /api/lease-payments/:id
// @access  Private
const deleteLeasePayment = async (req, res) => {
  try {
    const payment = await LeasePayment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Lease payment not found' });
    }

    res.json({ message: 'Lease payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get lease payment statistics
// @route   GET /api/lease-payments/stats
// @access  Private
const getLeasePaymentStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    let dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.dueDate = {};
      if (dateFrom) dateFilter.dueDate.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.dueDate.$lte = new Date(dateTo);
    }

    const stats = await LeasePayment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          overdueCount: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
          },
          totalExpected: { $sum: '$amount' },
          totalReceived: { $sum: '$paidAmount' },
        }
      }
    ]);

    const result = stats[0] || {
      totalPayments: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      totalExpected: 0,
      totalReceived: 0,
    };

    // Calculate upcoming payments (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingCount = await LeasePayment.countDocuments({
      status: { $in: ['pending', 'partial'] },
      dueDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
    });

    result.upcomingPayments = upcomingCount;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getLeasePayments,
  getLeasePaymentById,
  createLeasePayment,
  generateLeasePayments,
  markPaymentReceived,
  updateLeasePayment,
  deleteLeasePayment,
  getLeasePaymentStats,
};
