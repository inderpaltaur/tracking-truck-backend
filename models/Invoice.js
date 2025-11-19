import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  customer: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid'],
    default: 'draft',
  },
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    total: Number,
  }],
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.model('Invoice', invoiceSchema);