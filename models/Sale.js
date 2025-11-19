import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  item: {
    type: String,
    enum: ['truck', 'miscellaneous'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'credit', 'other'],
    required: true,
  },
  notes: {
    type: String,
  },
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'agreement'],
      required: true,
    },
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Virtual for total amount
saleSchema.virtual('totalAmount').get(function() {
  return this.quantity * this.price;
});

// Ensure virtual fields are serialized
saleSchema.set('toJSON', { virtuals: true });
saleSchema.set('toObject', { virtuals: true });

export default mongoose.model('Sale', saleSchema);