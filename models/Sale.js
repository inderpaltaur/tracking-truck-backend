import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  item: {
    type: String,
    enum: ['truck', 'miscellaneous', 'trailer'],
    required: true,
  },
  quantity: {
    type: Number,
    required: function() { return this.item !== 'trailer'; },
    min: 1,
    default: function() { return this.item === 'trailer' ? 1 : undefined; }
  },
  price: {
    type: Number,
    required: function() { return this.item !== 'trailer'; },
    min: 0,
    default: function() { return this.item === 'trailer' ? 0 : undefined; }
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
    enum: ['cash', 'bank', 'credit', 'other', 'lease'],
    required: function() { return this.item !== 'trailer'; },
    default: function() { return this.item === 'trailer' ? 'lease' : undefined; }
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