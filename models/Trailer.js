import mongoose from 'mongoose';

const trailerSchema = new mongoose.Schema({
  trailerNo: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  vinNo: {
    type: String,
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
  },
  regExp: {
    type: Date,
    required: true,
  },
  oldLicensePlate: {
    type: String,
  },
  value: {
    type: Number,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  advance: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Trailer', trailerSchema);