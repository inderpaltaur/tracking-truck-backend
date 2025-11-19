import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
    enum: ['Operations', 'Sales', 'HR', 'Finance', 'Drivers'],
  },
  contact: {
    type: String,
    required: true,
  },
  active: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Staff', staffSchema);