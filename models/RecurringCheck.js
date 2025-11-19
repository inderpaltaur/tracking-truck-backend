import mongoose from 'mongoose';

const recurringCheckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
  },
  nextDue: {
    type: Date,
    required: true,
  },
  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trailer',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue'],
    default: 'active',
  },
}, {
  timestamps: true,
});

export default mongoose.model('RecurringCheck', recurringCheckSchema);