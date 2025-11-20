import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['revenue', 'expense'],
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Transport Services', 'Trailer Lease', 'Equipment Sales', 'Other Revenue',
      'Fuel', 'Maintenance', 'Insurance', 'Salaries', 'Office Supplies', 'Tolls', 'Repairs', 'Other Expense'
    ],
    required: true,
  },
  description: {
    type: String,
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trailer',
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Transaction', transactionSchema);