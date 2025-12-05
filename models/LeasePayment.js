import mongoose from 'mongoose';

const leasePaymentSchema = new mongoose.Schema({
  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trailer',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paidDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partial'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'credit', 'online', 'cheque', 'other'],
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
  },
  receiptNumber: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for faster queries
leasePaymentSchema.index({ trailer: 1, dueDate: -1 });
leasePaymentSchema.index({ customer: 1, dueDate: -1 });
leasePaymentSchema.index({ status: 1, dueDate: 1 });

// Virtual for remaining amount
leasePaymentSchema.virtual('remainingAmount').get(function() {
  return this.amount - this.paidAmount;
});

// Update status based on due date and payment
leasePaymentSchema.pre('save', function(next) {
  if (this.paidAmount >= this.amount) {
    this.status = 'paid';
  } else if (this.paidAmount > 0 && this.paidAmount < this.amount) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate && this.status !== 'paid') {
    this.status = 'overdue';
  }
  next();
});

// Ensure virtual fields are serialized
leasePaymentSchema.set('toJSON', { virtuals: true });
leasePaymentSchema.set('toObject', { virtuals: true });

export default mongoose.model('LeasePayment', leasePaymentSchema);
