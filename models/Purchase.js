import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'expense'],
    required: true,
  },
  // For purchases
  itemName: {
    type: String,
    required: function() { return this.type === 'purchase'; }
  },
  quantity: {
    type: Number,
    required: function() { return this.type === 'purchase'; }
  },
  price: {
    type: Number,
    required: function() { return this.type === 'purchase'; }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: function() { return this.type === 'purchase'; }
  },
  // For expenses
  expenseType: {
    type: String,
    enum: ['fuel', 'maintenance', 'office', 'misc'],
    required: function() { return this.type === 'expense'; }
  },
  amount: {
    type: Number,
    required: function() { return this.type === 'expense'; }
  },
  // Common fields
  date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  document: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Virtual for total cost (for purchases)
purchaseSchema.virtual('totalCost').get(function() {
  if (this.type === 'purchase') {
    return this.quantity * this.price;
  }
  return this.amount;
});

// Ensure virtual fields are serialized
purchaseSchema.set('toJSON', { virtuals: true });
purchaseSchema.set('toObject', { virtuals: true });

export default mongoose.model('Purchase', purchaseSchema);