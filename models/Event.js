import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['maintenance', 'inspection', 'repair', 'call', 'other'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trailer',
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  customer: {
    type: String,
  },
  duration: {
    type: Number, // in minutes
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Event', eventSchema);